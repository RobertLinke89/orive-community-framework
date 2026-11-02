import { describe, it, expect, vi } from "vitest";
vi.mock("@/components/SessionBookingModal", () => ({ SessionBookingModal: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } }));
import { renderProfileHtml } from "@/components/claim/ProfileView";
import { validateUpload } from "@/lib/claim/media";

const profile: any = { id: "p", slug: "x", display_name: "Monika Test", category: "yoga", categories: [], city: "Strobl", country: "Austria", website: null,
  instagram: null, colourway: "dark", cover_key: null, status: "draft", profile_id: null, bio: "Bio." };

describe("uploadable cover image", () => {
  it("uses the uploaded cover instead of the category default", () => {
    const h = renderProfileHtml(profile, [], "live", "de", { cover: { url: "https://cdn.example.com/a/b.webp", alt: "Yogaraum" } });
    expect(h).toContain("url('https://cdn.example.com/a/b.webp')");
    expect(h).not.toContain("/claim/covers/");
    expect(h).toContain("Yogaraum");
  });
  it("falls back to the category cover and rejects unsafe urls", () => {
    expect(renderProfileHtml(profile, [], "live", "de", {})).toContain("/claim/covers/");
    const bad = renderProfileHtml(profile, [], "live", "de", { cover: { url: "javascript:alert(1)", alt: "x" } });
    expect(bad).toContain("/claim/covers/"); expect(bad).not.toContain("javascript:");
  });
  it("accepts kind cover and is not limited by gallery count", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
    const r = validateUpload({ kind: "cover", bytes, declaredType: "image/jpeg", alt: "Titelbild Raum", rightsConfirmed: "true", galleryCount: 99 });
    expect(r.ok).toBe(true);
  });
});
