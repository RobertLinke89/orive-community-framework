// Server-side check whether /{username} belongs to a real (Supabase) user profile.
// Used so unknown URLs return a real 404 instead of the client-side "Private Profile" placeholder.
// (Demo/sample usernames like /emma-berg no longer count – removed 2026-11-09.)
const cache = new Map<string, { v: boolean | null; at: number }>();

/** true = profile row exists (visible or private), false = definitely unknown, null = could not check (fail open). */
export async function userProfileExists(username: string): Promise<boolean | null> {
  const u = String(username || "").toLowerCase();
  if (!u || u.length > 80 || !/^[a-z0-9][a-z0-9._-]*$/.test(u)) return false;
  const hit = cache.get(u);
  if (hit && Date.now() - hit.at < 60_000) return hit.v;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) return null;
  let v: boolean | null = null;
  try {
    const r = await fetch(`${base}/rest/v1/profiles?select=id&username=ilike.${encodeURIComponent(u.replace(/[%_*]/g, ""))}&limit=1`, {
      cache: "no-store", signal: AbortSignal.timeout(4000), headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (r.ok) v = ((await r.json()) as unknown[]).length > 0;
  } catch { v = null; }
  if (cache.size > 5000) cache.clear();
  cache.set(u, { v, at: Date.now() });
  return v;
}
