const OPENAI_BASE_URL = "https://api.openai.com/v1";
const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

interface EmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

async function callOpenAI(inputs: string[]): Promise<EmbeddingResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY manquant");

  const res = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: inputs,
      encoding_format: "float",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI embeddings ${res.status} — ${text.slice(0, 300)}`);
  }

  return (await res.json()) as EmbeddingResponse;
}

export async function embedQuery(query: string): Promise<number[]> {
  const out = await callOpenAI([query]);
  return out.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const out = await callOpenAI(texts);
  return out.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
