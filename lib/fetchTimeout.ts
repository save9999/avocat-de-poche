import "server-only";

/**
 * `fetch()` avec timeout dur (AbortController).
 *
 * Sans ça, un appel externe qui reste bloqué (au lieu de répondre par une
 * erreur claire) ne se termine jamais côté code — la requête /api/chat
 * finit par être tuée par la plateforme d'hébergement (timeout de fonction
 * serverless) AVANT que le code de dégradation gracieuse (fallback RAG,
 * message de saturation) ait la moindre chance de s'exécuter. Ce timeout
 * transforme un blocage silencieux en erreur gérée immédiatement.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
