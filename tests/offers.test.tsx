import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { setServerDbForTests } from "@/lib/serverDb";
import { setCrawlerDbForTests, loadCategoryOffers, loadOffer, loadProfileOffers } from "@/lib/offers/repo";
import { fromPriceLabel, groupByType, priceLabel, sortOffers, toPublicOffer, type OfferRow } from "@/lib/offers/model";
import { CategoryOffersView, FacilitatorOffersSection, OfferDetailView } from "@/components/offers/OfferViews";
import { isPubliclyVisible } from "@/lib/claim/visibility";
import { uniqueSlug } from "@/lib/claim/slugs";
import { fakeSupabase } from "./support/fakeSupabase";

const F = { pub: "11111111-1111-4111-8111-111111111111", claimed: "22222222-2222-4222-8222-222222222222", draft: "33333333-3333-4333-8333-333333333333", hidden: "44444444-4444-4444-8444-444444444444" };
const profiles = [
  { source_facilitator_id: F.pub, slug: "anna-mueller", display_name: "Anna Müller", category: "yoga", city: "Berlin", status: "draft", published_at: "2026-11-01T10:00:00Z", hidden_at: null, terms_consented_at: null },
  { source_facilitator_id: F.claimed, slug: "ben-yoga", display_name: "Ben", category: "yoga", city: null, status: "live", published_at: null, hidden_at: null, terms_consented_at: "2026-10-30T10:00:00Z" },
  { source_facilitator_id: F.draft, slug: "crawled-only", display_name: "Crawled Only", category: "yoga", city: null, status: "draft", published_at: null, hidden_at: null, terms_consented_at: null },
  { source_facilitator_id: F.hidden, slug: "opted-out", display_name: "Opted Out", category: "yoga", city: null, status: "draft", published_at: "2026-11-01T10:00:00Z", hidden_at: "2026-11-02T10:00:00Z", terms_consented_at: null },
];
let n = 0;
const off = (fac: string, type: string, extra: Partial<OfferRow> = {}): OfferRow => ({ id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(++n).padStart(12, "0")}`, facilitator_id: fac, type, title: `${type} ${n}`, description: null, price: null, currency: "EUR", duration: null, url: null, image_url: null, starts_at: null, ...extra });
const offers = [
  off(F.pub, "service", { price: "80", image_url: "https://example.com/a.jpg" }), off(F.pub, "freebie", { price: 0 }),
  off(F.pub, "event", { starts_at: "2027-03-01T18:00:00Z", title: "Late" }), off(F.pub, "event", { starts_at: "2027-01-10T18:00:00Z", title: "Early" }),
  off(F.claimed, "course", { price: 120 }), off(F.draft, "service", { price: 50 }), off(F.hidden, "product", { price: 30 }),
];
function setup() {
  const app = fakeSupabase({ claimable_profiles: profiles }), crawler = fakeSupabase({ facilitator_offers: offers });
  setServerDbForTests(app.client); setCrawlerDbForTests(crawler.client);
  return { app, crawler };
}
afterEach(() => { setServerDbForTests(undefined); setCrawlerDbForTests(undefined); });

describe("visibility gate", () => {
  it("approved batch or claimed+consented, never hidden, never plain drafts", () => {
    expect(isPubliclyVisible(profiles[0])).toBe(true);
    expect(isPubliclyVisible(profiles[1])).toBe(true);
    expect(isPubliclyVisible(profiles[2])).toBe(false);
    expect(isPubliclyVisible(profiles[3])).toBe(false);
  });
  it("category listing only contains offers of visible facilitators", async () => {
    const { crawler } = setup();
    const r = (await loadCategoryOffers("yoga"))!;
    const facs = new Set(r.offers.map((o) => o.facilitator.slug));
    expect([...facs].sort()).toEqual(["anna-mueller", "ben-yoga"]);
    expect(r.counts.product).toBe(0);                      // hidden facilitator's product gone
    // crawler table is never queried without the facilitator allowlist
    expect(crawler.log.every((q) => q.filters.includes("in:facilitator_id") || q.filters.includes("eq:id"))).toBe(true);
  });
  it("profile offers: none for a non-published draft or hidden profile", async () => {
    setup();
    expect(await loadProfileOffers("yoga", "crawled-only")).toEqual([]);
    expect(await loadProfileOffers("yoga", "opted-out")).toEqual([]);
    expect((await loadProfileOffers("yoga", "anna-mueller")).map((g) => g.type)).toEqual(["service", "event", "freebie"]);
  });
  it("offer detail 404s for hidden/draft facilitators and wrong category", async () => {
    setup();
    expect(await loadOffer("yoga", offers[5].id)).toBeNull();
    expect(await loadOffer("yoga", offers[6].id)).toBeNull();
    expect(await loadOffer("breathwork", offers[0].id)).toBeNull();
    expect(await loadOffer("yoga", "not-a-uuid")).toBeNull();
    const ok = (await loadOffer("yoga", offers[0].id))!;
    expect(ok.offer.facilitator.href).toBe("/yoga/anna-mueller");
    expect(ok.more.length).toBe(3);
  });
  it("without crawler env nothing is shown", async () => {
    setServerDbForTests(fakeSupabase({ claimable_profiles: profiles }).client); setCrawlerDbForTests(null);
    expect((await loadCategoryOffers("yoga"))!.offers).toEqual([]);
  });
});

describe("model", () => {
  const fac = { source_facilitator_id: F.pub, slug: "anna-mueller", display_name: "Anna", category: "yoga" as const, city: null };
  it("rejects facilitator mismatch and unknown types", () => {
    expect(toPublicOffer(off(F.draft, "service"), fac)).toBeNull();
    expect(toPublicOffer(off(F.pub, "webinar"), fac)).toBeNull();
  });
  it("every offer has an image; fallback is a labelled category image (non-https ignored)", () => {
    const o = toPublicOffer(off(F.pub, "service", { image_url: "http://insecure/x.jpg" }), fac)!;
    expect(o.image).toMatchObject({ url: "/claim/covers/yoga.jpg", label: "Beispielbild" });
    const p = toPublicOffer(off(F.pub, "service"), { ...fac, category: "personal" })!;
    expect(p.image.url).toBe("/claim/covers/coaching.jpg");
  });
  it("price only when real; 'ab X' ignores free", () => {
    const a = toPublicOffer(off(F.pub, "service"), fac)!, b = toPublicOffer(off(F.pub, "service", { price: 0 }), fac)!, c = toPublicOffer(off(F.pub, "service", { price: "45" }), fac)!;
    expect(priceLabel(a)).toBeNull();
    expect(priceLabel(b)).toBe("Kostenlos");
    expect(fromPriceLabel([a, b, c])).toMatch(/^ab 45\s?€$/);
    expect(fromPriceLabel([a, b])).toBeNull();
  });
  it("events sorted by starts_at, past events dropped", () => {
    const now = +new Date("2026-12-01T00:00:00Z");
    const ev = (t: string, s: string | null) => toPublicOffer(off(F.pub, "event", { title: t, starts_at: s }), fac)!;
    const s = sortOffers([ev("C", "2027-02-01T10:00:00Z"), ev("Past", "2026-01-01T10:00:00Z"), ev("Undated", null), ev("A", "2026-12-24T10:00:00Z")], now);
    expect(s.map((o) => o.title)).toEqual(["A", "C", "Undated"]);
    expect(groupByType(s, now)[0].type).toBe("event");
  });
});

describe("views", () => {
  it("cards link to detail, detail links back to profile, booking button #0F766E, all cards have images", async () => {
    setup();
    const r = (await loadCategoryOffers("yoga", "event"))!;
    const list = renderToStaticMarkup(<CategoryOffersView {...r} />);
    expect(list).toContain('href="/yoga/angebote?typ=event" aria-current="page"');
    expect(list.indexOf("Early")).toBeLessThan(list.indexOf("Late"));
    const d = (await loadOffer("yoga", offers[0].id))!;
    const html = renderToStaticMarkup(<OfferDetailView {...d} />);
    expect(html).toContain('class="obook" href="/yoga/anna-mueller"');
    const sec = renderToStaticMarkup(<FacilitatorOffersSection groups={await loadProfileOffers("yoga", "anna-mueller")} category="yoga" />);
    expect((sec.match(/class="ocard"/g) || []).length).toBe((sec.match(/<img /g) || []).length);
    expect(sec).toContain(`href="${d.offer.href}"`);
    expect(sec).toContain("Beispielbild");
  });
  it("'angebote' can never become a profile slug", () => {
    expect(uniqueSlug("angebote", new Set())).toBe("angebote-2");
  });
});
