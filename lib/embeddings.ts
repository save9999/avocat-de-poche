// Embeddings via l'API Google Gemini — modèle gemini-embedding-001.
// Sortie ramenée à 768 dimensions (outputDimensionality), alignée sur la colonne
// `embedding vector(768)` de la base.
// Choix motivé : le free tier Gemini (~100 RPM / 250K TPM) tient une classe
// entière en simultané, contrairement à Voyage (3 RPM / 10K TPM).
// taskType distingue RETRIEVAL_QUERY (recherche) et RETRIEVAL_DOCUMENT
// (ingestion) pour une meilleure pertinence sémantique.
//
// Deux profils de résilience cohabitent :
//   - embedQuery (chemin live, /api/chat) : une requête HTTP synchrone attend
//     la réponse — budget de retry serré pour ne jamais risquer de dépasser
//     le timeout de la fonction serverless.
//   - embedBatch (scripts d'ingestion hors-ligne) : peut se permettre d'être
//     patient face au rate limit, un run dure déjà plusieurs minutes.

import { fetchWithTimeout } from "./fetchTimeout";

const GEMINI_MODEL = "gemini-embedding-001";
const GEMINI_BATCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:batchEmbedContents`;
export const EMBEDDING_DIMENSIONS = 768;

// gemini-embedding-001 plafonne l'entrée à 2048 tokens (~8000 caractères).
const MAX_EMBED_CHARS = 8000;
// batchEmbedContents accepte au plus 100 requêtes par appel.
const MAX_BATCH = 100;
// Le free tier embedding plafonne à ~30K tokens/min : on borne chaque appel par
// budget de tokens (≈ chars/4) pour ne pas franchir le TPM en un seul batch, et
// on cadence les sous-appels. Surchargeable par env (les scripts d'ingestion
// passent en mode lent pour tenir le débit sur de gros volumes).
const DEFAULT_TOKEN_BUDGET = 15000;
const DEFAULT_SUBBATCH_PAUSE_MS = 1100;
const tokenBudget = () => Number(process.env.EMBED_TOKEN_BUDGET) || DEFAULT_TOKEN_BUDGET;
const subbatchPauseMs = () =>
  Number(process.env.EMBED_SUBBATCH_PAUSE_MS) || DEFAULT_SUBBATCH_PAUSE_MS;

function truncate(text: string): string {
  return text.length > MAX_EMBED_CHARS ? text.slice(0, MAX_EMBED_CHARS) : text;
}

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant");
  return apiKey;
}

interface GeminiBatchResponse {
  embeddings: Array<{ values: number[] }>;
}

interface RetryPolicy {
  fetchTimeoutMs: number;
  maxNetworkRetry: number;
  maxRateLimitRetry: number;
  rateLimitWaitMs: (retry: number) => number;
}

// Chemin live (/api/chat, via embedQuery) : une requête HTTP synchrone attend
// la réponse. Budget serré pour ne jamais risquer de dépasser le timeout de
// la fonction serverless — un échec ici dégrade proprement (RAG sans
// résultats), pas la peine d'insister longtemps.
const LIVE_POLICY: RetryPolicy = {
  fetchTimeoutMs: 6000,
  maxNetworkRetry: 1,
  maxRateLimitRetry: 1,
  rateLimitWaitMs: () => 1000,
};

// Chemin ingestion (scripts hors-ligne, via embedBatch) : un run dure déjà
// plusieurs minutes, on peut se permettre d'être patient face au rate limit
// free tier plutôt que de faire échouer tout le lot.
const BATCH_POLICY: RetryPolicy = {
  fetchTimeoutMs: 30000,
  maxNetworkRetry: 3,
  maxRateLimitRetry: 7,
  rateLimitWaitMs: (retry) => Math.min(60000, 2000 * 2 ** retry),
};

async function callGemini(
  inputs: string[],
  taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT",
  policy: RetryPolicy,
  retry = 0,
): Promise<number[][]> {
  const apiKey = getApiKey();
  const body = {
    requests: inputs.map((text) => ({
      model: `models/${GEMINI_MODEL}`,
      content: { parts: [{ text: truncate(text) }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    })),
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${GEMINI_BATCH_URL}?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      policy.fetchTimeoutMs,
    );
  } catch (err) {
    // Un timeout (AbortError) signifie que Gemini ne répond pas du tout : pas
    // la peine de réessayer immédiatement au même endroit.
    const isTimeout = err instanceof Error && err.name === "AbortError";
    if (!isTimeout && retry < policy.maxNetworkRetry) {
      await new Promise((r) => setTimeout(r, 1000 * (retry + 1)));
      return callGemini(inputs, taskType, policy, retry + 1);
    }
    throw err;
  }
  if ((res.status === 429 || res.status >= 500) && retry < policy.maxRateLimitRetry) {
    await new Promise((r) => setTimeout(r, policy.rateLimitWaitMs(retry)));
    return callGemini(inputs, taskType, policy, retry + 1);
  }
  if (!res.ok) {
    throw new Error(`Gemini ${res.status} — ${(await res.text()).slice(0, 300)}`);
  }
  const json = (await res.json()) as GeminiBatchResponse;
  return json.embeddings.map((e) => e.values);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await callGemini([query], "RETRIEVAL_QUERY", LIVE_POLICY);
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const out: number[][] = [];
  let i = 0;
  while (i < texts.length) {
    // Sous-lot borné par le budget de tokens ET le nombre max de requêtes.
    let j = i;
    let tokens = 0;
    const budget = tokenBudget();
    while (j < texts.length && j - i < MAX_BATCH) {
      const t = Math.ceil(Math.min(texts[j].length, MAX_EMBED_CHARS) / 4);
      if (j > i && tokens + t > budget) break;
      tokens += t;
      j++;
    }
    out.push(...(await callGemini(texts.slice(i, j), "RETRIEVAL_DOCUMENT", BATCH_POLICY)));
    i = j;
    if (i < texts.length) await new Promise((r) => setTimeout(r, subbatchPauseMs()));
  }
  return out;
}
