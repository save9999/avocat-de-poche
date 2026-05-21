import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  buildLetterPrompt,
  buildSpecialtyPrompt,
} from "@/lib/prompts";

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
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Clé API Anthropic manquante. Renseignez ANTHROPIC_API_KEY dans le fichier .env.local",
      },
      { status: 500 }
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { messages, mode = "chat" } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Aucun message fourni." },
      { status: 400 }
    );
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    if (mode === "letter") {
      const conversationContext = messages
        .map(
          (m) =>
            `${m.role === "user" ? "Utilisateur" : "Avocat de Poche"} : ${m.content}`
        )
        .join("\n\n");

      const letterResponse = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: buildLetterPrompt(conversationContext),
        messages: [
          {
            role: "user",
            content:
              "Rédige maintenant la lettre de signalement formelle au format markdown.",
          },
        ],
      });

      const letter =
        letterResponse.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n") || "";

      return NextResponse.json({ letter });
    }

    if (mode === "specialty") {
      const conversationContext = messages
        .map(
          (m) =>
            `${m.role === "user" ? "Utilisateur" : "Avocat de Poche"} : ${m.content}`
        )
        .join("\n\n");

      const specialtyResponse = await client.messages.create({
        model: MODEL,
        max_tokens: 400,
        system: buildSpecialtyPrompt(conversationContext),
        messages: [
          {
            role: "user",
            content:
              "Analyse la conversation et renvoie la spécialité au format JSON.",
          },
        ],
      });

      const raw =
        specialtyResponse.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n") || "";

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let parsed: {
        specialty: string;
        label: string;
        keywords: string[];
        reason: string;
      } | null = null;

      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = null;
        }
      }

      if (!parsed) {
        parsed = {
          specialty: "droit-penal-mineurs",
          label: "Droit pénal des mineurs",
          keywords: ["harcèlement scolaire", "mineur"],
          reason:
            "Orientation par défaut : harcèlement scolaire impliquant le plus souvent une victime mineure.",
        };
      }

      return NextResponse.json(parsed);
    }

    const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(),
      messages: conversation,
    });

    const reply =
      completion.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n") || "";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue côté serveur.";
    console.error("[api/chat] error:", message);
    return NextResponse.json(
      { error: `Erreur Anthropic : ${message}` },
      { status: 500 }
    );
  }
}
