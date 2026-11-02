import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

class NotFound extends Error { constructor() { super("NEXT_NOT_FOUND"); } }
class Redirect extends Error { constructor(public to: string, public status: number) { super(`REDIRECT ${status} ${to}`); } }
vi.mock("next/navigation", () => ({
  notFound: () => { throw new NotFound(); },
  permanentRedirect: (to: string) => { throw new Redirect(to, 308); },
}));
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (r: Request) => { const a = r.headers.get("authorization"); return a ? { userId: a.slice(7), name: "Anna", email: "a@x.de", id: "f" } : null; },
}));

import { CATEGORY_SLUGS, RESERVED_TOP_LEVEL, categoryFromSlug, nameSlug, uniqueSlug, profileUrl, SLUG_RE } from "@/lib/claim/slugs";
import { CATEGORY_KEYS } from "@/lib/claim/categories";
import { mapCrawlerRow } from "@/lib/claim/mapCrawler";
import { setClaimRepoForTests } from "@/lib/claim/repo";
import { signClaimToken } from "@/lib/claim/claimToken";
import { completeClaim, canonicalPathFor, canonicalPathForUsername, loadLiveProfile } from "@/lib/claim/service";
import { ACCOUNT_CONSENT_VERSION } from "@/lib/account-consent-text";
import { memoryClaimRepo } from "./support/memoryClaimRepo";

process.env.CLAIM_TOKEN_SECRET = "t".repeat(16) + crypto.randomUUID();
const C = { granted: true, version: ACCOUNT_CONSENT_VERSION, lang: "de" } as const;

describe("slug scheme", () => {
  it("category slugs: 12, kebab-case, unique, never a top-level route", () => {
    const v = Object.values(CATEGORY_SLUGS);
    expect(Object.keys(CATEGORY_SLUGS).sort()).toEqual([...CATEGORY_KEYS].sort());
    expect(new Set(v).size).toBe(12);
    for (const s of v) { expect(s).toMatch(SLUG_RE); expect(RESERVED_TOP_LEVEL as readonly string[]).not.toContain(s); }
    expect(CATEGORY_SLUGS).toMatchObject({ breath: "breathwork", sound: "sound-healing", coaching: "life-coaching", spiritual: "spiritual-growth", ice: "ice-bathing" });
  });
  it("only exact known category slugs match", () => {
    expect(categoryFromSlug("breathwork")).toBe("breath");
    for (const s of ["about", "login", "api", "auth", "Breathwork", "breath", "f", "", "breathwork/"]) expect(categoryFromSlug(s)).toBeNull();
  });
  it("transliterates names to ASCII", () => {
    expect(nameSlug("Anna Müller")).toBe("anna-mueller");
    expect(nameSlug("Jörg Weiß")).toBe("joerg-weiss");
    expect(nameSlug("ÜNAL ÖZTÜRK")).toBe("uenal-oeztuerk");
    expect(nameSlug("José Núñez-Peña")).toBe("jose-nunez-pena");
    expect(nameSlug("Zoë Bjørk & Søren")).toBe("zoe-bjoerk-soeren");
    expect(nameSlug("Own Your Breath (Janine Lohse)")).toBe("own-your-breath");
    expect(nameSlug("李")).toMatch(/^facilitator-/);
  });
  it("unique per category with -2, -3", () => {
    const t = new Set<string>();
    expect([uniqueSlug("anna-mueller", t), uniqueSlug("anna-mueller", t), uniqueSlug("anna-mueller", t)]).toEqual(["anna-mueller", "anna-mueller-2", "anna-mueller-3"]);
    const taken = new Map<any, Set<string>>();
    const row = (name: string, cat: string) => mapCrawlerRow({ id: crypto.randomUUID(), name, categories: [cat], kambo_flag: false, city: null, country: null, website: null, email: null, phone: null, instagram: null, source_url: null, source: null }, taken)!;
    expect([row("Anna Müller", "Breathwork").slug, row("Anna Mueller", "Breathwork").slug, row("Anna Müller", "Yoga").slug, row("Anna Müller", "Breathwork").slug])
      .toEqual(["anna-mueller", "anna-mueller-2", "anna-mueller", "anna-mueller-3"]);
  });
  it("canonical URL", () => {
    expect(profileUrl("breath", "anna-mueller")).toBe("https://orive.test/breathwork/anna-mueller");
  });
});

