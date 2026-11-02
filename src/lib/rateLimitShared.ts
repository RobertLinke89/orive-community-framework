import crypto from "crypto";
import { serverDb } from "@/lib/serverDb";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/safeLog";

/**
 * Cross-instance rate limit via Supabase RPC rate_limit_hit (table public.rate_limits).
 * Keys are hashed (no raw IPs stored). Falls back to the in-memory limiter when the DB is
 * not configured (dev/tests) or temporarily unreachable (fail-open on infra error, but the
 * per-instance limit still applies).
 */
type Hit = (keyHash: string, limit: number, windowSec: number) => Promise<boolean>;
let override: Hit | null = null;
export function setSharedRateLimitForTests(h: Hit | null) { override = h; }

export function hashKey(key: string) {
  return crypto.createHash("sha256").update(`rl:${key}`, "utf8").digest("hex");
}

export async function rateLimitShared(key: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  if (!rateLimit(key, limit, windowMs)) return false; // cheap local pre-check
  const windowSec = Math.max(1, Math.round(windowMs / 1000));
  const hit: Hit | null = override ?? (() => {
    const db = serverDb();
    if (!db) return null;
    return async (k, l, w) => {
      const { data, error } = await db.rpc("rate_limit_hit", { p_key_hash: k, p_limit: l, p_window_seconds: w });
      if (error) throw error;
      return data === true;
    };
  })();
  if (!hit) return true;
  try { return await hit(hashKey(key), limit, windowSec); }
  catch (e) { logError("rate-limit.shared", e); return true; }
}
