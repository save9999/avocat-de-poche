#!/usr/bin/env tsx
/**
 * Ingestion des codes français via le dataset HuggingFace `erdal/legifrance`
 * (Parquet, 76 codes, ~226k articles, licence etalab-2.0).
 *
 * Pourquoi ce script (et non `ingest-legifrance.ts`) :
 *   DILA ne publie plus de dump global ; ses tar.gz quotidiens sont
 *   désormais des deltas (~5 Mo, ~7000 articles modifiés). Le dataset HF
 *   `erdal/legifrance` agrège la base complète, code par code.
 *
 * Usage :
 *   1. .env.local doit contenir OPENAI_API_KEY + SUPABASE_SERVICE_ROLE_KEY
 *   2. npm run ingest:hf                          → 10 codes par défaut
 *      npm run ingest:hf -- --codes code-civil    → un sous-ensemble
 *      npm run ingest:hf -- --dry-run             → sans embeddings/upsert
 *      npm run ingest:hf -- --limit 200           → tronque
 *
 * Coût indicatif : ~50k articles utiles → ~1 USD OpenAI + ~30-60 min.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

// hyparquet est ESM-only — chargement dynamique pour rester compatible tsx CJS.
type HyparquetModule = {
  asyncBufferFromFile: (path: string) => Promise<unknown>;
  parquetReadObjects: (opts: { file: unknown }) => Promise<unknown[]>;
};
let hyparquetModule: HyparquetModule | null = null;
async function getHyparquet(): Promise<HyparquetModule> {
  if (!hyparquetModule) {
    hyparquetModule = (await import("hyparquet")) as unknown as HyparquetModule;
  }
  return hyparquetModule;
}

loadEnv({ path: ".env.local" });

// ── Configuration ────────────────────────────────────────────────────────
const BATCH_EMBED = 96;
const BATCH_UPSERT = 200;
const MAX_CHARS = 12000;
const CACHE_DIR = path.join(os.homedir(), "legi-hf");

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

const DEFAULT_CODES = [
  "code-civil",
  "code-penal",
  "code-procedure-penale",
  "code-procedure-civile",
  "code-procedures-civiles-execution",
  "code-justice-penale-mineurs",
  "code-travail",
  "code-consommation",
  "code-construction-habitation",
  "code-education",
];

const CODE_LABELS: Record<string, string> = {
  "code-civil": "Code civil",
  "code-penal": "Code pénal",
  "code-procedure-penale": "Code de procédure pénale",
  "code-procedure-civile": "Code de procédure civile",
  "code-procedures-civiles-execution": "Code des procédures civiles d'exécution",
  "code-justice-penale-mineurs": "Code de la justice pénale des mineurs",
  "code-travail": "Code du travail",
  "code-consommation": "Code de la consommation",
  "code-construction-habitation": "Code de la construction et de l'habitation",
  "code-education": "Code de l'éducation",
};

const DOMAIN_RULES: Array<{ domain: string; codes: string[]; keywords: RegExp }> = [
  {
    domain: "harcelement-scolaire",
    codes: ["code-education", "code-justice-penale-mineurs"],
    keywords: /harc[èe]lement|scolaire|établissement scolaire|élève|coll[èe]ge|lyc[ée]e/i,
  },
  {
    domain: "travail",
    codes: ["code-travail"],
    keywords: /salari[ée]|employeur|licenciement|cong[ée]|pr[ée]avis|prud(homme|homal)/i,
  },
  {
    domain: "logement",
    codes: ["code-construction-habitation", "code-procedures-civiles-execution"],
    keywords: /bail|locataire|bailleur|logement|loyer|expulsion/i,
  },
  {
    domain: "consommation",
    codes: ["code-consommation"],
    keywords: /consommateur|garantie|r[ée]tractation|d[ée]marchage|cr[ée]dit/i,
  },
  {
    domain: "famille",
    codes: ["code-civil"],
    keywords: /mariage|divorce|pension|autorit[ée] parentale|filiation|succession|pacs/i,
  },
  {
    domain: "penal",
    codes: ["code-penal", "code-procedure-penale", "code-justice-penale-mineurs"],
    keywords: /infraction|peine|d[ée]lit|crime|plainte|victime|procureur/i,
  },
];

function inferDomains(codeSlug: string, content: string): string[] {
  const out = new Set<string>();
  for (const r of DOMAIN_RULES) {
    if (r.codes.includes(codeSlug)) out.add(r.domain);
    else if (r.keywords.test(content)) out.add(r.domain);
  }
  return [...out];
}

// ── CLI ──────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const out: { codes?: string[]; dryRun?: boolean; noEmbed?: boolean; limit?: number } = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--codes") out.codes = args[++i].split(",").map((s) => s.trim());
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--no-embed") out.noEmbed = true;
    else if (a === "--limit") out.limit = parseInt(args[++i], 10);
  }
  return out;
}

// ── Supabase ─────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Download ────────────────────────────────────────────────────────────
async function ensureLocalParquet(codeSlug: string): Promise<string> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const dest = path.join(CACHE_DIR, `${codeSlug}.parquet`);
  try {
    const stat = await fs.stat(dest);
    if (stat.size > 1024) return dest;
  } catch {
    /* not present */
  }
  const url = `https://huggingface.co/datasets/erdal/legifrance/resolve/main/data/${codeSlug}.parquet`;
  process.stdout.write(`   ↓ download ${codeSlug}.parquet `);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  console.log(`(${(buf.length / 1024 / 1024).toFixed(1)} Mo)`);
  return dest;
}

