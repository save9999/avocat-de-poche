// Génération de texte via Google Gemini Flash (gemini-2.5-flash).
// Remplace l'appel Anthropic dans /api/chat : gratuit (free tier), tient l'usage
// scolaire visé. Conserve le contrat système + historique de messages de l'app.
// Le "thinking" est désactivé (thinkingBudget 0) : le contexte juridique est déjà
// fourni par le RAG, on privilégie une réponse rapide et directe.

// Le free tier Gemini renvoie fréquemment des 503 « high demand » par à-coups.
// On enchaîne plusieurs modèles en repli, chacun avec un retry court (le 503 se
// résout généralement en quelques secondes).
const MODELS = (process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash,gemini-2.0-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const MAX_RETRY_PER_MODEL = 4;

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callModel(
  model: string,
  apiKey: string,
  body: unknown,
  retry = 0,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (retry < 2) {
      await sleep(800 * (retry + 1));
      return callModel(model, apiKey, body, retry + 1);
    }
    throw err;
  }
  if ((res.status === 429 || res.status >= 500) && retry < MAX_RETRY_PER_MODEL) {
    await sleep(1500 * (retry + 1)); // backoff linéaire court (503 transitoire)
    return callModel(model, apiKey, body, retry + 1);
  }
  if (!res.ok) {
    throw new Error(`Gemini ${model} ${res.status} — ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as GenerateResponse;
  return (
    json.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

export async function generateText(
  system: string,
  messages: LlmMessage[],
  maxTokens = 1500,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant");

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const text = await callModel(model, apiKey, body);
      if (text.trim()) return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Aucun modèle Gemini n'a répondu.");
}