describe("routes", () => {
  let m: ReturnType<typeof memoryClaimRepo>;
  const claim = async (slug: string, category: any, user: string) => {
    const t = signClaimToken(); const id = m.seed({ slug, category, tokenHash: t.hash, expiresAt: t.expiresAt });
    await completeClaim(t.token, { id: user, name: "Anna" }, C); return id;
  };
  beforeEach(() => { m = memoryClaimRepo(); setClaimRepoForTests(m.repo); });
  afterEach(() => setClaimRepoForTests(null));
  const page = async () => (await import("@/app/[username]/[slug]/page"));

  it("live profile renders at /{category}/{slug} with canonical link", async () => {
    await claim("anna-mueller", "breath", "u1");
    const { default: Page, generateMetadata } = await page();
    const html = renderToStaticMarkup(await Page({ params: { username: "breathwork", slug: "anna-mueller" } }));
    expect(html).toContain("orive-tpl");
    const meta = await generateMetadata({ params: { username: "breathwork", slug: "anna-mueller" } });
    expect(meta.alternates?.canonical).toBe("https://orive.test/breathwork/anna-mueller");
    expect(meta.robots).toMatchObject({ index: true });
  });
  it("404: drafts, unconsented live rows, unknown categories, top-level route names", async () => {
    const t = signClaimToken(); const draft = m.seed({ slug: "draft-one", category: "yoga", tokenHash: t.hash, expiresAt: t.expiresAt });
    const id = await claim("no-consent", "yoga", "u2"); m.profiles.get(id)!.terms_consented_at = null;
    const { default: Page } = await page();
    for (const params of [{ username: "yoga", slug: "draft-one" }, { username: "yoga", slug: "no-consent" }, { username: "about", slug: "anna" },
      { username: "api", slug: "claim" }, { username: "yoga", slug: "../etc" }, { username: "yoga", slug: "nobody" }])
      await expect(Page({ params })).rejects.toBeInstanceOf(NotFound);
    expect(m.profiles.get(draft)!.status).toBe("draft");
  });
  it("same name in two categories = two profiles", async () => {
    await claim("anna-mueller", "breath", "u1"); await claim("anna-mueller", "yoga", "u2");
    expect((await loadLiveProfile("breathwork", "anna-mueller"))?.profile.category).toBe("breath");
    expect((await loadLiveProfile("yoga", "anna-mueller"))?.profile.category).toBe("yoga");
    expect(await canonicalPathFor("anna-mueller")).toBeNull(); // ambiguous -> no guessing
  });
  it("wrong category / upper case -> permanent redirect to canonical", async () => {
    await claim("anna-mueller", "breath", "u1");
    const { default: Page } = await page();
    await expect(Page({ params: { username: "yoga", slug: "anna-mueller" } })).rejects.toMatchObject({ to: "/breathwork/anna-mueller" });
    await expect(Page({ params: { username: "Breathwork", slug: "Anna-Mueller" } })).rejects.toMatchObject({ to: "/breathwork/anna-mueller" });
  });
  it("legacy /f/{slug} -> 301; drafts 404", async () => {
    await claim("anna-mueller", "breath", "u1");
    const t = signClaimToken(); m.seed({ slug: "draft-x", category: "ice", tokenHash: t.hash, expiresAt: t.expiresAt });
    const { GET } = await import("@/app/f/[slug]/route");
    const r = await GET(new Request("https://orive.test/f/anna-mueller"), { params: { slug: "anna-mueller" } });
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("https://orive.test/breathwork/anna-mueller");
    expect((await GET(new Request("https://orive.test/f/draft-x"), { params: { slug: "draft-x" } })).status).toBe(404);
  });
  it("old /{username} of a claimed facilitator -> canonical; others untouched", async () => {
    await claim("anna-mueller", "breath", "u1");
    expect(await canonicalPathForUsername("anna-mueller")).toBe("/breathwork/anna-mueller");
    const { default: Layout } = await import("@/app/[username]/layout");
    await expect(Layout({ children: null, params: { username: "anna-mueller" } })).rejects.toMatchObject({ to: "/breathwork/anna-mueller" });
    expect(await Layout({ children: "x", params: { username: "someone-else" } })).toBeTruthy();
    expect(await Layout({ children: "x", params: { username: "breathwork" } })).toBeTruthy(); // category slug never redirects
  });
  it("claim API: consent mandatory (422), then live under the new URL", async () => {
    const { POST } = await import("@/app/api/claim/complete/route");
    const t = signClaimToken(); m.seed({ slug: "anna-mueller", category: "sound", tokenHash: t.hash, expiresAt: t.expiresAt });
    const req = (body: unknown) => new Request("https://orive.test/api/claim/complete", { method: "POST", headers: { "content-type": "application/json", origin: "https://orive.test", authorization: "Bearer u9" }, body: JSON.stringify(body) });
    const r1 = await POST(req({ token: t.token, turnstileToken: "x" }));
    expect(r1.status).toBe(422);
    expect(await loadLiveProfile("sound-healing", "anna-mueller")).toBeNull();
    const r2 = await POST(req({ token: t.token, turnstileToken: "x", accountConsent: C }));
    expect(r2.status).toBe(200);
    expect(await r2.json()).toMatchObject({ path: "/sound-healing/anna-mueller", shareUrl: "https://orive.test/sound-healing/anna-mueller" });
    expect(m.accountConsents[0]).toMatchObject({ user_id: "u9", version: ACCOUNT_CONSENT_VERSION });
    expect(m.accountConsents[0].sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
