import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (r: Request) => { const a = r.headers.get("authorization"); return a ? { userId: a.slice(7), name: "Anna", email: "a@x.de", id: "f" } : null; },
}));
import { renderProfileHtml, galleryHtml, productsHtml, ctaHtml, safeImg, hasBookable } from "@/components/claim/ProfileView";
import { validateUpload, sniffImageType, ownsPath, storagePath, setMediaStoreForTests, loadProfileMedia } from "@/lib/claim/media";
import { precheck } from "@/components/claim/MediaManager";
import { setClaimRepoForTests } from "@/lib/claim/repo";
import { memoryClaimRepo } from "./support/memoryClaimRepo";
import { memoryMediaStore } from "./support/memoryMediaStore";
import sharp from "sharp";
import { beforeAll } from "vitest";
import type { ClaimableOffer, GalleryImage, PublicProfile } from "@/lib/claim/types";

const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0]);
const img = (i: number, over: Partial<GalleryImage> = {}): GalleryImage => ({ id: `g${i}`, position: i, url: `https://cdn.test/${i}.jpg`, alt: `Raum ${i}`, ...over });
const profile = { id: "p1", slug: "anna", display_name: "Anna Yoga", category: "yoga", categories: [], city: "Berlin", country: "Germany", website: "https://anna.test",
  instagram: null, colourway: "dark", cover_key: null, status: "live", profile_id: null, bio: "Hallo" } as unknown as PublicProfile;
const offer = (o: Partial<ClaimableOffer> = {}): ClaimableOffer => ({ id: "o1", position: 0, title: "Vinyasa", description: "Fluss", duration_minutes: 60, format: "in_person",
  price_amount: 20, currency: "EUR", is_preset: false, offering_id: "of1", ...o });

