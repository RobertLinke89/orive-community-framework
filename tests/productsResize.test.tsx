import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (r: Request) => { const a = r.headers.get("authorization"); return a ? { userId: a.slice(7), name: "Anna", email: "a@x.de", id: "f" } : null; },
}));
import sharp from "sharp";
import { processImage, VARIANT_WIDTHS } from "@/lib/claim/imageProcessing";
import { validateProduct } from "@/lib/claim/products";
import { setMediaStoreForTests, loadProfileMedia, mediaPaths } from "@/lib/claim/media";
import { setClaimRepoForTests } from "@/lib/claim/repo";
import { renderProfileHtml, bookCtaHtml, safeSrcset } from "@/components/claim/ProfileView";
import { memoryClaimRepo } from "./support/memoryClaimRepo";
import { memoryMediaStore } from "./support/memoryMediaStore";
import type { ClaimableOffer, PublicProfile } from "@/lib/claim/types";

let GPS_JPG: Uint8Array, PORTRAIT: Uint8Array;
beforeAll(async () => {
  // 2400x1600 JPEG with EXIF incl. GPS + camera fields
  GPS_JPG = new Uint8Array(await sharp({ create: { width: 2400, height: 1600, channels: 3, background: "#c96" } }).jpeg()
    .withExif({ IFD0: { Make: "TestCam", Model: "X1", Artist: "Anna Privat" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "52/1 31/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "13/1 24/1 0/1" } }).toBuffer());
  // stored 1600x1200 but EXIF orientation 6 (= rotated 90°): displayed as 1200x1600
  PORTRAIT = new Uint8Array(await sharp({ create: { width: 1600, height: 1200, channels: 3, background: "#39c" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer());
});

describe("image processing (sharp)", () => {
  it("input really carries EXIF/GPS (fixture sanity)", async () => {
    const m = await sharp(GPS_JPG).metadata();
    expect(m.exif?.length).toBeGreaterThan(0);
    expect(Buffer.from(m.exif!).toString("latin1")).toContain("TestCam");
  });
  it("makes 400/800/1600 WebP variants, strips EXIF/GPS/XMP/IPTC", async () => {
    const r = await processImage(GPS_JPG);
    expect(r.variants.map((v) => v.width)).toEqual([...VARIANT_WIDTHS]);
    expect(r).toMatchObject({ width: 1600, height: 1067, mime: "image/webp" });
    for (const v of r.variants) {
      const m = await sharp(v.bytes).metadata();
      expect(m.format).toBe("webp");
      expect(m.exif).toBeUndefined(); expect(m.xmp).toBeUndefined(); expect(m.iptc).toBeUndefined();
      expect(Buffer.from(v.bytes).toString("latin1")).not.toMatch(/TestCam|Anna Privat|GPS/);
      expect(m.width).toBe(v.width);
    }
  });
  it("applies EXIF orientation before stripping it", async () => {
    const r = await processImage(PORTRAIT);
    expect(r.width).toBe(1200); expect(r.height).toBe(1600);
    expect(r.variants.map((v) => v.width)).toEqual([400, 800, 1200]); // never upscaled
    expect((await sharp(r.variants[2].bytes).metadata()).orientation).toBeUndefined();
  });
  it("rejects undecodable and tiny images", async () => {
    await expect(processImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8]))).rejects.toThrow("bad_type");
    const tiny = new Uint8Array(await sharp({ create: { width: 120, height: 120, channels: 3, background: "#fff" } }).png().toBuffer());
    await expect(processImage(tiny)).rejects.toThrow("too_small");
  });
  it("variant paths + srcset on the public page", () => {
    expect(mediaPaths({ storage_path: "a/b.webp", variants: [400, 800, 1600] })).toEqual(["a/b.webp", "a/b-w800.webp", "a/b-w400.webp"]);
    expect(mediaPaths({ storage_path: "a/b.jpg", variants: [] })).toEqual(["a/b.jpg"]);
    expect(safeSrcset("https://x.test/a 400w, https://x.test/b 800w")).toBe("https://x.test/a 400w, https://x.test/b 800w");
    expect(safeSrcset("javascript:alert(1) 400w")).toBeNull();
    expect(safeSrcset('https://x.test/a" onerror=x 400w')).toBeNull();
  });
});

describe("product validation", () => {
  it("full create + partial update", () => {
    expect(validateProduct({ title: "Gutschein", price_amount: "49.999", url: "https://shop.test/x" })).toEqual({ ok: true, value: { title: "Gutschein", description: null, price_amount: 50, currency: "EUR", url: "https://shop.test/x", status: "draft" } });
    expect(validateProduct({ title: "x" })).toEqual({ ok: false, error: "title_required" });
    expect(validateProduct({ title: "Matte", price_amount: -1 })).toEqual({ ok: false, error: "bad_price" });
    expect(validateProduct({ title: "Matte", url: "javascript:alert(1)" })).toEqual({ ok: false, error: "bad_url" });
    expect(validateProduct({ status: "published" }, true)).toEqual({ ok: true, value: { status: "published" } });
    expect(validateProduct({ status: "live" }, true)).toEqual({ ok: false, error: "bad_status" });
  });
});

describe("products API + media variants", () => {
  let ip = "", m: ReturnType<typeof memoryClaimRepo>, ms: ReturnType<typeof memoryMediaStore>, owner: string, pid: string;
  beforeEach(async () => {
    (await import("@/lib/rateLimit")).resetRateLimits();
    m = memoryClaimRepo(); setClaimRepoForTests(m.repo); ms = memoryMediaStore(); setMediaStoreForTests(ms.s);
    owner = crypto.randomUUID(); ip = `10.1.0.${Math.floor(Math.random() * 250)}`;
    pid = m.seed({ slug: "anna", category: "yoga", tokenHash: "h", expiresAt: new Date(Date.now() + 1e6) });
    Object.assign(m.profiles.get(pid)!, { claimed_by: owner, status: "live", terms_consented_at: new Date().toISOString() });
  });
  afterEach(() => { setClaimRepoForTests(null as any); setMediaStoreForTests(null); });
  const H = (u: string, json = false) => ({ origin: "https://orive.test", authorization: `Bearer ${u}`, "x-forwarded-for": ip, ...(json ? { "content-type": "application/json" } : {}) });
  const P = (method: string, u: string, body?: unknown, q = "") => new Request(`https://orive.test/api/claim/products${q}`, { method, headers: H(u, !!body), body: body ? JSON.stringify(body) : undefined });

  it("create, edit, publish/unpublish, delete – owner only; public sees published only", async () => {
    const api = await import("@/app/api/claim/products/route") as any;
    const c = await api.POST(P("POST", owner, { title: "Yogamatte Kork", price_amount: 69, url: "https://shop.test/matte" }));
    expect(c.status).toBe(201);
    const id = (await c.json()).product.id;
    expect((await api.POST(P("POST", owner, { title: "" }))).status).toBe(400);
    expect((await api.POST(P("POST", crypto.randomUUID(), { title: "Fremd" }))).status).toBe(404);
    expect((await api.PATCH(P("PATCH", crypto.randomUUID(), { id, title: "Hack" }))).status).toBe(404);
    expect((await loadProfileMedia(pid, [], { publishedProductsOnly: true })).extras.products).toEqual([]); // draft is hidden
    expect((await api.PATCH(P("PATCH", owner, { id, status: "published", title: "Yogamatte Kork (Natur)" }))).status).toBe(200);
    let pub = (await loadProfileMedia(pid, [], { publishedProductsOnly: true })).extras.products!;
    expect(pub.map((p) => p.title)).toEqual(["Yogamatte Kork (Natur)"]);
    const list = await (await api.GET(P("GET", owner))).json();
    expect(list.products).toHaveLength(1); expect(list.max).toBe(24);
    expect((await api.PATCH(P("PATCH", owner, { id, status: "draft" }))).status).toBe(200);
    pub = (await loadProfileMedia(pid, [], { publishedProductsOnly: true })).extras.products!;
    expect(pub).toEqual([]);
    expect((await api.DELETE(P("DELETE", crypto.randomUUID(), undefined, `?id=${id}`))).status).toBe(404);
    expect((await api.DELETE(P("DELETE", owner, undefined, `?id=${id}`))).status).toBe(200);
    expect(ms.products.size).toBe(0);
  });

  it("product image upload: resized variants, srcset, files removed with the product", async () => {
    const api = await import("@/app/api/claim/products/route") as any;
    const media = await import("@/app/api/claim/media/route") as any;
    const id = (await (await api.POST(P("POST", owner, { title: "Klangschale", status: "published" }))).json()).product.id;
    const fd = new FormData(); fd.set("file", new Blob([GPS_JPG], { type: "image/jpeg" }), "x.jpg"); fd.set("kind", "product"); fd.set("productId", id); fd.set("alt", "Klangschale aus Messing"); fd.set("rights", "true");
    const r = await media.POST(new Request("https://orive.test/api/claim/media", { method: "POST", headers: H(owner), body: fd }));
    expect(r.status).toBe(201);
    expect(ms.files.size).toBe(3);
    const row = [...ms.rows.values()][0];
    expect(row).toMatchObject({ mime: "image/webp", width: 1600, height: 1067, variants: [400, 800, 1600] });
    expect(row.storage_path).toMatch(new RegExp(`^${owner}/[0-9a-f-]{36}\\.webp$`));
    for (const b of ms.files.values()) expect((await sharp(b).metadata()).exif).toBeUndefined();
    const pub = (await loadProfileMedia(pid, [], { publishedProductsOnly: true })).extras.products!;
    expect(pub[0].image?.srcset).toMatch(/-w400\.webp 400w, .*-w800\.webp 800w, .*\.webp 1600w$/);
    expect((await api.DELETE(P("DELETE", owner, undefined, `?id=${id}`))).status).toBe(200);
    expect(ms.files.size).toBe(0); expect(ms.rows.size).toBe(0);
  });
});

describe("booking CTA", () => {
  const profile = { id: "p1", slug: "anna", display_name: "Anna", category: "yoga", categories: [], city: "Berlin", country: "Germany", website: null, instagram: null, colourway: "dark", cover_key: null, status: "live", profile_id: null } as unknown as PublicProfile;
  const off = (o: Partial<ClaimableOffer> = {}): ClaimableOffer => ({ id: "o1", position: 0, title: "Vinyasa", description: null, duration_minutes: 60, format: "in_person", price_amount: 20, currency: "EUR", is_preset: false, offering_id: "of1", ...o });
  it("exactly one booking button, inside the cover, no sticky bar / per-offer buttons", () => {
    const h = renderProfileHtml(profile, [off(), off({ id: "o2", offering_id: "of2", price_amount: 15 })], "live", "de", {}, "day");
    expect(h.match(/class="btn-book"/g)?.length).toBe(1);
    expect(h.match(/Termin buchen<\/span>/g)?.length).toBe(1);
    expect(h).not.toContain("book-bar"); expect(h).not.toContain("Termin wählen"); expect(h).not.toContain('class="btn"');
    expect(h).toContain("ab 15");
    const cover = h.slice(h.indexOf('class="cover"'), h.indexOf('class="wrap"'));
    expect(cover).toContain('class="book-cta"'); // overlaid in the cover, not in the centred header
    expect(h).toContain('data-book="of2"'); // offers stay selectable via the card itself
  });
  it("single bookable offer opens its calendar directly", () => {
    expect(bookCtaHtml([off()], "live", "de").head).toContain('data-book="of1"');
  });
  it("hidden when nothing is bookable or in draft", () => {
    for (const [offers, mode] of [[[], "live"], [[off({ is_preset: true, offering_id: null })], "live"], [[off()], "draft"]] as const) {
      const h = renderProfileHtml(profile, offers as any, mode as any, "de", {}, "day");
      expect(h).not.toContain("book-cta"); expect(h).not.toContain("book-bar"); expect(h).not.toContain("Termin buchen");
    }
  });
});

describe("booking CTA contrast", () => {
  const lum = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  it("white on #0F766E meets WCAG AA (>= 4.5)", () => {
    expect((1 + 0.05) / (lum("#0F766E") + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
