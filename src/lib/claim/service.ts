import { claimRepo } from "./repo";
import { verifyClaimToken, suppressionKey } from "./claimToken";
import { categoryFromSlug, profilePath, profileUrl, SLUG_RE } from "./slugs";
import type { CategoryKey } from "./categories";
import { parseAccountConsent } from "@/lib/account-consent-text";
import { accountConsentHash } from "@/lib/accountConsent";
import { loadProfileMedia } from "./media";
import { ClaimError, type ClaimableOffer, type OfferPatch, type PublicProfile, type ClaimableProfile } from "./types";

export type ClaimPreview =
  | { state: "ready"; profile: PublicProfile; offers: ClaimableOffer[]; expiresAt: string }
  | { state: "claimed"; slug: string; category: CategoryKey }
  | { state: "invalid" | "expired" };

export function toPublic(p: ClaimableProfile): PublicProfile {
  const { contact_email, source_facilitator_id, claimed_by, quality_score, quality_tier, terms_consented_at, published_at, release_batch_id, hidden_at, ...rest } = p;
  return rest;
}

/** Preview for /claim/[token]. Never returns contact e-mail or source ids. */
export async function loadClaimPreview(token: string, now = Date.now()): Promise<ClaimPreview> {
  const v = verifyClaimToken(token, now, { allowExpired: true });
  if (!v.ok) return { state: "invalid" };
  const row = await claimRepo().byTokenHash(v.hash);
  if (!row) return { state: "invalid" };
  if (row.profile.status === "live") return { state: "claimed", slug: row.profile.slug, category: row.profile.category };
  if (row.token.revoked_at || row.token.used_at || new Date(row.token.expires_at).getTime() <= now || v.expiresAt.getTime() <= now)
    return { state: "expired" };
  return { state: "ready", profile: toPublic(row.profile), offers: row.offers, expiresAt: row.token.expires_at };
}

/** Draft -> live. The account consent (terms + Art. 9) is mandatory and stored atomically with the claim. */
export async function completeClaim(token: string, user: { id: string; name: string }, consent: unknown, clientHash: string | null = null, now = Date.now()) {
  const v = verifyClaimToken(token, now);
  if (!v.ok) throw new ClaimError(v.reason === "expired" ? "claim_expired" : "claim_invalid");
  const c = parseAccountConsent(consent);
  if (!c) throw new ClaimError("consent_required");
  const r = await claimRepo().claim(v.hash, user.id, user.name, { version: c.version, sha256: accountConsentHash(c.lang, c.version), lang: c.lang, clientHash });
  return { ...r, path: profilePath(r.category, r.slug), shareUrl: profileUrl(r.category, r.slug) };
}

/** GDPR opt-out / delete-my-data. Works with expired (but authentic) links. */
export async function optOut(token: string, now = Date.now()): Promise<boolean> {
  const v = verifyClaimToken(token, now, { allowExpired: true });
  if (!v.ok) return false;
  const repo = claimRepo();
  const row = await repo.byTokenHash(v.hash);
  if (!row || row.profile.status !== "draft") return false;
  const keys = [row.profile.source_facilitator_id && suppressionKey("source", row.profile.source_facilitator_id),
    row.profile.contact_email && suppressionKey("email", row.profile.contact_email)].filter(Boolean) as string[];
  return repo.optOut(v.hash, keys);
}

/** Public profile at /{categorySlug}/{slug}. Unknown category slug, draft, or not consented -> null (404). */
export async function loadLiveProfile(categorySlug: string, slug: string) {
  const category = categoryFromSlug(categorySlug);
  if (!category || !SLUG_RE.test(slug) || slug.length > 80) return null;
  const row = await claimRepo().liveByPath(category, slug);
  if (!row) return null;
  // media only for live + consented rows (we only get here for those); signed URLs, missing files dropped
  const m = await loadProfileMedia(row.profile.id, row.offers, { publishedProductsOnly: true });
  return { profile: toPublic(row.profile), offers: m.offers, extras: m.extras };
}

/**
 * Where a non-canonical URL should permanently redirect to: legacy /f/{slug}, an old /{username} profile,
 * or a live profile requested under the wrong category. Only for live+consented profiles and only if unambiguous.
 */
export async function canonicalPathFor(slug: string): Promise<string | null> {
  if (!SLUG_RE.test(slug) || slug.length > 80) return null;
  const hits = await claimRepo().liveBySlugAnyCategory(slug);
  return hits.length === 1 ? profilePath(hits[0].category, hits[0].slug) : null;
}

/** Old /{username} profile of a claimed facilitator -> canonical path (layout of src/app/[username]). */
export async function canonicalPathForUsername(username: string): Promise<string | null> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{1,79}$/.test(username) || categoryFromSlug(username)) return null;
  const hit = await claimRepo().liveByUsername(username);
  return hit ? profilePath(hit.category, hit.slug) : null;
}

export function validateOfferPatch(body: any): OfferPatch | null {
  if (!body || typeof body !== "object") return null;
  const out: OfferPatch = {};
  if ("title" in body) { const t = String(body.title ?? "").trim(); if (t.length < 2 || t.length > 120) return null; out.title = t; }
  if ("description" in body) { const d = body.description == null ? null : String(body.description).trim().slice(0, 600); out.description = d || null; }
  if ("duration_minutes" in body) { const n = Number(body.duration_minutes); if (!Number.isInteger(n) || n < 5 || n > 10080) return null; out.duration_minutes = n; }
  if ("format" in body) { if (!["in_person", "online", "hybrid"].includes(body.format)) return null; out.format = body.format; }
  if ("price_amount" in body) {
    if (body.price_amount === null) out.price_amount = null;
    else { const p = Math.round(Number(body.price_amount) * 100) / 100; if (!Number.isFinite(p) || p < 0 || p > 100000) return null; out.price_amount = p; }
  }
  return Object.keys(out).length ? out : null;
}
