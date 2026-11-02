import { isPubliclyVisible } from "@/lib/claim/visibility";
import crypto from "crypto";
import { ClaimError, type ClaimRepo, type ClaimableOffer, type ClaimableProfile, type TokenRow } from "@/lib/claim/types";
import { offersFor } from "@/lib/claim/mapCrawler";
import type { CategoryKey } from "@/lib/claim/categories";

/** In-memory mirror of the SQL semantics in 20261028000000_claimable_profiles.sql. */
export function memoryClaimRepo() {
  const profiles = new Map<string, ClaimableProfile>();
  const offers = new Map<string, ClaimableOffer & { pid: string }>();
  const tokens = new Map<string, TokenRow & { pid: string; used_by?: string }>();
  const suppressed = new Set<string>();
  const accountConsents: any[] = [];
  const usernames = new Map<string, string>(); // public.profiles.username -> id
  const offerings = new Map<string, { facilitator_id: string; title: string; status: string }>();
  const ofs = (pid: string) => [...offers.values()].filter((o) => o.pid === pid).sort((a, b) => a.position - b.position).map(({ pid, ...o }) => o);

  const repo: ClaimRepo = {
    async byTokenHash(h) { const t = tokens.get(h); const p = t && profiles.get(t.pid); return p ? { profile: { ...p }, offers: ofs(p.id), token: { ...t! } } : null; },
    async liveByPath(cat, slug) { const p = [...profiles.values()].find((x) => x.category === cat && x.slug === slug && isPubliclyVisible(x)); return p ? { profile: { ...p }, offers: ofs(p.id) } : null; },
    async liveBySlugAnyCategory(slug) { return [...profiles.values()].filter((x) => x.slug === slug && isPubliclyVisible(x)).slice(0, 2).map((x) => ({ slug: x.slug, category: x.category })); },
    async liveByUsername(u) { const id = usernames.get(u); const p = id && [...profiles.values()].find((x) => x.profile_id === id && isPubliclyVisible(x)); return p ? { slug: p.slug, category: p.category } : null; },
    async byOwner(u) { const p = [...profiles.values()].find((x) => x.claimed_by === u); return p ? { profile: { ...p }, offers: ofs(p.id) } : null; },
    async claim(h, userId, _name, consent) {
      if (!consent?.sha256 || !consent.version) throw new ClaimError("consent_required");
      const t = tokens.get(h);
      if (!t) throw new ClaimError("claim_invalid");
      if (t.revoked_at || new Date(t.expires_at).getTime() <= Date.now()) throw new ClaimError("claim_expired");
      if (t.used_at) throw new ClaimError("claim_used");
      const p = profiles.get(t.pid)!;
      if (p.status !== "draft") throw new ClaimError("claim_used");
      if ([...profiles.values()].some((x) => x.claimed_by === userId)) throw new ClaimError("claim_user_has_profile");
      t.used_at = new Date().toISOString(); t.used_by = userId;
      for (const o of tokens.values()) if (o.pid === p.id && o !== t && !o.used_at) o.revoked_at = new Date().toISOString();
      for (const o of offers.values()) if (o.pid === p.id) { const id = crypto.randomUUID(); offerings.set(id, { facilitator_id: userId, title: o.title, status: "draft" }); o.offering_id = id; }
      Object.assign(p, { status: "live", claimed_by: userId, profile_id: userId, terms_consented_at: new Date().toISOString() });
      accountConsents.push({ user_id: userId, ...consent });
      const un = usernames.has(p.slug) ? `${p.slug}-${p.category}` : p.slug; if (![...usernames.values()].includes(userId)) usernames.set(un, userId);
      return { slug: p.slug, category: p.category };
    },
    async optOut(h, keys) {
      const t = tokens.get(h); const p = t && profiles.get(t.pid);
      if (!p || p.status !== "draft") return false;
      keys.forEach((k) => suppressed.add(k));
      profiles.delete(p.id);
      for (const [k, o] of offers) if (o.pid === p.id) offers.delete(k);
      for (const [k, x] of tokens) if (x.pid === p.id) tokens.delete(k);
      return true;
    },
    async updateOffer(u, id, patch) {
      const o = offers.get(id); if (!o || profiles.get(o.pid)?.claimed_by !== u) return null;
      Object.assign(o, patch, { is_preset: false });
      if (o.offering_id) offerings.get(o.offering_id)!.status = "published";
      const { pid, ...rest } = o; return rest;
    },
    async deleteOffer(u, id) { const o = offers.get(id); if (!o || profiles.get(o.pid)?.claimed_by !== u) return false; offers.delete(id); return true; },
  };

  function seed(opts: { slug: string; category: CategoryKey; tokenHash: string; expiresAt: Date; email?: string; country?: string }) {
    const id = crypto.randomUUID();
    profiles.set(id, { id, slug: opts.slug, display_name: `Test ${opts.slug}`, category: opts.category, categories: [], city: "Berlin", country: opts.country ?? "Germany",
      website: "https://example.org", instagram: null, colourway: "dark", cover_key: null, status: "draft", claimed_by: null, profile_id: null,
      contact_email: opts.email ?? "a@example.org", source_facilitator_id: crypto.randomUUID() });
    offersFor(opts.category).forEach((o) => { const oid = crypto.randomUUID(); offers.set(oid, { id: oid, pid: id, position: o.position, title: o.title, description: o.description,
      duration_minutes: o.durationMinutes, format: o.format, price_amount: o.priceAmount, currency: "EUR", is_preset: true, offering_id: null }); });
    tokens.set(opts.tokenHash, { pid: id, expires_at: opts.expiresAt.toISOString(), used_at: null, revoked_at: null });
    return id;
  }
  return { repo, seed, profiles, offers, tokens, suppressed, offerings, accountConsents, usernames };
}
