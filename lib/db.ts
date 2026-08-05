import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Accès à la base Neon.
 *
 * Le protocole Postgres n'est pas joignable depuis tous les réseaux : on passe
 * par le pilote HTTP, qui convient ici puisque chaque requête est indépendante
 * et qu'aucune transaction ne s'étend sur plusieurs appels.
 */

let connexion: NeonQueryFunction<false, false> | null = null;

function client(): NeonQueryFunction<false, false> {
  if (!connexion) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL manquante : base Neon non configurée");
    }
    connexion = neon(url);
  }
  return connexion;
}

/** Exécute une requête paramétrée et rend les lignes. */
export async function interroger<T>(
  texte: string,
  parametres: unknown[] = []
): Promise<T[]> {
  return (await client().query(texte, parametres)) as T[];
}

/** La première ligne, ou null si la requête ne rend rien. */
export async function premiereLigne<T>(
  texte: string,
  parametres: unknown[] = []
): Promise<T | null> {
  const lignes = await interroger<T>(texte, parametres);
  return lignes[0] ?? null;
}