describe("gallery rendering", () => {
  it("hidden when empty", () => {
    expect(galleryHtml([], "de")).toBe(""); expect(galleryHtml(undefined, "de")).toBe("");
    expect(renderProfileHtml(profile, [offer()], "live", "de", {}, "day")).not.toContain("data-gallery");
  });
  it("hero + grid, alt text, lazy, +N badge, max 12", () => {
    const h = galleryHtml(Array.from({ length: 14 }, (_, i) => img(i)), "de");
    expect(h).toContain("data-gallery");
    expect(h).toContain('alt="Raum 0"');
    expect(h).toContain('loading="lazy"');
    expect((h.match(/class="gcell/g) || []).length).toBe(5);
    expect(h).toContain("Alle 12 Bilder");
    expect(h).not.toContain("Raum 12");
  });
  it("escapes alt and rejects unsafe urls", () => {
    expect(safeImg("javascript:alert(1)")).toBeNull();
    expect(safeImg("http://x.test/a.jpg")).toBeNull();
    expect(safeImg("//evil.test/a.jpg")).toBeNull();
    expect(safeImg("/placeholders/a.jpg")).toBe("/placeholders/a.jpg");
    const h = galleryHtml([img(0, { alt: '"><script>x</script>' }), img(1, { url: "javascript:alert(1)" })], "de");
    expect(h).not.toContain("<script>"); expect(h).not.toContain("javascript:");
  });
  it("shows the Beispielbild label badge", () => {
    expect(galleryHtml([img(0, { label: "Beispielbild" })], "de")).toContain('class="imglabel">Beispielbild');
  });
  it("gallery sits before offers; offer and product images render", () => {
    const h = renderProfileHtml(profile, [offer({ image: { url: "https://cdn.test/o.jpg", alt: "Matte" } })], "live", "de",
      { gallery: [img(0)], products: [{ id: "pr", position: 0, title: "Yogamatte", description: null, price_amount: 49, currency: "EUR", url: "https://shop.test", image: { url: "https://cdn.test/p.jpg", alt: "Matte grün" } }] }, "day");
    expect(h.indexOf("data-gallery")).toBeLessThan(h.indexOf("Vinyasa"));
    expect(h).toContain('alt="Matte"'); expect(h).toContain('alt="Matte grün"'); expect(h).toContain("Yogamatte");
    expect(productsHtml([], "de")).toBe("");
  });
});

describe("empty offers + booking bar", () => {
  it("shows 'Noch keine Angebote' and no CTA", () => {
    const h = renderProfileHtml(profile, [], "live", "de", {}, "day");
    expect(h).toContain("Noch keine Angebote"); expect(h).not.toContain('class="cta"');
  });
  it("CTA only when something is bookable", () => {
    expect(hasBookable([offer({ is_preset: true, offering_id: null })], "live")).toBe(false);
    expect(hasBookable([offer()], "live")).toBe(true);
    expect(hasBookable([offer()], "draft")).toBe(false);
    expect(ctaHtml("Buchen", "live", "de", false)).toBe("");
    expect(renderProfileHtml(profile, [offer()], "live", "de", {}, "day")).toContain('class="book-cta"');
  });
  it("day theme is default white, night is opt-in", () => {
    expect(renderProfileHtml(profile, [], "live", "de")).toContain('data-theme="auto"');
    const n = renderProfileHtml(profile, [], "live", "de", {}, "night");
    expect(n).toContain('data-theme="night"'); expect(n).toMatch(/class="[^"]*white/);
  });
});

describe("upload validation", () => {
  const base = { kind: "gallery" as const, bytes: JPG, alt: "Heller Raum", rightsConfirmed: "true", galleryCount: 0 };
  it("sniffs real type by magic bytes", () => {
    expect(sniffImageType(JPG)).toBe("image/jpeg"); expect(sniffImageType(PNG)).toBe("image/png");
    expect(sniffImageType(WEBP)).toBe("image/webp"); expect(sniffImageType(GIF)).toBeNull();
  });
  it("enforces rights, alt, type, size, count", () => {
    expect(validateUpload(base)).toMatchObject({ ok: true, mime: "image/jpeg", ext: "jpg" });
    expect(validateUpload({ ...base, rightsConfirmed: null })).toEqual({ ok: false, error: "rights_required" });
    expect(validateUpload({ ...base, alt: "a" })).toEqual({ ok: false, error: "alt_required" });
    expect(validateUpload({ ...base, bytes: GIF, declaredType: "image/jpeg" })).toEqual({ ok: false, error: "bad_type" });
    expect(validateUpload({ ...base, bytes: new Uint8Array(5 * 1024 * 1024 + 1) })).toEqual({ ok: false, error: "too_large" });
    expect(validateUpload({ ...base, galleryCount: 12 })).toEqual({ ok: false, error: "gallery_full" });
    expect(validateUpload({ ...base, kind: "offer", galleryCount: 12 }).ok).toBe(true);
  });
  it("client precheck mirrors it", () => {
    expect(precheck({ type: "image/png", size: 10 }, "Raum", true, 0, "gallery")).toBeNull();
    expect(precheck({ type: "image/gif", size: 10 }, "Raum", true, 0, "gallery")).toBe("type");
    expect(precheck({ type: "image/png", size: 10 }, "Raum", false, 0, "gallery")).toBe("needRights");
    expect(precheck({ type: "image/png", size: 10 }, "Raum", true, 12, "gallery")).toBe("full");
  });
  it("storage paths live in the owner's folder", () => {
    const u = crypto.randomUUID(); const p = storagePath(u, "png");
    expect(ownsPath(u, p)).toBe(true); expect(ownsPath(crypto.randomUUID(), p)).toBe(false); expect(ownsPath(u, `${u}/../x.png`)).toBe(false);
  });
});

let REAL: Uint8Array;
beforeAll(async () => { REAL = new Uint8Array(await sharp({ create: { width: 900, height: 600, channels: 3, background: "#3a8" } }).jpeg().toBuffer()); });

describe("media API", () => {
  let ip = "", m: ReturnType<typeof memoryClaimRepo>, ms: ReturnType<typeof memoryMediaStore>, owner: string, pid: string;
  beforeEach(() => {
    m = memoryClaimRepo(); setClaimRepoForTests(m.repo); ms = memoryMediaStore(); setMediaStoreForTests(ms.s);
    owner = crypto.randomUUID(); ip = `10.0.0.${Math.floor(Math.random() * 250)}`;
    pid = m.seed({ slug: "anna", category: "yoga", tokenHash: "h", expiresAt: new Date(Date.now() + 1e6) });
    Object.assign(m.profiles.get(pid)!, { claimed_by: owner, status: "live", terms_consented_at: new Date().toISOString() });
  });
  afterEach(() => { setClaimRepoForTests(null as any); setMediaStoreForTests(null); });
  beforeEach(async () => (await import("@/lib/rateLimit")).resetRateLimits());
  const H = (u: string) => ({ origin: "https://orive.test", authorization: `Bearer ${u}`, "x-forwarded-for": ip });
  const up = (u: string, f: Partial<Record<string, string | Blob>> = {}) => {
    const fd = new FormData(); fd.set("file", new Blob([REAL], { type: "image/jpeg" }), "a.jpg"); fd.set("kind", "gallery"); fd.set("alt", "Heller Raum"); fd.set("rights", "true");
    for (const [k, v] of Object.entries(f)) v === undefined ? fd.delete(k) : fd.set(k, v as any);
    return new Request("https://orive.test/api/claim/media", { method: "POST", headers: H(u), body: fd });
  };
  it("owner uploads; rights + type enforced; others rejected; 12 max", async () => {
    const { POST, GET } = await import("@/app/api/claim/media/route") as any;
    expect((await POST(up(owner))).status).toBe(201);
    expect((await POST(up(owner, { rights: undefined }))).status).toBe(400);
    expect((await POST(up(owner, { file: new Blob([GIF], { type: "image/jpeg" }) }))).status).toBe(415);
    expect((await POST(up(crypto.randomUUID()))).status).toBe(404);
    expect([...ms.files.keys()].every((p) => p.startsWith(`${owner}/`))).toBe(true);
    for (let i = 1; i < 12; i++) expect((await POST(up(owner))).status).toBe(201);
    expect((await POST(up(owner))).status).toBe(409);
    const g = await (await GET(new Request("https://orive.test/api/claim/media", { headers: H(owner) }))).json();
    expect(g.media).toHaveLength(12); expect(g.media[0].url).toMatch(/^https:\/\/signed\.test\//);
  });
  it("reorder needs the exact set, delete removes file, offer image replaces old", async () => {
    const { POST, PATCH, DELETE } = await import("@/app/api/claim/media/route") as any;
    for (let i = 0; i < 3; i++) await POST(up(owner, { alt: `Bild ${i}` }));
    const ids = (await ms.s.list(pid)).map((r) => r.id);
    const patch = (b: unknown) => PATCH(new Request("https://orive.test/api/claim/media", { method: "PATCH", headers: { ...H(owner), "content-type": "application/json" }, body: JSON.stringify(b) }));
    expect((await patch({ order: ids.slice(0, 2) })).status).toBe(400);
    expect((await patch({ order: [...ids].reverse() })).status).toBe(200);
    expect((await ms.s.list(pid))[0].alt).toBe("Bild 2");
    const del = await DELETE(new Request(`https://orive.test/api/claim/media?id=${ids[0]}`, { method: "DELETE", headers: H(owner) }));
    expect(del.status).toBe(200); expect(ms.files.size).toBe(6); // 2 images x 3 variants (400/800/900)
    const oid = [...m.offers.values()].find((o) => o.pid === pid)!.id;
    await POST(up(owner, { kind: "offer", offerId: oid })); await POST(up(owner, { kind: "offer", offerId: oid, alt: "Neu" }));
    const offerImgs = (await ms.s.list(pid)).filter((r) => r.kind === "offer");
    expect(offerImgs).toHaveLength(1); expect(offerImgs[0].alt).toBe("Neu"); expect(ms.files.size).toBe(9);
  });
  it("public page loader resolves gallery + offer images, drops missing files", async () => {
    const { POST } = await import("@/app/api/claim/media/route") as any;
    await POST(up(owner)); await POST(up(owner, { alt: "Zweites" }));
    const first = (await ms.s.list(pid))[0]; ms.files.delete(first.storage_path);
    const r = await loadProfileMedia(pid, [], { publishedProductsOnly: true });
    expect(r.extras.gallery?.map((g) => g.alt)).toEqual(["Zweites"]);
  });
});
