// Génération de texte via Google Gemini Flash (gemini-2.5-flash).
// Remplace l'appel Anthropic dans /api/chat : gratuit (free tier), tient l'usage
// scolaire visé. Conserve le contrat système + historique de messages de l'app.
// Le "thinking" est désactivé (thinkingBudget 0) : le contexte juridique est déjà
// fourni par le RAG, on privilégie une réponse rapide et directe.

import { fetchWithTimeout } from "./fetchTimeout";

// Le free tier Gemini renvoie fréquemment des 503 « high demand » par à-coups.
// On enchaîne plusieurs modèles en repli, chacun avec un retry court (le 503 se
// résout généralement en quelques secondes). Les variantes -lite ont des quotas
// journaliers gratuits (RPD) nettement plus élevés : quand les flash « pleins »
// sont épuisés, l'app continue en qualité légèrement moindre au lieu de tomber
// en mode dégradé.
const MODELS = (
  process.env.GEMINI_CHAT_MODEL ||
  "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash,gemini-2.0-flash-lite"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
// Budget serré à dessein : ceci répond à une requête HTTP synchrone (l'utilisateur
// attend dans le chat). Un budget trop généreux, multiplié par jusqu'à 4 modèles
// chaînés, risque de dépasser le timeout de la fonction serverless (Vercel) — la
// requête serait alors tuée par la plateforme AVANT que le fallback ne s'exécute,
// ce qui ressemble pour l'utilisateur à une application qui ne répond plus.
const MAX_RETRY_PER_MODEL = 2;
// Un 429 de quota journalier ne se résout pas en quelques secondes : un seul
// retry, puis on passe au modèle suivant de la chaîne.
const MAX_RETRY_429 = 1;
// Timeout dur par tentative réseau : si Gemini ne répond pas du tout (plutôt
// qu'une erreur explicite), on n'attend pas indéfiniment. Avec jusqu'à 4
// modèles chaînés, un budget trop long ferait dépasser le timeout de la
// fonction serverless bien avant que le fallback ne s'exécute.
const FETCH_TIMEOUT_MS = 8000;

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
    res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      FETCH_TIMEOUT_MS,
    );
  } catch (err) {
    // Un timeout (AbortError) signifie que Gemini ne répond pas du tout sur ce
    // modèle : pas la peine de réessayer au même endroit, on passe directement
    // au modèle suivant de la chaîne plutôt que de reproduire l'attente.
    const isTimeout = err instanceof Error && err.name === "AbortError";
    if (!isTimeout && retry < 1) {
      await sleep(800);
      return callModel(model, apiKey, body, retry + 1);
    }
    throw err;
  }
  const maxRetry = res.status === 429 ? MAX_RETRY_429 : MAX_RETRY_PER_MODEL;
  if ((res.status === 429 || res.status >= 500) && retry < maxRetry) {
    await sleep(800 * (retry + 1)); // backoff linéaire court (503 transitoire)
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
