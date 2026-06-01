/**
 * Rate-limiting par IP — 20 requêtes / heure.
 *
 * Stratégie :
 *   • Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont définis,
 *     utilise Upstash Redis (sliding window via INCR + EXPIRE) — persisté
 *     entre les instances, idéal en production.
 *   • Sinon, fallback in-memory (Map) — fonctionnel en développement ou
 *     sur un déploiement single-instance. ATTENTION : non partagé entre
 *     réplicas Vercel / Edge ; préférer Upstash en prod.
 */

import "server-only";

const WINDOW_SECONDS = 3600; // 1 heure
const MAX_REQUESTS = 20;

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
    win = { count: 0, resetAt: now + WINDOW_SECONDS * 1000 };
    inMemoryStore.set(ip, win);
  }
  win.count += 1;
  const allowed = win.count <= MAX_REQUESTS;
  return { allowed, remaining: Math.max(0, MAX_REQUESTS - win.count) };
}

// ─── Upstash Redis ────────────────────────────────────────────────────────────

async function upstashCheck(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const key = `rl:chat:${ip}`;

  // INCR + EXPIRE dans un pipeline atomique
  const pipeline = [
    ["INCR", key],
    ["EXPIRE", key, String(WINDOW_SECONDS), "NX"], // expire uniquement si non déjà défini
  ];

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });

  if (!res.ok) {
    // Si Upstash est injoignable, on laisse passer (fail-open) plutôt que bloquer.
    console.warn("[rateLimit] Upstash indisponible, fail-open.");
    return { allowed: true, remaining: MAX_REQUESTS };
  }

  const data = (await res.json()) as [{ result: number }, unknown];
  const count = data[0]?.result ?? 1;
  const allowed = count <= MAX_REQUESTS;
  return { allowed, remaining: Math.max(0, MAX_REQUESTS - count) };
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
