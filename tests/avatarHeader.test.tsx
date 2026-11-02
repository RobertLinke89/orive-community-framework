import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));
import { renderProfileHtml, avatarHtml } from "@/components/claim/ProfileView";
const profile: any = { id: "p", slug: "x", display_name: "Monika Test", category: "yoga", categories: [], city: "Strobl", country: "Austria", website: null,
  instagram: null, colourway: "white", cover_key: null, status: "draft", profile_id: null, bio: null };
describe("centred header + photo avatar", () => {
  it("falls back to initials, centred head", () => {
    const h = renderProfileHtml(profile, [], "live", "de", {});
    expect(h).toContain('class="head centered"'); expect(h).toContain('avatar ini">MT<');
  });
  it("single photo and collage (max 3), unsafe urls dropped", () => {
    expect(avatarHtml([{ url: "https://cdn.x/a.jpg", alt: "Monika" }], "MT")).toContain('class="avatar-stack n1"');
    const c = avatarHtml([1, 2, 3, 4].map((i) => ({ url: `https://cdn.x/${i}.jpg`, alt: `v${i}` })), "MT");
    expect(c).toContain("n3"); expect(c).toContain("avatar sub s2"); expect(c).not.toContain("4.jpg");
    const bad = avatarHtml([{ url: "javascript:alert(1)", alt: "x" }], "MT");
    expect(bad).not.toContain("javascript:"); expect(bad).toContain("ini");
  });
});
