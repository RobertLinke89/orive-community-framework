/**
 * Shared image URL guards for Orive.
 * Avatars: only a claimed, self-hosted photo (Supabase avatars bucket or a first-party path).
 * No crawled/stock portraits (no image rights, and many of those URLs 404).
 * Covers: reject URLs that are already known to be dead or unsafe (truncated Unsplash, http, placeholder hosts).
 */
export function isTruncatedUnsplashUrl(url: string): boolean {
  // Real Unsplash photo ids look like "1534528741775-53994a69daeb".
  // The crawler sometimes invented "photo-<13 digits>" which always 404.
  return /images\.unsplash\.com\/photo-\d{8,16}(?:\?|$)/i.test(url);
}

function supabaseAvatarPrefix(): string | null {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return base ? `${base}/storage/v1/object/public/avatars/` : null;
}

/** True when this URL may be shown as a person's face. */
export function isSafeAvatarUrl(url: string | null | undefined): boolean {
  const u = String(url || "").trim();
  if (!u) return false;
  if (isTruncatedUnsplashUrl(u)) return false;
  if (/unsplash\.com|pexels\.com|pravatar|randomuser|placeholder|default-avatar|picsum\.photos/i.test(u)) {
    return false;
  }
  const pre = supabaseAvatarPrefix();
  if (pre && u.startsWith(pre)) return true;
  // First-party path, but not the stock /facilitators/*.jpg portraits.
  if (u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/facilitators/")) return true;
  return false;
}

/** True when a cover/card URL is worth requesting (not a known-dead or junk URL). */
export function isPlausibleImageUrl(url: string | null | undefined): boolean {
  const u = String(url || "").trim();
  if (!u || u === "null" || u === "undefined") return false;
  if (isTruncatedUnsplashUrl(u)) return false;
  if (/pravatar\.cc|randomuser\.me|via\.placeholder|placehold\.it|placeholder\.com|picsum\.photos/i.test(u)) {
    return false;
  }
  if (/^http:\/\//i.test(u) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(u)) return false;
  return true;
}
