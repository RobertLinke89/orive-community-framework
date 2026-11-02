import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));
import fx from "./fixtures/real-profiles-images.json";
import { renderProfileHtml } from "@/components/claim/ProfileView";

const build = (p: any) => {
  const profile: any = { id: "p", slug: p.slug, display_name: p.display_name, category: p.category, categories: [], city: "X", country: null, website: null,
    instagram: null, colourway: "white", cover_key: null, status: "live", profile_id: null, bio: null };
  const offers = p.offers.map((o: any, i: number) => ({ id: `o${i}`, position: i, title: o.title, description: null, duration_minutes: o.duration_minutes, format: "in_person",
    price_amount: o.price_amount, currency: o.currency || "EUR", is_preset: false, offering_id: `of${i}`, image: o.image }));
  const products = p.products.map((x: any, i: number) => ({ id: `p${i}`, position: i, title: x.title, description: null, price_amount: x.price ?? null, currency: x.currency || "EUR", url: x.url, image: x.image }));
  return renderProfileHtml(profile, offers, "live", "de", { products, avatar: p.avatar }, "day");
};
const section = (h: string, id: string) => { const i = h.indexOf(`id="${id}"`); return i < 0 ? "" : h.slice(i, h.indexOf("</h2>", i) > 0 ? h.indexOf("</h2>", i) : undefined); };
const cards = (s: string) => s.split(/<div class="card/).slice(1);

describe("real-profile fixtures: every offer/product card shows an image", () => {
  for (const p of (fx as any).profiles) {
    it(`${p.slug}: ${p.offers.length} offers, ${p.products.length} products all with image`, () => {
      for (const x of [...p.offers, ...p.products]) {
        expect(x.image?.url, x.title).toBeTruthy();
        if (x.image.kind === "beispiel") expect(x.image.label).toBe("Beispielbild");
      }
      const h = build(p);
      const oc = cards(section(h, "angebote")), pc = cards(section(h, "produkte"));
      expect(oc.length).toBe(p.offers.length); expect(pc.length).toBe(p.products.length);
      for (const c of [...oc, ...pc]) { expect(c.startsWith(" has-img") || c.startsWith(" prod has-img")).toBe(true); expect(c).toMatch(/<figure class="[op]img"><img src="\/__offer\//); }
      const labels = (h.match(/class="imglabel">Beispielbild</g) || []).length;
      expect(labels).toBe([...p.offers, ...p.products].filter((x: any) => x.image.kind === "beispiel").length);
      expect(h).toContain('class="avatar photo"><img src="/__av/');
    });
  }
  it("breath circle example block is removed on breathwork only", () => {
    const ps = (fx as any).profiles;
    expect(build(ps.find((p: any) => p.category === "breath"))).not.toContain('class="bhero"');
    for (const p of ps.filter((p: any) => p.category !== "breath")) expect(build(p)).not.toContain("Breathe in");
  });
});
