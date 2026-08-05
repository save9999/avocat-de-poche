#!/usr/bin/env tsx
/**
 * Génère les embeddings OpenAI pour tous les articles `legal_articles`
 * dont `embedding IS NULL`. Idempotent : ré-exécutable en toute sécurité.
 *
 * Usage :  npm run embed
 */

import { sql } from "./_db";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("✖ OPENAI_API_KEY manquant.");
  process.exit(1);
}

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
    const data = await sql<{
      id: number;
      code: string;
      reference: string;
      content: string;
    }>(
      `select id::int as id, code, reference, content
         from public.legal_articles
        where embedding is null
        limit $1`,
      [PAGE]
    );

    if (data.length === 0) break;

    for (let i = 0; i < data.length; i += BATCH) {
      const slice = data.slice(i, i + BATCH);
      const texts = slice.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
      const embeddings = await embedBatch(texts);

      // Une seule requête par lot : les valeurs voyagent en paramètres, et
      // `unnest` les rapproche des lignes à mettre à jour.
      await sql(
        `update public.legal_articles as a
            set embedding = v.embedding::vector,
                token_count = v.token_count,
                updated_at = now()
           from (
             select unnest($1::bigint[]) as id,
                    unnest($2::text[]) as embedding,
                    unnest($3::int[]) as token_count
           ) as v
          where a.id = v.id`,
        [
          slice.map((r) => r.id),
          embeddings.map((e) => `[${e.join(",")}]`),
          slice.map((r) => Math.ceil(r.content.length / 4)),
        ]
      );

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
