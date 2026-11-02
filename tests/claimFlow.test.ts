import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { signClaimToken, verifyClaimToken, hashClaimToken } from "@/lib/claim/claimToken";
import { CATEGORIES, CATEGORY_KEYS, categoryFromCrawler } from "@/lib/claim/categories";
import { mapCrawlerRow, slugify, safeUrl } from "@/lib/claim/mapCrawler";
import { setClaimRepoForTests } from "@/lib/claim/repo";
import { loadClaimPreview, completeClaim, optOut, loadLiveProfile, validateOfferPatch } from "@/lib/claim/service";
import { memoryClaimRepo } from "./support/memoryClaimRepo";

process.env.CLAIM_TOKEN_SECRET = crypto.randomBytes(32).toString("hex");

import { ACCOUNT_CONSENT_VERSION } from "@/lib/account-consent-text";
const C = { granted: true, version: ACCOUNT_CONSENT_VERSION, lang: "de" } as const;

describe("claim tokens", () => {
  it("round-trips and is unguessable/unique", () => {
    const a = signClaimToken(), b = signClaimToken();
    expect(a.token).not.toBe(b.token);
    expect(verifyClaimToken(a.token)).toMatchObject({ ok: true, hash: a.hash });
    expect(a.hash).toBe(hashClaimToken(a.token));
  });
  it("rejects tampering, forgery and expiry", () => {
    const a = signClaimToken();
    const [id, exp, sig] = a.token.split(".");
    expect(verifyClaimToken(`${id}.${Number(exp) + 999999}.${sig}`)).toEqual({ ok: false, reason: "bad_signature" });
    expect(verifyClaimToken(`${id.replace(/^./, id[0] === "A" ? "B" : "A")}.${exp}.${sig}`).ok).toBe(false);
    expect(verifyClaimToken("../../etc").ok).toBe(false);
    const old = signClaimToken({ ttlDays: 1, now: Date.now() - 3 * 86400_000 });
    expect(verifyClaimToken(old.token)).toEqual({ ok: false, reason: "expired" });
    expect(verifyClaimToken(old.token, Date.now(), { allowExpired: true }).ok).toBe(true);
  });
  it("other secret -> invalid", () => {
    const a = signClaimToken();
    process.env.CLAIM_TOKEN_SECRET = crypto.randomBytes(32).toString("hex");
    expect(verifyClaimToken(a.token).ok).toBe(false);
  });
});

describe("categories & crawler mapping", () => {
  it("has 12 categories (incl. Personal Coaching) with exactly 3 presets each", () => {
    expect(CATEGORY_KEYS).toHaveLength(12);
    for (const k of CATEGORY_KEYS) expect(CATEGORIES[k].offers).toHaveLength(3);
  });
  it("maps all crawler labels", () => {
    for (const [label, key] of [["Yoga", "yoga"], ["Ice Bathing", "ice"], ["Sound Healing", "sound"], ["Life Coaching", "coaching"], ["Coaching", "coaching"],
      ["BodyWork", "bodywork"], ["Spiritual Growth", "spiritual"], ["Reiki", "spiritual"], ["Breathwork", "breath"], ["Kambo", "kambo"], ["Mindfulness", "mindfulness"], ["Meditation", "meditation"]] as const)
      expect(categoryFromCrawler([label])).toBe(key);
    expect(categoryFromCrawler([], true)).toBe("kambo");
  });
  it("builds safe rows (unique slugs, no javascript: urls, normalised email)", () => {
    const taken = new Map<any, Set<string>>();
    const base = { id: crypto.randomUUID(), categories: ["Breathwork"], kambo_flag: false, city: "Berlin", country: "Germany", phone: null, source: null, source_url: null, instagram: null };
    const a = mapCrawlerRow({ ...base, name: "Own Your Breath (Janine Lohse)", website: "www.ownyourbreath.de", email: " Info@X.de " }, taken)!;
    const b = mapCrawlerRow({ ...base, name: "Own Your Breath", website: "javascript:alert(1)", email: "bad" }, taken)!;
    expect(a.slug).toBe("own-your-breath");
    expect(b.slug).toBe("own-your-breath-2");
    expect(a.website).toBe("https://www.ownyourbreath.de/");
    expect(b.website).toBeNull();
    expect(a.contact_email).toBe("info@x.de");
    expect(b.contact_email).toBeNull();
    expect(slugify("Müller & Söhne Straße")).toBe("mueller-soehne-strasse");
    expect(safeUrl("ftp://x")).toBeNull();
  });
});

