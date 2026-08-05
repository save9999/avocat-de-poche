#!/usr/bin/env tsx
/**
 * Re-vectorise tous les articles dont l'embedding est NULL, avec le modèle
 * d'embedding courant (lib/embeddings → Gemini gemini-embedding-001, 768 dim).
 *
 * Cas d'usage : après un changement de modèle d'embedding (la migration
 * switch_embeddings_to_gemini_768 a remis tous les embeddings à NULL), ou pour
 * rattraper des lignes ingérées sans embedding.
 *
 * Resume-safe par nature : la RPC `articles_missing_embedding` ne renvoie que
 * les lignes encore NULL ; une relance reprend là où la précédente s'est arrêtée.
 *
 * Usage : npm run reembed
 */

import { sql } from "./_db";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import { embedBatch } from "../lib/embeddings";


if (!process.env.GEMINI_API_KEY) {
  console.error("✖ GEMINI_API_KEY manquant.");
  process.exit(1);
}

const BATCH = 50;
interface Row {
  id: number;
  reference: string;
  code: string;
  content: string;
}

async function main() {
  const startedAt = Date.now();
  let done = 0;

  for (;;) {
    const rows = await sql<Row>(
      `select id::int as id, reference, code, content
         from public.articles_missing_embedding($1)`,
      [BATCH],
    );
    if (rows.length === 0) break;

    const texts = rows.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
    const embeddings = await embedBatch(texts);

    // Une requête par lot : `unnest` rapproche chaque vecteur de sa ligne.
    await sql(
      `update public.legal_articles as a
          set embedding = v.embedding::vector, updated_at = now()
         from (
           select unnest($1::bigint[]) as id, unnest($2::text[]) as embedding
         ) as v
        where a.id = v.id`,
      [rows.map((r) => r.id), embeddings.map((e) => `[${e.join(",")}]`)],
    );

    done += rows.length;
    const rate = done / ((Date.now() - startedAt) / 1000 || 1);
    console.log(`   ✓ ${done} ré-embeddés (${rate.toFixed(1)}/s)`);
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`\n✅ Terminé : ${done} articles ré-embeddés en ${elapsed}s.`);
}

main().catch((err) => {
  console.error("\n✖ Erreur fatale :", err);
  process.exit(1);
});
