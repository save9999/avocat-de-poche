import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  buildSystemPrompt,
  buildLetterPrompt,
  buildSpecialtyPrompt,
  buildHandoffPrompt,
} from "@/lib/prompts";
import {
  retrieveArticles,
  formatArticlesForPrompt,
  type RetrievedArticle,
} from "@/lib/rag";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Validation Zod ──────────────────────────────────────────────────────────

const ClientMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000, "Message trop long (max 4000 caractères)."),
});

const ChatBodySchema = z.object({
  messages: z
    .array(ClientMessageSchema)
    .min(1, "Aucun message fourni.")
    .max(20, "Trop de messages (max 20)."),
  mode: z.enum(["chat", "letter", "specialty", "handoff"]).optional().default("chat"),
  domain: z
    .enum([
      "harcelement-scolaire",
      "travail",
      "logement",
      "consommation",
      "famille",
      "penal",
      "administratif",
      "numerique",
    ])
    .nullable()
    .optional()
    .default(null),
  codeSlug: z.string().max(100).nullable().optional().default(null),
});

type ChatBody = z.infer<typeof ChatBodySchema>;
type ClientMessage = z.infer<typeof ClientMessageSchema>;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_RAG_ARTICLES = 8;

function lastUserMessage(messages: ClientMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return null;
}

function ragQueryFromMessages(messages: ClientMessage[]): string {
  // Concatène les 3 derniers tours utilisateur pour enrichir la recherche.
  const userMessages = messages.filter((m) => m.role === "user").slice(-3);
  return userMessages.map((m) => m.content).join("\n");
}

export async function POST(req: NextRequest) {
  // ─── Rate-limit par IP ────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0", "Retry-After": "3600" },
      }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquant côté serveur." },
      { status: 500 }
    );
  }

  // ─── Validation Zod ───────────────────────────────────────────────────────
  let rawJson: unknown;
  try {
    rawJson = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = ChatBodySchema.safeParse(rawJson);
  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message ?? "Données invalides.";
    return NextResponse.json({ error: detail }, { status: 400 });
  }

  const body: ChatBody = parsed.data;
  const { messages, mode, domain, codeSlug } = body;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // ─── Mode CHAT : RAG + LLM ──────────────────────────────────────────
    if (mode === "chat") {
      let articles: RetrievedArticle[] = [];
      try {
        const query = ragQueryFromMessages(messages) || lastUserMessage(messages) || "";
        if (query.trim().length > 0) {
          articles = await retrieveArticles(query, {
            matchCount: MAX_RAG_ARTICLES,
            domain,
            codeSlug,
          });
        }
      } catch (ragErr) {
        // Le RAG peut échouer (Supabase down, OpenAI down, base vide…) — on dégrade gracieusement.
        console.warn("[api/chat] RAG indisponible :", (ragErr as Error).message);
      }

      const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const completion = await client.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: buildSystemPrompt(articles),
        messages: conversation,
      });

      const reply =
        completion.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n") || "";

      return NextResponse.json({
        reply,
        sources: articles.map((a) => ({
          reference: a.reference,
          code: a.code,
          similarity: a.similarity,
          url: a.source_url,
        })),
      });
    }

    // ─── Mode LETTER : rédaction de lettre formelle ────────────────────
    if (mode === "letter") {
      const ctx = messages
        .map((m) => `${m.role === "user" ? "Utilisateur" : "Avocat de Poche"} : ${m.content}`)
        .join("\n\n");

      const out = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: buildLetterPrompt(ctx, domain),
        messages: [
          { role: "user", content: "Rédige la lettre maintenant au format markdown." },
        ],
      });

      const letter =
        out.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n") || "";

      return NextResponse.json({ letter });
    }

    // ─── Mode SPECIALTY : routing avocat ──────────────────────────────
    if (mode === "specialty") {
      const ctx = messages
        .map((m) => `${m.role === "user" ? "Utilisateur" : "Avocat de Poche"} : ${m.content}`)
        .join("\n\n");

      const out = await client.messages.create({
        model: MODEL,
        max_tokens: 400,
        system: buildSpecialtyPrompt(ctx, domain),
        messages: [
          { role: "user", content: "Analyse et renvoie le JSON de spécialité." },
        ],
      });

      const raw =
        out.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n") || "";

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let parsed: { specialty: string; label: string; keywords: string[]; reason: string } | null = null;
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* noop */ }
      }
      if (!parsed) {
        parsed = {
          specialty: "droit-penal",
          label: "Droit pénal",
          keywords: ["plainte", "victime"],
          reason: "Orientation par défaut faute de classification claire.",
        };
      }
      return NextResponse.json(parsed);
    }

    // ─── Mode HANDOFF : dossier pré-analysé pour avocat ───────────────
    if (mode === "handoff") {
      const ctx = messages
        .map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"} : ${m.content}`)
        .join("\n\n");

      // On ré-interroge le RAG sur l'ensemble de la conversation utilisateur
      // pour fournir à la synthèse les articles les plus pertinents.
      let articles: RetrievedArticle[] = [];
      try {
        const query = ragQueryFromMessages(messages) || lastUserMessage(messages) || "";
        if (query.trim().length > 0) {
          articles = await retrieveArticles(query, {
            matchCount: MAX_RAG_ARTICLES,
            domain,
            codeSlug,
          });
        }
      } catch (ragErr) {
        console.warn("[api/chat handoff] RAG indisponible :", (ragErr as Error).message);
      }

      const out = await client.messages.create({
        model: MODEL,
        max_tokens: 1800,
        system: buildHandoffPrompt(ctx, formatArticlesForPrompt(articles), domain),
        messages: [
          { role: "user", content: "Rédige le dossier pré-analysé maintenant." },
        ],
      });

      const summary =
        out.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n") || "";

      return NextResponse.json({
        summary,
        sources: articles.map((a) => ({
          reference: a.reference,
          code: a.code,
          similarity: a.similarity,
          url: a.source_url,
        })),
      });
    }

    return NextResponse.json({ error: "Mode inconnu." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/chat] error:", message);
    return NextResponse.json(
      { error: "Une erreur interne est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