// ── Parquet → rows ──────────────────────────────────────────────────────
interface ParquetRow {
  id: string;
  num: string;
  texte: string;
  etat: string;
  dateDebut: unknown;
  dateFin: unknown;
  section_titre: string | null;
  context_full: string | null;
  version: string | null;
  code_name: string;
}

function toIsoDateOrNull(v: unknown): string | null {
  if (!v) return null;
  let d: Date | null = null;
  if (v instanceof Date) d = v;
  else if (typeof v === "number") d = new Date(v);
  else if (typeof v === "bigint") d = new Date(Number(v));
  else if (typeof v === "string") d = new Date(v);
  if (!d || Number.isNaN(d.getTime())) return null;
  const iso = d.toISOString();
  if (iso.startsWith("2999")) return null;
  return iso.slice(0, 10);
}

interface PendingRow {
  cid: string;
  code: string;
  code_slug: string;
  reference: string;
  title: string | null;
  content: string;
  date_debut: string | null;
  date_fin: string | null;
  etat: string;
  domains: string[];
  source_url: string;
}

function toPendingRow(row: ParquetRow, codeSlug: string, codeLabel: string): PendingRow | null {
  if (!row.id || !row.num) return null;
  if ((row.etat || "").toUpperCase() !== "VIGUEUR") return null;
  const texte = (row.texte || "").trim();
  if (texte.length < 5) return null;

  const numClean = String(row.num).trim();
  const reference = numClean.startsWith("Article") ? numClean : `Article ${numClean}`;

  return {
    cid: String(row.id).trim(),
    code: codeLabel,
    code_slug: codeSlug,
    reference,
    title: row.section_titre ? String(row.section_titre).slice(0, 500) : null,
    content: texte.slice(0, MAX_CHARS),
    date_debut: toIsoDateOrNull(row.dateDebut),
    date_fin: toIsoDateOrNull(row.dateFin),
    etat: "VIGUEUR",
    domains: inferDomains(codeSlug, texte),
    source_url: `https://www.legifrance.gouv.fr/codes/article_lc/${String(row.id).trim()}`,
  };
}

