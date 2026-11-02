import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));
import { ProfileView, renderProfileHtml } from "@/components/claim/ProfileView";
import { GoLiveBar, QualityBadge } from "@/components/claim/GoLiveBar";
import { Celebration } from "@/components/claim/Celebration";
import { CATEGORY_KEYS, presetOffers } from "@/lib/claim/categories";
import { CATEGORY_TEMPLATES } from "@/components/claim/templates/categoryTemplates";
import { EXTRA_TEMPLATES } from "@/components/claim/templates/extraTemplates";
import { tierFor } from "@/lib/claim/quality";

const offers = (k: any, preset = true) => presetOffers(k).map((o, i) => ({ id: `o${i}`, position: i, title: o.title, description: o.description, duration_minutes: o.durationMinutes,
  format: o.format, price_amount: o.priceAmount, currency: "EUR", is_preset: preset, offering_id: preset ? null : `of${i}` }));
const profile = (k: any, extra: any = {}): any => ({ id: "p", slug: "x", display_name: "Janine Lohse", category: k, categories: [], city: "Berlin", country: "Germany", website: "https://www.ownyourbreath.de",
  instagram: null, colourway: "dark", cover_key: null, status: "draft", profile_id: null, bio: "Atemarbeit seit 2015.", ...extra });

describe("full category profile (mockup templates reused unchanged)", () => {
  it("every category renders its own template sections + real offers + links", () => {
    for (const k of CATEGORY_KEYS) {
      const html = renderProfileHtml(profile(k), offers(k), "draft", "de");
      expect(html).toContain(`c-${k}`);
      expect(html).toContain("noch nicht öffentlich");
      expect(html.match(/Beispiel/g)!.length).toBeGreaterThanOrEqual(3);
      for (const o of offers(k)) expect(html).toContain(o.title.replace(/&/g, "&amp;"));
      expect(html).toContain("ownyourbreath.de");
      expect(html).toContain("Atemarbeit seit 2015.");
      expect(html).not.toMatch(/<!--ORIVE:/);
      // a distinctive piece of the category's own mockup body is present
      const marker = (CATEGORY_TEMPLATES[k] ?? EXTRA_TEMPLATES[k]).body.replace(/<!--ORIVE:[^>]*-->/g, "").replace(/<div class="bhero">[\s\S]*?<\/p><\/div>\n?/, "").slice(0, 60); // breath circle removed on purpose
      expect(html).toContain(marker);
    }
  });
  it("draft: no booking buttons, no bottom CTA; live: data-book buttons + CTA, no draft banner", () => {
    const d = renderProfileHtml(profile("sound"), offers("sound"), "draft", "de");
    expect(d).not.toContain("data-book");
    expect(d).not.toContain('class="cta"');
    const l = renderProfileHtml(profile("sound", { status: "live" }), offers("sound", false), "live", "de");
    expect(l).toContain('data-book="of0"');
    expect(l).not.toContain('class="cta"'); expect(l.match(/class="btn-book"/g)?.length).toBe(1);
    expect(l).not.toContain("noch nicht öffentlich");
  });
  it("escapes all facilitator data (no HTML injection)", () => {
    const evil = profile("yoga", { display_name: '<img src=x onerror=alert(1)>', bio: "<script>x</script>", website: "javascript:alert(1)", city: '"><b>' });
    const html = renderProfileHtml(evil, [{ ...offers("yoga")[0], title: "<svg onload=1>" }], "draft", "de");
    expect(html).not.toMatch(/<img src=x|<script>x|<svg onload|javascript:alert/);
    expect(html).toContain("&quot;&gt;&lt;b&gt;");
    expect(html).toContain("&lt;img");
  });
  it("go-live toggle at the top; quality badge only when passed (admin)", () => {
    const off = renderToStaticMarkup(<ProfileView profile={profile("breath")} offers={offers("breath")} mode="draft" lang="de"
      top={<GoLiveBar lang="de" live={false} open={false} onToggle={() => {}} />} />);
    expect(off.indexOf('role="switch"')).toBeLessThan(off.indexOf("orive-tpl"));
    expect(off).toContain('aria-checked="false"');
    expect(off).toContain("Live schalten");
    expect(off).not.toContain("oc-q");
    const on = renderToStaticMarkup(<GoLiveBar lang="de" live open={false} onToggle={() => {}} badge={<QualityBadge score={83} tier="A" lang="de" />} />);
    expect(on).toContain('aria-checked="true"');
    expect(on).toContain("Q 83 · A");
  });
  it("tiers", () => {
    expect([80, 79, 65, 64, 50, 49].map(tierFor)).toEqual(["A", "B", "B", "C", "C", "reject"]);
  });
  it("celebration has the share text, big link, copy/share", () => {
    const html = renderToStaticMarkup(<Celebration category="ice" shareUrl="https://orive.co/f/anna" lang="de" />);
    expect(html).toContain("Hier dein Sharing-Link. Bitte teilen jetzt.");
    expect(html).toContain("oc-theme-frost");
  });
});
