import "server-only";
import { getSupabaseServer } from "@/lib/supabase";

/**
 * Accès aux fiches Service-Public.fr (code = 'Service-Public.fr') pour les
 * pages SEO /droits. Lecture via le client anonyme (RLS lecture publique).
 *
 * URL canonique d'une fiche : /droits/<slug(reference)>-<id> (ex. f10).
 * L'identifiant DILA en fin de slug est la clé de lookup : le libellé peut
 * évoluer sans casser les URLs déjà indexées.
 */

export interface FicheSummary {
  cid: string;
  reference: string;
  title: string | null;
  domains: string[];
}

export interface Fiche extends FicheSummary {
  content: string;
  source_url: string | null;
}

const CODE_SP = "Service-Public.fr";
const PAGE = 1000; // plafond de lignes par requête PostgREST

export function slugifyReference(reference: string): string {
  return reference
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export function ficheSlug(f: Pick<FicheSummary, "cid" | "reference">): string {
  const id = f.cid.replace(/^SP-/, "").toLowerCase();
  return `${slugifyReference(f.reference)}-${id}`;
}

export function cidFromSlug(slug: string): string | null {
  const m = slug.match(/-([fr]\d+)$/i);
  return m ? `SP-${m[1].toUpperCase()}` : null;
}

export async function getFiche(cid: string): Promise<Fiche | null> {
  const { data } = await getSupabaseServer()
    .from("legal_articles")
    .select("cid, reference, title, content, domains, source_url")
    .eq("code", CODE_SP)
    .eq("cid", cid)
    .maybeSingle();
  return (data as Fiche | null) ?? null;
}

export async function getRelated(
  domains: string[],
  excludeCid: string,
  limit = 6
): Promise<FicheSummary[]> {
  if (domains.length === 0) return [];
  const { data } = await getSupabaseServer()
    .from("legal_articles")
    .select("cid, reference, title, domains")
    .eq("code", CODE_SP)
    .overlaps("domains", domains)
    .neq("cid", excludeCid)
    .order("cid")
    .limit(limit);
  return (data as FicheSummary[] | null) ?? [];
}

export async function listByDomain(domain: string): Promise<FicheSummary[]> {
  const out: FicheSummary[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await getSupabaseServer()
      .from("legal_articles")
      .select("cid, reference, title, domains")
      .eq("code", CODE_SP)
      .contains("domains", [domain])
      .order("reference")
      .range(from, from + PAGE - 1);
    const rows = (data as FicheSummary[] | null) ?? [];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

export async function countByDomain(domain: string): Promise<number> {
  const { count } = await getSupabaseServer()
    .from("legal_articles")
    .select("cid", { count: "exact", head: true })
    .eq("code", CODE_SP)
    .contains("domains", [domain]);
  return count ?? 0;
}

/** Toutes les fiches (cid + reference), pour le sitemap. */
export async function listAllFiches(): Promise<
  Array<Pick<FicheSummary, "cid" | "reference">>
> {
  const out: Array<Pick<FicheSummary, "cid" | "reference">> = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await getSupabaseServer()
      .from("legal_articles")
      .select("cid, reference")
      .eq("code", CODE_SP)
      .order("cid")
      .range(from, from + PAGE - 1);
    const rows = (data as Array<Pick<FicheSummary, "cid" | "reference">> | null) ?? [];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/** Domaines exposés en pages thématiques (les 6 de l'app + 2 issus des fiches). */
export const FICHE_DOMAINS: Array<{ id: string; label: string; description: string }> = [
  { id: "travail", label: "Travail", description: "Contrat, licenciement, congés, chômage, formation." },
  { id: "logement", label: "Logement", description: "Bail, loyer, dépôt de garantie, expulsion, copropriété." },
  { id: "famille", label: "Famille", description: "Mariage, divorce, pension, filiation, succession." },
  { id: "consommation", label: "Consommation", description: "Achats, garanties, rétractation, crédit, litiges." },
  { id: "penal", label: "Pénal et victimes", description: "Plainte, infractions, violences, indemnisation." },
  { id: "harcelement-scolaire", label: "Harcèlement scolaire", description: "Protéger un enfant à l'école et en ligne." },
  { id: "numerique", label: "Numérique", description: "Données personnelles, réseaux sociaux, démarches en ligne." },
  { id: "administratif", label: "Démarches administratives", description: "Papiers, impôts, aides, état civil, étrangers." },
];
