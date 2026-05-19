import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildLetterPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";
interface ClientMessage {
  role: ChatRole;
  content: string;
}

interface ChatBody {
  messages: ClientMessage[];
  mode?: "chat" | "letter";
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

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