describe("claim flow (draft -> live)", () => {
  let m: ReturnType<typeof memoryClaimRepo>;
  let tok: ReturnType<typeof signClaimToken>;
  beforeEach(() => {
    m = memoryClaimRepo(); setClaimRepoForTests(m.repo);
    tok = signClaimToken();
    m.seed({ slug: "anna-yoga", category: "yoga", tokenHash: tok.hash, expiresAt: tok.expiresAt });
  });
  afterEach(() => setClaimRepoForTests(null));

  it("draft is not public before claim, preview hides PII", async () => {
    expect(await loadLiveProfile("yoga", "anna-yoga")).toBeNull();
    const p = await loadClaimPreview(tok.token);
    expect(p.state).toBe("ready");
    if (p.state === "ready") {
      expect(p.offers).toHaveLength(3);
      expect(p.offers.every((o) => o.is_preset)).toBe(true);
      expect(JSON.stringify(p)).not.toContain("a@example.org");
      expect(p.profile).not.toHaveProperty("source_facilitator_id");
    }
  });
  it("claim goes live, single-use, share URL", async () => {
    const r = await completeClaim(tok.token, { id: "user-1", name: "Anna" }, C);
    expect(r.shareUrl).toBe("https://orive.test/yoga/anna-yoga");
    expect(r.path).toBe("/yoga/anna-yoga");
    const live = await loadLiveProfile("yoga", "anna-yoga");
    expect(live?.profile.status).toBe("live");
    expect(live?.offers.every((o) => o.offering_id)).toBe(true);
    await expect(completeClaim(tok.token, { id: "user-2", name: "Eve" }, C)).rejects.toMatchObject({ code: "claim_used" });
    expect((await loadClaimPreview(tok.token)).state).toBe("claimed");
  });
  it("expired DB token cannot be claimed, but opt-out still works", async () => {
    const t2 = signClaimToken();
    m.seed({ slug: "old-one", category: "ice", tokenHash: t2.hash, expiresAt: new Date(Date.now() - 1000) });
    await expect(completeClaim(t2.token, { id: "u", name: "x" }, C)).rejects.toMatchObject({ code: "claim_expired" });
    expect((await loadClaimPreview(t2.token)).state).toBe("expired");
    expect(await optOut(t2.token)).toBe(true);
    expect(m.suppressed.size).toBe(2);
  });
  it("forged / unknown tokens", async () => {
    const other = signClaimToken();
    expect((await loadClaimPreview(other.token)).state).toBe("invalid");
    await expect(completeClaim("x.y.z", { id: "u", name: "" }, C)).rejects.toMatchObject({ code: "claim_invalid" });
  });
  it("one profile per user", async () => {
    await completeClaim(tok.token, { id: "user-1", name: "Anna" }, C);
    const t2 = signClaimToken();
    m.seed({ slug: "second", category: "sound", tokenHash: t2.hash, expiresAt: t2.expiresAt });
    await expect(completeClaim(t2.token, { id: "user-1", name: "Anna" }, C)).rejects.toMatchObject({ code: "claim_user_has_profile" });
  });
  it("opt-out deletes draft; live profiles cannot be deleted via link", async () => {
    await completeClaim(tok.token, { id: "user-1", name: "Anna" }, C);
    expect(await optOut(tok.token)).toBe(false);
    const t2 = signClaimToken();
    m.seed({ slug: "bye", category: "kambo", tokenHash: t2.hash, expiresAt: t2.expiresAt });
    expect(await optOut(t2.token)).toBe(true);
    expect(await m.repo.byTokenHash(t2.hash)).toBeNull();
  });
  it("owner edits presets after login; others cannot", async () => {
    await completeClaim(tok.token, { id: "user-1", name: "Anna" }, C);
    const [o] = (await loadLiveProfile("yoga", "anna-yoga"))!.offers;
    expect(await m.repo.updateOffer("intruder", o.id, { title: "Hack" })).toBeNull();
    const up = await m.repo.updateOffer("user-1", o.id, { title: "Vinyasa Flow", price_amount: 20 });
    expect(up).toMatchObject({ title: "Vinyasa Flow", is_preset: false });
    expect(m.offerings.get(up!.offering_id!)!.status).toBe("published");
  });
  it("validates offer patches", () => {
    expect(validateOfferPatch({ title: "A" })).toBeNull();
    expect(validateOfferPatch({ price_amount: -1 })).toBeNull();
    expect(validateOfferPatch({ format: "vr" })).toBeNull();
    expect(validateOfferPatch({ title: " Flow ", price_amount: "19.999" })).toEqual({ title: "Flow", price_amount: 20 });
  });
});

