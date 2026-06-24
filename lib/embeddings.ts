// Embeddings via l'API Google Gemini — modèle gemini-embedding-001.
// Sortie ramenée à 768 dimensions (outputDimensionality), alignée sur la colonne
// `embedding vector(768)` de Supabase.
// Choix motivé : le free tier Gemini (~100 RPM / 250K TPM) tient une classe
// entière en simultané, contrairement à Voyage (3 RPM / 10K TPM).
// taskType distingue RETRIEVAL_QUERY (recherche) et RETRIEVAL_DOCUMENT
// (ingestion) pour une meilleure pertinence sémantique.

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

async function callGemini(
  inputs: string[],
  taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT",
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
    res = await fetch(`${GEMINI_BATCH_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Erreur réseau transitoire → quelques retries courts (le RAG dégrade sinon).
    if (retry < 3) {
      await new Promise((r) => setTimeout(r, 1000 * (retry + 1)));
      return callGemini(inputs, taskType, retry + 1);
    }
    throw err;
  }
  if ((res.status === 429 || res.status >= 500) && retry < 7) {
    const wait = Math.min(60000, 2000 * 2 ** retry);
    await new Promise((r) => setTimeout(r, wait));
    return callGemini(inputs, taskType, retry + 1);
  }
  if (!res.ok) {
    throw new Error(`Gemini ${res.status} — ${(await res.text()).slice(0, 300)}`);
  }
  const json = (await res.json()) as GeminiBatchResponse;
  return json.embeddings.map((e) => e.values);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await callGemini([query], "RETRIEVAL_QUERY");
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
    out.push(...(await callGemini(texts.slice(i, j), "RETRIEVAL_DOCUMENT")));
    i = j;
    if (i < texts.length) await new Promise((r) => setTimeout(r, subbatchPauseMs()));
  }
  return out;
}
