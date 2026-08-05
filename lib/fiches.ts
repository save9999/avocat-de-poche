import "server-only";
import { interroger, premiereLigne } from "@/lib/db";

/**
 * Accès aux fiches Service-Public.fr (code = 'Service-Public.fr') pour les
 * pages SEO /droits.
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

export function slugifyReference(reference: string): string {
  return reference
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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
  return premiereLigne<Fiche>(
    `select cid, reference, title, content, domains, source_url
       from public.legal_articles
      where code = $1 and cid = $2
      limit 1`,
    [CODE_SP, cid]
  );
}

export async function getRelated(
  domains: string[],
  excludeCid: string,
  limit = 6
): Promise<FicheSummary[]> {
  if (domains.length === 0) return [];
  return interroger<FicheSummary>(
    `select cid, reference, title, domains
       from public.legal_articles
      where code = $1 and domains && $2::text[] and cid <> $3
      order by cid
      limit $4`,
    [CODE_SP, domains, excludeCid, limit]
  );
}

export async function listByDomain(domain: string): Promise<FicheSummary[]> {
  return interroger<FicheSummary>(
    `select cid, reference, title, domains
       from public.legal_articles
      where code = $1 and domains @> array[$2]::text[]
      order by reference`,
    [CODE_SP, domain]
  );
}

export async function countByDomain(domain: string): Promise<number> {
  const ligne = await premiereLigne<{ n: number }>(
    `select count(*)::int as n
       from public.legal_articles
      where code = $1 and domains @> array[$2]::text[]`,
    [CODE_SP, domain]
  );
  return ligne?.n ?? 0;
}

/** Toutes les fiches (cid + reference), pour le sitemap. */
export async function listAllFiches(): Promise<
  Array<Pick<FicheSummary, "cid" | "reference">>
> {
  return interroger<Pick<FicheSummary, "cid" | "reference">>(
    `select cid, reference
       from public.legal_articles
      where code = $1
      order by cid`,
    [CODE_SP]
  );
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