// ── Embeddings OpenAI ────────────────────────────────────────────────────
async function embedBatch(texts: string[], retry = 0): Promise<number[][]> {
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
  if (res.status === 429 && retry < 3) {
    const wait = 2000 * (retry + 1);
    console.warn(`   ⏱ 429 rate-limit, retry dans ${wait}ms…`);
    await new Promise((r) => setTimeout(r, wait));
    return embedBatch(texts, retry + 1);
  }
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

// ── Upsert ──────────────────────────────────────────────────────────────
async function flush(rows: PendingRow[], dryRun: boolean, noEmbed: boolean) {
  if (rows.length === 0) return;

  if (dryRun) {
    console.log(`   ↳ dry-run : ${rows.length} lignes prêtes (skip embed + upsert)`);
    return;
  }

  let embeddings: (number[] | null)[] = [];
  if (noEmbed) {
    embeddings = rows.map(() => null);
  } else {
    const real: number[][] = [];
    for (let i = 0; i < rows.length; i += BATCH_EMBED) {
      const slice = rows.slice(i, i + BATCH_EMBED);
      const texts = slice.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
      const out = await embedBatch(texts);
      real.push(...out);
    }
    embeddings = real;
  }

  const payload = rows.map((r, i) => ({
    ...r,
    embedding: embeddings[i],
    token_count: Math.ceil(r.content.length / 4),
  }));

  for (let i = 0; i < payload.length; i += BATCH_UPSERT) {
    const slice = payload.slice(i, i + BATCH_UPSERT);
    const { error } = await supabase
      .from("legal_articles")
      .upsert(slice, { onConflict: "cid" });
    if (error) {
      console.error("   ✖ upsert error :", error.message);
      throw error;
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const { codes, dryRun, noEmbed, limit } = parseArgs();
  const targetCodes = codes && codes.length > 0 ? codes : DEFAULT_CODES;

  console.log(
    `▸ Ingestion HF erdal/legifrance — ${targetCodes.length} code(s) : ${targetCodes.join(", ")}`
  );
  console.log(
    `   dry-run=${Boolean(dryRun)} no-embed=${Boolean(noEmbed)} ${limit ? `limit=${limit}` : ""}`
  );
  console.log();

  let total = 0;
  let kept = 0;
  const startedAt = Date.now();

  for (const codeSlug of targetCodes) {
    const codeLabel = CODE_LABELS[codeSlug] ?? codeSlug;
    console.log(`▸ ${codeLabel} (${codeSlug})`);

    const parquetPath = await ensureLocalParquet(codeSlug);
    const { asyncBufferFromFile, parquetReadObjects } = await getHyparquet();
    const file = await asyncBufferFromFile(parquetPath);
    const rows = (await parquetReadObjects({ file })) as ParquetRow[];
    console.log(`   ↳ ${rows.length} lignes brutes`);

    const seen = new Set<string>();
    const pending: PendingRow[] = [];
    for (const r of rows) {
      const p = toPendingRow(r, codeSlug, codeLabel);
      if (!p) continue;
      if (seen.has(p.cid)) continue; // certaines lignes Parquet ont le même cid (versions)
      seen.add(p.cid);
      pending.push(p);
      if (limit && kept + pending.length >= limit) break;
    }
    console.log(`   ↳ ${pending.length} VIGUEUR retenues (dédupliquées par cid)`);

    for (let i = 0; i < pending.length; i += BATCH_UPSERT) {
      const batch = pending.slice(i, i + BATCH_UPSERT);
      await flush(batch, Boolean(dryRun), Boolean(noEmbed));
      kept += batch.length;
      const rate = kept / ((Date.now() - startedAt) / 1000);
      console.log(`   ✓ ${kept} ingérés (${rate.toFixed(0)}/s)`);
      if (limit && kept >= limit) break;
    }

    total += pending.length;
    if (limit && kept >= limit) break;
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log();
  console.log(`✅ Terminé : ${kept} articles ingérés sur ${total} retenus en ${elapsed}s.`);
}

main().catch((err) => {
  console.error("\n✖ Erreur fatale :", err);
  process.exit(1);
});
