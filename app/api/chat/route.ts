import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  buildLetterPrompt,
  buildSpecialtyPrompt,
} from "@/lib/prompts";
import { retrieveArticles, type RetrievedArticle } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";
interface ClientMessage {
  role: ChatRole;
  content: string;
}

interface ChatBody {
  messages: ClientMessage[];
  mode?: "chat" | "letter" | "specialty";
  domain?: string | null;     // ex: "travail", "famille", "harcelement-scolaire"...
  codeSlug?: string | null;   // optionnel : forcer un code spécifique
}

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
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquant côté serveur." },
      { status: 500 }
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const { messages, mode = "chat", domain = null, codeSlug = null } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Aucun message fourni." }, { status: 400 });
  }

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

    return NextResponse.json({ error: "Mode inconnu." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    console.error("[api/chat] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
