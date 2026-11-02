import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));
import { renderProfileHtml, bookCtaHtml } from "@/components/claim/ProfileView";
import { CATEGORIES, categoryFromCrawler } from "@/lib/claim/categories";
import { CATEGORY_SLUGS, categoryFromSlug } from "@/lib/claim/slugs";
import { EXTRA_TEMPLATES } from "@/components/claim/templates/extraTemplates";

const profile: any = { id: "p", slug: "lars-traxel", display_name: "Lars Traxel – Personal Training", category: "personal", categories: ["Personal Coaching"], city: "München", country: null,
  website: "https://www.larstraxel.de/", instagram: null, colourway: "white", cover_key: null, status: "live", profile_id: null, bio: "Sportwissenschaftler" };
const offer = (i: number, price: number | null, currency = "EUR"): any => ({ id: `o${i}`, position: i, title: `Offer ${i}`, description: null, duration_minutes: 60, format: "in_person",
  price_amount: price, currency, is_preset: false, offering_id: `of${i}` });

describe("Personal Coaching category", () => {
  it("is a real category with its own accent, slug and crawler mapping", () => {
    expect(CATEGORIES.personal.label).toBe("Personal Coaching");
    expect(CATEGORIES.personal.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(CATEGORY_SLUGS.personal).toBe("personal-coaching");
    expect(categoryFromSlug("personal-coaching")).toBe("personal");
    for (const c of ["Personal Coaching", "personal training", "Personal Trainer"]) expect(categoryFromCrawler([c])).toBe("personal");
    expect(categoryFromCrawler(["Life Coaching"])).toBe("coaching");
  });
  it("renders the personal template (theme class, label under the name, example blocks labelled)", () => {
    const h = renderProfileHtml(profile, [offer(0, 120)], "live", "de", {}, "day");
    expect(h).toContain('class="orive-tpl variant white c-personal"');
    expect(h).toContain(`--acc:${CATEGORIES.personal.accent}`);
    expect(h).toMatch(/Personal Coaching · <svg[^]*?<\/svg> München/);
    expect(h).toContain("Training focus");
    expect(h).not.toContain("<!--ORIVE:");
    expect((h.match(/class="btn-book"/g) || []).length).toBe(1);
  });
  it("example blocks carry no prices, so they cannot duplicate a provider's real offers", () => {
    const t = EXTRA_TEMPLATES.personal;
    expect(t.body + t.sample).not.toMatch(/[€£]|CHF|\d+\s?(EUR|Euro)/);
    expect((t.body.match(/class="ex"/g) || []).length).toBeGreaterThanOrEqual(2);
  });
  it("'ab X' ignores free intro calls and keeps the provider's currency", () => {
    expect(bookCtaHtml([offer(0, 0, "CHF"), offer(1, 130, "CHF"), offer(2, 599, "CHF")], "live", "de").head).toMatch(/ab 130\sCHF/);
    expect(bookCtaHtml([offer(0, 0)], "live", "de").head).not.toContain('class="from"');
  });
});
