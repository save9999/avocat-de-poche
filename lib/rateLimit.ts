/**
 * Rate-limiting par IP — protège le quota Gemini free tier partagé par tous.
 *
 * Après la suppression de l'appel « specialty » automatique, 1 requête
 * /api/chat = au plus 1 appel LLM : la limite se lit donc directement en
 * « tours de conversation par heure ».
 *
 * Configuration (optionnelle) :
 *   • RATE_LIMIT_MAX_REQUESTS    — défaut 20 requêtes / fenêtre
 *   • RATE_LIMIT_WINDOW_SECONDS  — défaut 3600 (1 heure)
 *
 * Stratégie :
 *   • Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont définis,
 *     utilise Upstash Redis (sliding window via INCR + EXPIRE) — persisté
 *     entre les instances, idéal en production.
 *   • Sinon, fallback in-memory (Map) — fonctionnel en développement ou
 *     sur un déploiement single-instance. ATTENTION : non partagé entre
 *     réplicas Vercel / Edge ; préférer Upstash en prod.
 *   • Si Upstash est configuré mais injoignable, on retombe sur le compteur
 *     in-memory (fail-soft) : une limite par réplique, imparfaite mais non
 *     nulle — jamais de fail-open total, jamais de 500 pour l'utilisateur.
 */

import "server-only";
import { fetchWithTimeout } from "./fetchTimeout";

function maxRequests(): number {
  const n = Number(process.env.RATE_LIMIT_MAX_REQUESTS);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

/** Fenêtre en secondes — exportée pour l'en-tête Retry-After de la route. */
export function windowSeconds(): number {
  const n = Number(process.env.RATE_LIMIT_WINDOW_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 3600;
}

// ─── Fallback in-memory ───────────────────────────────────────────────────────

interface Window {
  count: number;
  resetAt: number; // timestamp ms
}

const inMemoryStore = new Map<string, Window>();

function inMemoryCheck(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let win = inMemoryStore.get(ip);
  if (!win || now > win.resetAt) {
    win = { count: 0, resetAt: now + windowSeconds() * 1000 };
    inMemoryStore.set(ip, win);
  }
  win.count += 1;
  const allowed = win.count <= maxRequests();
  return { allowed, remaining: Math.max(0, maxRequests() - win.count) };
}

// ─── Upstash Redis ────────────────────────────────────────────────────────────

async function upstashCheck(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const key = `rl:chat:${ip}`;

  // INCR + EXPIRE dans un pipeline atomique
  const pipeline = [
    ["INCR", key],
    ["EXPIRE", key, String(windowSeconds()), "NX"], // expire uniquement si non déjà défini
  ];

  let res: Response;
  try {
    // Ce contrôle passe avant tout le reste de la requête : un Upstash qui
    // resterait bloqué (sans même répondre par une erreur) figerait chaque
    // requête /api/chat indéfiniment. Timeout dur pour ne jamais en dépendre.
    res = await fetchWithTimeout(
      `${url}/pipeline`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pipeline),
      },
      3000,
    );
  } catch (err) {
    // Panne réseau ou timeout Upstash : fail-soft vers le compteur local, pas de 500.
    console.warn("[rateLimit] Upstash injoignable, fallback in-memory :", (err as Error).message);
    return inMemoryCheck(ip);
  }

  if (!res.ok) {
    console.warn(`[rateLimit] Upstash ${res.status}, fallback in-memory.`);
    return inMemoryCheck(ip);
  }

  const data = (await res.json()) as [{ result: number }, unknown];
  const count = data[0]?.result ?? 1;
  const allowed = count <= maxRequests();
  return { allowed, remaining: Math.max(0, maxRequests() - count) };
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const hasUpstash =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    return upstashCheck(ip);
  }
  return inMemoryCheck(ip);
}
