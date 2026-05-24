#!/usr/bin/env tsx
/**
 * Ingestion des articles de loi français depuis un dump DILA / Légifrance LEGI.
 *
 * Source officielle :
 *   https://echanges.dila.gouv.fr/OPENDATA/LEGI/
 *   → télécharger le dernier LEGI_{YYYYMMDD-HHMMSS}.tar.gz (~5 Go décompressé)
 *
 * Usage :
 *   1. Télécharger + extraire le dump  →  ~/legi/
 *   2. Configurer .env.local (SUPABASE_*, OPENAI_API_KEY)
 *   3. npm run ingest -- --dir ~/legi --codes code_civil,code_penal
 *      (ou sans --codes pour ingérer TOUS les codes en vigueur)
 *
 * Le script :
 *   - parcourt récursivement les XML d'articles
 *   - extrait id (cid), numéro, contenu, état, dates, code parent
 *   - dérive automatiquement un ou plusieurs `domains` (heuristique mots-clés)
 *   - embed par batch OpenAI text-embedding-3-small
 *   - upsert dans Supabase (idempotent par `cid`)
 *
 * Coût indicatif : ~5 USD pour ~250 000 articles, ~3-5 h sur ADSL.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

// ── Configuration ─────────────────────────────────────────────────────────
const BATCH_EMBED = 96;        // OpenAI accepte jusqu'à 2048 mais batch raisonnable
const BATCH_UPSERT = 200;
const MAX_CHARS_PER_ARTICLE = 12000; // tronque les articles fleuves

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

// ── CLI ──────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const out: { dir?: string; codes?: string[]; dryRun?: boolean; limit?: number } = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dir") out.dir = args[++i];
    else if (a === "--codes") out.codes = args[++i].split(",").map((s) => s.trim());
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--limit") out.limit = parseInt(args[++i], 10);
  }
  if (!out.dir) {
    console.error("Usage: tsx scripts/ingest-legifrance.ts --dir /path/to/legi [--codes code_civil,code_penal] [--dry-run] [--limit N]");
    process.exit(1);
  }
  return out;
}

// ── Helpers ──────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  trimValues: true,
});

function slugifyCode(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Heuristique de classement par domaine fonctionnel (matérialise les 6 onglets UI).
const DOMAIN_RULES: Array<{ domain: string; codes: string[]; keywords: RegExp }> = [
  {
    domain: "harcelement-scolaire",
    codes: ["code-de-leducation", "code-de-l-education"],
    keywords: /harc[èe]lement|scolaire|établissement scolaire|élève|coll[èe]ge|lyc[ée]e/i,
  },
  {
    domain: "travail",
    codes: ["code-du-travail"],
    keywords: /salari[ée]|employeur|licenciement|cong[ée]|pr[ée]avis|prud(homme|homal)/i,
  },
  {
    domain: "logement",
    codes: [
      "code-de-la-construction-et-de-lhabitation",
      "code-des-procedures-civiles-dexecution",
    ],
    keywords: /bail|locataire|bailleur|logement|loyer|expulsion|cong[ée]\s+pour\s+vente/i,
  },
  {
    domain: "consommation",
    codes: ["code-de-la-consommation"],
    keywords: /consommateur|vente|garantie|r[ée]tractation|d[ée]marchage|cr[ée]dit/i,
  },
  {
    domain: "famille",
    codes: ["code-civil"],
    keywords: /mariage|divorce|pension|autorit[ée] parentale|filiation|succession|pacs/i,
  },
  {
    domain: "penal",
    codes: ["code-penal", "code-de-procedure-penale"],
    keywords: /infraction|peine|d[ée]lit|crime|plainte|victime|procureur/i,
  },
];

function inferDomains(codeSlug: string, content: string): string[] {
  const matched = new Set<string>();
  for (const rule of DOMAIN_RULES) {
    if (rule.codes.includes(codeSlug)) matched.add(rule.domain);
    else if (rule.keywords.test(content)) matched.add(rule.domain);
  }
  return Array.from(matched);
}

// ── Extraction XML ───────────────────────────────────────────────────────
interface ParsedArticle {
  cid: string;
  reference: string;
  title: string | null;
  content: string;
  etat: string;
  dateDebut: string | null;
  dateFin: string | null;
}

function extractTextContent(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextContent).join(" ");
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if ("#text" in obj) return String(obj["#text"]);
    return Object.values(obj).map(extractTextContent).join(" ");
  }
  return "";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseArticleXml(xml: string): ParsedArticle | null {
  let doc: Record<string, unknown>;
  try {
    doc = xmlParser.parse(xml);
  } catch {
    return null;
  }

  // Les dumps LEGI utilisent <ARTICLE> comme racine pour les articles.
  const root = (doc.ARTICLE ?? doc.article ?? doc) as Record<string, unknown>;
  if (!root || typeof root !== "object") return null;

  const meta = (root.META ?? root.meta) as Record<string, unknown> | undefined;
  const metaCommun = meta
    ? ((meta.META_COMMUN ?? meta.meta_commun) as Record<string, unknown> | undefined)
    : undefined;
  const metaSpec = meta
    ? ((meta.META_SPEC ?? meta.meta_spec) as Record<string, unknown> | undefined)
    : undefined;
  const metaArticle = metaSpec
    ? ((metaSpec.META_ARTICLE ?? metaSpec.meta_article) as Record<string, unknown> | undefined)
    : undefined;

  const cid = String(metaCommun?.ID ?? metaCommun?.id ?? "").trim();
  if (!cid) return null;

  const reference = String(
    metaArticle?.NUM ?? metaArticle?.num ?? metaArticle?.NUMERO ?? ""
  ).trim();
  if (!reference) return null;

  const etat = String(metaArticle?.ETAT ?? metaArticle?.etat ?? "VIGUEUR").toUpperCase();
  const dateDebut = (metaArticle?.DATE_DEBUT ?? metaArticle?.date_debut ?? null) as
    | string
    | null;
  const dateFin = (metaArticle?.DATE_FIN ?? metaArticle?.date_fin ?? null) as
    | string
    | null;

  const bloc = (root.BLOC_TEXTUEL ?? root.bloc_textuel) as
    | Record<string, unknown>
    | undefined;
  const contenuNode = bloc?.CONTENU ?? bloc?.contenu;
  const content = stripHtml(extractTextContent(contenuNode));
  if (!content || content.length < 5) return null;

  return {
    cid,
    reference: reference.startsWith("Article") ? reference : `Article ${reference}`,
    title: null,
    content: content.slice(0, MAX_CHARS_PER_ARTICLE),
    etat,
    dateDebut: dateDebut === "2999-01-01" ? null : (dateDebut as string | null),
    dateFin: dateFin === "2999-01-01" ? null : (dateFin as string | null),
  };
}

// ── Détection du code parent via path ───────────────────────────────────
const CODE_LABEL_OVERRIDES: Record<string, string> = {
  "code-civil": "Code civil",
  "code-penal": "Code pénal",
  "code-du-travail": "Code du travail",
  "code-de-la-consommation": "Code de la consommation",
  "code-de-leducation": "Code de l'éducation",
  "code-de-la-construction-et-de-lhabitation": "Code de la construction et de l'habitation",
  "code-de-procedure-penale": "Code de procédure pénale",
  "code-des-procedures-civiles-dexecution": "Code des procédures civiles d'exécution",
  "code-de-commerce": "Code de commerce",
  "code-general-des-impots": "Code général des impôts",
  "code-de-la-securite-sociale": "Code de la sécurité sociale",
  "code-de-la-sante-publique": "Code de la santé publique",
  "code-de-lentree-et-du-sejour-des-etrangers-et-du-droit-dasile":
    "Code de l'entrée et du séjour des étrangers et du droit d'asile",
};

function detectCodeFromPath(filePath: string): { codeSlug: string; codeLabel: string } | null {
  // Le path typique : .../code_et_TNC_en_vigueur/code_en_vigueur/LEGI/TEXT_LEGITEXT.../article/.../article_LEGIARTI...xml
  // On cherche un segment du type "code_de_xxx" ou "code_xxx".
  const segments = filePath.split(path.sep);
  for (const seg of segments) {
    if (/^code(_|$)/i.test(seg)) {
      const slug = slugifyCode(seg.replace(/_/g, "-"));
      const label = CODE_LABEL_OVERRIDES[slug] ?? humanizeCodeSlug(slug);
      return { codeSlug: slug, codeLabel: label };
    }
  }
  return null;
}

function humanizeCodeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w, i) => (i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ── Walk + ingestion ────────────────────────────────────────────────────
async function* walkXml(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkXml(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".xml")) yield full;
  }
}

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
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
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
  source_url: string | null;
}

async function flush(rows: PendingRow[], dryRun: boolean) {
  if (rows.length === 0) return;
  const embeddings: number[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_EMBED) {
    const slice = rows.slice(i, i + BATCH_EMBED);
    const texts = slice.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
    const out = await embedBatch(texts);
    embeddings.push(...out);
  }

  const payload = rows.map((r, i) => ({
    ...r,
    embedding: embeddings[i],
    token_count: Math.ceil(r.content.length / 4),
  }));

  if (dryRun) {
    console.log(`   ↳ dry-run : ${payload.length} lignes prêtes (skip upsert)`);
    return;
  }

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

async function main() {
  const { dir, codes, dryRun, limit } = parseArgs();
  console.log(`▸ Scan ${dir}${codes ? ` (codes filtrés: ${codes.join(", ")})` : ""}`);

  let scanned = 0;
  let kept = 0;
  let skipped = 0;
  const buffer: PendingRow[] = [];
  const startedAt = Date.now();

  for await (const file of walkXml(dir!)) {
    scanned++;
    if (scanned % 5000 === 0) {
      const rate = scanned / ((Date.now() - startedAt) / 1000);
      console.log(`   · scan ${scanned} fichiers, kept ${kept}, skipped ${skipped}, ${rate.toFixed(0)}/s`);
    }
    if (limit && kept >= limit) break;

    const codeInfo = detectCodeFromPath(file);
    if (!codeInfo) {
      skipped++;
      continue;
    }
    if (codes && !codes.includes(codeInfo.codeSlug)) {
      skipped++;
      continue;
    }

    let xml: string;
    try {
      xml = await fs.readFile(file, "utf8");
    } catch {
      skipped++;
      continue;
    }
    const parsed = parseArticleXml(xml);
    if (!parsed || parsed.etat !== "VIGUEUR") {
      skipped++;
      continue;
    }

    buffer.push({
      cid: parsed.cid,
      code: codeInfo.codeLabel,
      code_slug: codeInfo.codeSlug,
      reference: parsed.reference,
      title: parsed.title,
      content: parsed.content,
      date_debut: parsed.dateDebut,
      date_fin: parsed.dateFin,
      etat: parsed.etat,
      domains: inferDomains(codeInfo.codeSlug, parsed.content),
      source_url: `https://www.legifrance.gouv.fr/codes/article_lc/${parsed.cid}`,
    });
    kept++;

    if (buffer.length >= BATCH_UPSERT) {
      await flush(buffer.splice(0, buffer.length), Boolean(dryRun));
      console.log(`   ✓ ingested ${kept} articles (scan ${scanned})`);
    }
  }

  await flush(buffer, Boolean(dryRun));

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`\n✅ Terminé : ${kept} articles ingérés, ${skipped} ignorés, ${scanned} fichiers scannés en ${elapsed}s.`);
}

main().catch((err) => {
  console.error("\n✖ Erreur fatale :", err);
  process.exit(1);
});
