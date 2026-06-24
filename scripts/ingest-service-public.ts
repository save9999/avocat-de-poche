#!/usr/bin/env tsx
/**
 * Ingestion des fiches pratiques Service-Public.fr (« Vos droits et démarches —
 * Particuliers ») dans la table `legal_articles`, aux côtés des articles
 * Légifrance. Source officielle DILA, licence ouverte v2.0, mise à jour
 * quotidienne.
 *
 * Pourquoi : les fiches Service-Public sont de l'information juridique DÉJÀ
 * vulgarisée — registre idéal pour un public scolaire — alors que Légifrance
 * fournit la loi brute. Les deux cohabitent dans la même recherche vectorielle
 * (RPC match_articles) ; on distingue les fiches par `code = 'Service-Public.fr'`.
 *
 * Pré-requis :
 *   1. Télécharger + dézipper l'archive : `npm run download:sp`
 *      (remplit ~/sp-data/fiches/*.xml)
 *   2. .env.local : VOYAGE_API_KEY + SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
 *
 * Usage :
 *   npm run ingest:sp                      → toutes les fiches F + R
 *   npm run ingest:sp -- --dry-run         → parse seulement (ni embed ni upsert)
 *   npm run ingest:sp -- --limit 50        → tronque (validation rapide)
 *   npm run ingest:sp -- --prefix F        → fiches F uniquement
 *
 * Le script est resume-safe : une relance saute les fiches déjà en base
 * (utile si le quota Voyage coupe en cours de route).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import { embedBatch } from "../lib/embeddings";

// ── Configuration ────────────────────────────────────────────────────────
const FICHES_DIR = path.join(os.homedir(), "sp-data", "fiches");
const BATCH_EMBED = 50; // Gemini batchEmbedContents : ≤ 100 requêtes/appel
const EMBED_PAUSE_MS = 300;
const BATCH_UPSERT = 200;
const MAX_CHARS = 12000; // texte stocké
const MIN_CONTENT_CHARS = 200; // en-dessous = fiche de navigation vide → skip

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

// ── Mapping thème Service-Public → domaine de l'app ──────────────────────
const DOMAIN_RULES: Array<{ domain: string; keywords: RegExp }> = [
  { domain: "harcelement-scolaire", keywords: /harc[èe]lement|scolaire|école|coll[èe]ge|lyc[ée]e|élève|cyberharc/i },
  { domain: "travail", keywords: /travail|salari[ée]|employeur|licenciement|cong[ée]|emploi|ch[ôo]mage|formation profession/i },
  { domain: "logement", keywords: /logement|bail|locataire|bailleur|loyer|expulsion|copropri[ée]t[ée]|h[ée]bergement/i },
  { domain: "consommation", keywords: /consommation|consommateur|achat|garantie|r[ée]tractation|d[ée]marchage|cr[ée]dit|surendettement|litige.*vendeur/i },
  { domain: "famille", keywords: /famille|mariage|divorce|pacs|pension|parentale|filiation|succession|enfant|adoption|tutelle/i },
  { domain: "penal", keywords: /justice|infraction|peine|d[ée]lit|plainte|victime|violence|agression|vol|escroquerie|harc[èe]lement/i },
  { domain: "numerique", keywords: /num[ée]rique|internet|donn[ée]es personnelles|cnil|r[ée]seaux sociaux|en ligne/i },
];

function inferDomains(subject: string, title: string, content: string): string[] {
  const hay = `${subject} ${title} ${content.slice(0, 600)}`;
  const out = new Set<string>();
  for (const r of DOMAIN_RULES) if (r.keywords.test(hay)) out.add(r.domain);
  if (out.size === 0) out.add("administratif");
  return [...out];
}

// ── XML → texte lisible ──────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripInline(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Aplati les blocs <Introduction>/<Texte>/<Definition> en texte structuré. */
function xmlToText(xml: string): string {
  const blocks = [...xml.matchAll(/<Texte>([\s\S]*?)<\/Texte>/g)].map((m) => m[1]);
  if (blocks.length === 0) return "";
  let t = blocks.join("\n\n");
  // Titres de chapitre/section → sous-titres ; items → puces ; paragraphes → lignes.
  t = t.replace(/<Titre>([\s\S]*?)<\/Titre>/g, (_, c) => `\n\n## ${stripInline(c)}\n`);
  t = t.replace(/<Item>([\s\S]*?)<\/Item>/g, (_, c) => `\n- ${stripInline(c)}`);
  t = t.replace(/<Paragraphe>([\s\S]*?)<\/Paragraphe>/g, (_, c) => `\n${stripInline(c)}\n`);
  // Reste : balises structurelles (Chapitre, Liste, Rappel, Attention…) → espace.
  t = decodeEntities(t.replace(/<[^>]+>/g, " "));
  return t
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return m ? stripInline(m[1]) : null;
}

interface PendingRow {
  cid: string;
  code: string;
  code_slug: string;
  reference: string;
  title: string | null;
  content: string;
  date_debut: null;
  date_fin: null;
  etat: string;
  domains: string[];
  source_url: string;
}