describe("API routes", () => {
  let m: ReturnType<typeof memoryClaimRepo>;
  beforeEach(() => { m = memoryClaimRepo(); setClaimRepoForTests(m.repo); });
  afterEach(() => { setClaimRepoForTests(null); vi.restoreAllMocks(); });
  const req = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    new Request(`https://orive.test${path}`, { method: "POST", headers: { "content-type": "application/json", origin: "https://orive.test", ...headers }, body: JSON.stringify(body) });

  it("complete requires login and same origin", async () => {
    const { POST } = await import("@/app/api/claim/complete/route");
    const tok = signClaimToken();
    m.seed({ slug: "z-z-z", category: "breath", tokenHash: tok.hash, expiresAt: tok.expiresAt });
    expect((await POST(req("/api/claim/complete", { token: tok.token }))).status).toBe(401);
    expect((await POST(req("/api/claim/complete", { token: tok.token }, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await loadLiveProfile("breathwork", "z-z-z"))).toBeNull();
  });
  it("opt-out answers uniformly and sets noindex", async () => {
    const { POST } = await import("@/app/api/claim/optout/route");
    const r = await POST(req("/api/claim/optout", { token: "nope" }));
    expect(r.status).toBe(200);
    expect(r.headers.get("x-robots-tag")).toContain("noindex");
    expect(await r.json()).toEqual({ ok: true, deleted: false });
  });
});

describe("quality score is admin-only", () => {
  afterEach(async () => { setClaimRepoForTests(null); (await import("@/lib/claim/admin")).setAdminCheckForTests(null); });
  it("never in public preview/profile; quality API only for admins", async () => {
    const m = memoryClaimRepo(); setClaimRepoForTests(m.repo);
    const tok = signClaimToken();
    const id = m.seed({ slug: "q-yoga", category: "yoga", tokenHash: tok.hash, expiresAt: tok.expiresAt });
    Object.assign(m.profiles.get(id)!, { quality_score: 83, quality_tier: "A" });
    const p = await loadClaimPreview(tok.token);
    expect(JSON.stringify(p)).not.toMatch(/quality/);
    const admin = await import("@/lib/claim/admin");
    vi.doMock("@/lib/facilitatorAuth", () => ({ facilitatorFromRequest: async (r: Request) => (r.headers.get("authorization") ? { userId: r.headers.get("authorization")!.slice(7), name: "x", email: "x@x.de", id: "f" } : null) }));
    vi.resetModules();
    const { POST } = await import("@/app/api/claim/quality/route");
    const { setAdminCheckForTests } = await import("@/lib/claim/admin");
    const { setClaimRepoForTests: setRepo2 } = await import("@/lib/claim/repo");
    setRepo2(m.repo);
    setAdminCheckForTests(async (u) => u === "admin-1");
    const call = (auth?: string) => POST(new Request("https://orive.test/api/claim/quality", { method: "POST", headers: { "content-type": "application/json", origin: "https://orive.test", ...(auth ? { authorization: `Bearer ${auth}` } : {}) }, body: JSON.stringify({ token: tok.token }) }));
    expect((await call()).status).toBe(404);
    expect((await call("user-9")).status).toBe(404);
    const ok = await call("admin-1");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ score: 83, tier: "A" });
    setRepo2(null); admin.setAdminCheckForTests(null); vi.doUnmock("@/lib/facilitatorAuth");
  });
});
