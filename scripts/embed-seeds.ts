#!/usr/bin/env tsx
/**
 * Génère les embeddings OpenAI pour tous les articles `legal_articles`
 * dont `embedding IS NULL`. Idempotent : ré-exécutable en toute sécurité.
 *
 * Usage :  npm run embed
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("✖ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error("✖ OPENAI_API_KEY manquant.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BATCH = 96;
const PAGE = 500;

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function main() {
  let processed = 0;
  const started = Date.now();

  while (true) {
    const { data, error } = await supabase
      .from("legal_articles")
      .select("id, code, reference, content")
      .is("embedding", null)
      .limit(PAGE);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (let i = 0; i < data.length; i += BATCH) {
      const slice = data.slice(i, i + BATCH);
      const texts = slice.map(
        (r) => `${r.reference} (${r.code})\n\n${r.content as string}`
      );
      const embeddings = await embedBatch(texts);

      // Upsert un par un (l'API supabase-js fait du batching côté HTTP).
      const updates = slice.map((row, j) =>
        supabase
          .from("legal_articles")
          .update({
            embedding: embeddings[j],
            token_count: Math.ceil((row.content as string).length / 4),
          })
          .eq("id", row.id)
      );
      const results = await Promise.all(updates);
      const failed = results.filter((r) => r.error);
      if (failed.length) {
        console.error(`   ✖ ${failed.length} updates failed`);
        throw failed[0].error;
      }

      processed += slice.length;
      const rate = processed / ((Date.now() - started) / 1000);
      console.log(`   ✓ embedded ${processed} articles (${rate.toFixed(1)}/s)`);
    }
  }

  console.log(`\n✅ Terminé : ${processed} articles embedded en ${((Date.now() - started) / 1000).toFixed(0)}s.`);
}

main().catch((err) => {
  console.error("✖ Erreur :", err);
  process.exit(1);
});
