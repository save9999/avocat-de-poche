import "server-only";
import { createHash } from "node:crypto";
import { interroger, premiereLigne } from "./db";

/**
 * Cache des réponses « premier tour » dans Neon (table chat_cache).
 *
 * Cible : les questions FAQ posées en premier message (exemples cliquables,
 * arrivées SEO depuis /droits). Un hit économise un appel Gemini ET un
 * embedding — les deux ressources plafonnées du free tier.
 *
 * Jamais utilisé au-delà du premier tour : la suite d'une conversation
 * contient du contexte personnel qui ne doit ni être caché ni resservi.
 *
 * Fail-open : une erreur de cache ne doit jamais casser le chat — on log
 * et on continue sans cache.
 */

const TTL_JOURS = 7;

export interface ReponseCachee {
  reply: string;
  sources: unknown[];
}

/** Clé stable : domaine + question normalisée (casse, espaces). */
export function cleCache(domain: string | null, question: string): string {
  const normalisee = question.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256")
    .update(`${domain ?? "general"}|${normalisee}`)
    .digest("hex");
}

export async function lireCache(
  domain: string | null,
  question: string
): Promise<ReponseCachee | null> {
  try {
    const ligne = await premiereLigne<{ reply: string; sources: unknown[] }>(
      `select reply, sources
         from public.chat_cache
        where cache_key = $1
          and created_at > now() - make_interval(days => $2)`,
      [cleCache(domain, question), TTL_JOURS]
    );
    return ligne;
  } catch (err) {
    console.warn("[chatCache] lecture impossible :", (err as Error).message);
    return null;
  }
}

export async function ecrireCache(
  domain: string | null,
  question: string,
  reply: string,
  sources: unknown[]
): Promise<void> {
  try {
    await interroger(
      `insert into public.chat_cache (cache_key, domain, reply, sources)
       values ($1, $2, $3, $4::jsonb)
       on conflict (cache_key)
       do update set reply = excluded.reply, sources = excluded.sources,
                     created_at = now()`,
      [cleCache(domain, question), domain, reply, JSON.stringify(sources)]
    );
  } catch (err) {
    console.warn("[chatCache] écriture impossible :", (err as Error).message);
  }
}