function parseFiche(xml: string, fileId: string): PendingRow | null {
  const title = tag(xml, "dc:title");
  if (!title) return null;
  const subject = tag(xml, "dc:subject") ?? "";
  const description = tag(xml, "dc:description") ?? "";
  const idMatch = xml.match(/<Publication[^>]*\bID="([^"]+)"/);
  const spUrlMatch = xml.match(/<Publication[^>]*\bspUrl="([^"]+)"/);
  const id = idMatch?.[1] ?? fileId;

  const body = xmlToText(xml);
  const full = [description, body].filter(Boolean).join("\n\n").trim();
  if (full.length < MIN_CONTENT_CHARS) return null; // dossier de navigation → skip

  return {
    cid: `SP-${id}`,
    code: "Service-Public.fr",
    code_slug: "service-public",
    reference: title.slice(0, 500),
    title: description ? description.slice(0, 500) : null,
    content: full.slice(0, MAX_CHARS),
    date_debut: null,
    date_fin: null,
    etat: "VIGUEUR",
    domains: inferDomains(subject, title, body),
    source_url:
      spUrlMatch?.[1] ?? `https://www.service-public.fr/particuliers/vosdroits/${id}`,
  };
}

// ── Supabase ─────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function upsertWithEmbeddings(rows: PendingRow[], dryRun: boolean) {
  if (rows.length === 0) return;
  if (dryRun) {
    console.log(`   ↳ dry-run : ${rows.length} fiches prêtes (skip embed + upsert)`);
    return;
  }
  const embeddings: number[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_EMBED) {
    const slice = rows.slice(i, i + BATCH_EMBED);
    const texts = slice.map((r) => `${r.reference} (${r.code})\n\n${r.content}`);
    embeddings.push(...(await embedBatch(texts)));
    if (i + BATCH_EMBED < rows.length) await new Promise((r) => setTimeout(r, EMBED_PAUSE_MS));
  }
  const payload = rows.map((r, i) => ({
    ...r,
    embedding: embeddings[i],
    token_count: Math.ceil(r.content.length / 4),
  }));
  for (let i = 0; i < payload.length; i += BATCH_UPSERT) {
    const { error } = await supabase
      .from("legal_articles")
      .upsert(payload.slice(i, i + BATCH_UPSERT), { onConflict: "cid" });
    if (error) {
      console.error("   ✖ upsert :", error.message);
      throw error;
    }
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const out: { dryRun?: boolean; limit?: number; prefix?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") out.dryRun = true;
    else if (args[i] === "--limit") out.limit = parseInt(args[++i], 10);
    else if (args[i] === "--prefix") out.prefix = args[++i].toUpperCase();
  }
  return out;
}

async function main() {
  const { dryRun, limit, prefix } = parseArgs();

  // Mode free tier : le mur est le quota de REQUÊTES PAR JOUR (RPD), pas la
  // vitesse. On maximise donc le nombre de fiches par requête (gros budget de
  // tokens, juste sous le TPM ~30K) pour minimiser le nombre d'appels, et on
  // cadence pour rester sous le TPM. Désactivable par --fast (facturation Gemini).
  if (!process.argv.includes("--fast")) {
    process.env.EMBED_TOKEN_BUDGET ||= "25000";
    process.env.EMBED_SUBBATCH_PAUSE_MS ||= "55000";
    console.log("   ⏳ mode free tier : ~12 fiches/appel (budget 25K) / pause 55s — minimise les requêtes/jour\n");
  }

  let files: string[];
  try {
    files = (await fs.readdir(FICHES_DIR))
      .filter((f) => f.endsWith(".xml"))
      .filter((f) => (prefix ? f.toUpperCase().startsWith(prefix) : /^[FR]/i.test(f)))
      .sort();
  } catch {
    console.error(`✖ Dossier introuvable : ${FICHES_DIR}\n  Lance d'abord : npm run download:sp`);
    process.exit(1);
  }

  console.log(`▸ Ingestion Service-Public.fr — ${files.length} fichier(s) (prefix=${prefix ?? "F,R"})`);
  console.log(`   dry-run=${Boolean(dryRun)} ${limit ? `limit=${limit}` : ""}\n`);

  // Parse tout d'abord (rapide, local).
  const pending: PendingRow[] = [];
  let skipped = 0;
  for (const file of files) {
    const xml = await fs.readFile(path.join(FICHES_DIR, file), "utf8");
    const row = parseFiche(xml, file.replace(/\.xml$/i, ""));
    if (row) pending.push(row);
    else skipped++;
    if (limit && pending.length >= limit) break;
  }
  console.log(`   ↳ ${pending.length} fiches avec contenu, ${skipped} ignorées (navigation/vides)\n`);

  // Resume-safe : sauter les cid déjà présents en base.
  let toProcess = pending;
  if (!dryRun && pending.length > 0) {
    const already = new Set<string>();
    const cids = pending.map((p) => p.cid);
    for (let i = 0; i < cids.length; i += 1000) {
      const { data } = await supabase
        .from("legal_articles")
        .select("cid")
        .in("cid", cids.slice(i, i + 1000));
      (data ?? []).forEach((r: { cid: string }) => already.add(r.cid));
    }
    if (already.size > 0) {
      toProcess = pending.filter((p) => !already.has(p.cid));
      console.log(`   ↳ ${already.size} déjà en base (skip) — ${toProcess.length} à traiter\n`);
    }
  }

  const startedAt = Date.now();
  let done = 0;
  for (let i = 0; i < toProcess.length; i += BATCH_UPSERT) {
    const batch = toProcess.slice(i, i + BATCH_UPSERT);
    await upsertWithEmbeddings(batch, Boolean(dryRun));
    done += batch.length;
    const rate = done / ((Date.now() - startedAt) / 1000 || 1);
    console.log(`   ✓ ${done}/${toProcess.length} ingérées (${rate.toFixed(1)}/s)`);
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`\n✅ Terminé : ${done} fiches Service-Public ingérées en ${elapsed}s.`);
}

main().catch((err) => {
  console.error("\n✖ Erreur fatale :", err);
  process.exit(1);
});
