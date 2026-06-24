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

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import { embedBatch } from "../lib/embeddings";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("✖ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error("✖ GEMINI_API_KEY manquant.");
  process.exit(1);
}

const BATCH = 50;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

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
    const { data, error } = await supabase.rpc("articles_missing_embedding", {
      batch_limit: BATCH,
    });
    if (error) throw new Error(`articles_missing_embedding : ${error.message}`);
    const rows = (data as Row[]) ?? [];
    if (rows.length === 0) break;

    const texts = rows.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
    const embeddings = await embedBatch(texts);

    // Update ligne par ligne (embedding unique par id).
    await Promise.all(
      rows.map((r, i) =>
        supabase
          .from("legal_articles")
          .update({ embedding: embeddings[i] })
          .eq("id", r.id),
      ),
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
