/**
 * Accès base pour les scripts d'ingestion.
 *
 * Les scripts tournent hors du serveur Next : ils lisent `.env.local` eux-mêmes
 * et parlent à Neon par le pilote HTTP, comme l'application.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { config as chargerEnv } from "dotenv";

// Les scripts chargent `.env.local` eux-mêmes, mais après leurs imports : ce
// module le charge donc aussi, sans quoi DATABASE_URL manquerait ici.
chargerEnv({ path: ".env.local" });

let connexion: NeonQueryFunction<false, false> | null = null;

function client(): NeonQueryFunction<false, false> {
  if (!connexion) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("DATABASE_URL manquante : renseignez-la dans .env.local");
      process.exit(1);
    }
    connexion = neon(url);
  }
  return connexion;
}

/** Exécute une requête paramétrée et rend les lignes. */
export async function sql<T = Record<string, unknown>>(
  texte: string,
  parametres: unknown[] = []
): Promise<T[]> {
  return (await client().query(texte, parametres)) as T[];
}

/** Colonnes acceptées par l'upsert, dans l'ordre où elles sont écrites. */
const COLONNES = [
  "cid",
  "code",
  "code_slug",
  "reference",
  "title",
  "content",
  "date_debut",
  "date_fin",
  "etat",
  "domains",
  "hierarchy",
  "source_url",
  "embedding",
  "token_count",
] as const;

type Colonne = (typeof COLONNES)[number];
export type LigneArticle = Partial<Record<Colonne, unknown>> & { cid: string };

/** Types que Postgres ne devine pas depuis un paramètre du pilote HTTP. */
const CAST: Partial<Record<Colonne, string>> = {
  domains: "::text[]",
  hierarchy: "::jsonb",
  embedding: "::vector",
  date_debut: "::date",
  date_fin: "::date",
  token_count: "::int",
};

/**
 * Écrit des articles, en remplaçant ceux dont le `cid` existe déjà.
 *
 * Seules les colonnes présentes dans la première ligne du lot sont écrites :
 * les lots sont homogènes, et cela évite d'effacer une colonne absente.
 */
export async function upsertArticles(lignes: LigneArticle[]): Promise<number> {
  if (lignes.length === 0) return 0;

  const colonnes = COLONNES.filter((c) => c in lignes[0]);
  const valeurs: unknown[] = [];
  const tuples = lignes.map((ligne) => {
    const marqueurs = colonnes.map((c) => {
      const brut = ligne[c];
      valeurs.push(
        c === "hierarchy" && brut !== null && brut !== undefined
          ? JSON.stringify(brut)
          : c === "embedding" && Array.isArray(brut)
            ? `[${brut.join(",")}]`
            : (brut ?? null)
      );
      return `$${valeurs.length}${CAST[c] ?? ""}`;
    });
    return `(${marqueurs.join(", ")})`;
  });

  const misesAJour = colonnes
    .filter((c) => c !== "cid")
    .map((c) => `${c} = excluded.${c}`)
    .concat("updated_at = now()")
    .join(", ");

  const resultat = await sql(
    `insert into public.legal_articles (${colonnes.join(", ")})
     values ${tuples.join(", ")}
     on conflict (cid) do update set ${misesAJour}
     returning cid`,
    valeurs
  );
  return resultat.length;
}
