import crypto from "crypto";
import { serverDb } from "@/lib/serverDb";
import type { ClaimableOffer, GalleryImage, MediaImage, Product, ProfileExtras } from "./types";

/**
 * Facilitator media (gallery, offer images, product images) in the private Supabase Storage bucket
 * `facilitator-media`, path `{owner_user_id}/{uuid}.{ext}`. The public page only ever gets short-lived signed
 * URLs, and only for live + consented profiles (DB/RLS: migration 20261031000000_facilitator_media.sql).
 */
export const MEDIA_BUCKET = "facilitator-media";
export const MEDIA_LIMITS = {
  galleryMax: 12,
  maxBytes: 5 * 1024 * 1024,
  types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>,
  altMin: 3, altMax: 200,
  productsMax: 24,
  signedUrlTtl: 60 * 60 * 6, // 6 h; pages revalidate every 60 s
};
export type MediaKind = "gallery" | "offer" | "product" | "cover";

/** Real type from the first bytes – the browser-provided MIME type is not trusted. */
export function sniffImageType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export type UploadCheck = { kind: MediaKind; bytes: Uint8Array; declaredType?: string | null; alt: unknown; rightsConfirmed: unknown; galleryCount: number };
export type UploadError = "rights_required" | "alt_required" | "too_large" | "empty" | "bad_type" | "gallery_full" | "bad_kind";

export function validateUpload(c: UploadCheck): { ok: true; mime: string; ext: string; alt: string } | { ok: false; error: UploadError } {
  if (!["gallery", "offer", "product", "cover"].includes(c.kind)) return { ok: false, error: "bad_kind" };
  if (c.rightsConfirmed !== true && c.rightsConfirmed !== "true" && c.rightsConfirmed !== "on") return { ok: false, error: "rights_required" };
  const alt = String(c.alt ?? "").replace(/[\u0000-\u001f]/g, " ").trim();
  if (alt.length < MEDIA_LIMITS.altMin || alt.length > MEDIA_LIMITS.altMax) return { ok: false, error: "alt_required" };
  if (!c.bytes.length) return { ok: false, error: "empty" };
  if (c.bytes.length > MEDIA_LIMITS.maxBytes) return { ok: false, error: "too_large" };
  const mime = sniffImageType(c.bytes);
  if (!mime || !MEDIA_LIMITS.types[mime] || (c.declaredType && c.declaredType !== mime && !(c.declaredType === "image/jpg" && mime === "image/jpeg"))) return { ok: false, error: "bad_type" };
  if (c.kind === "gallery" && c.galleryCount >= MEDIA_LIMITS.galleryMax) return { ok: false, error: "gallery_full" };
  return { ok: true, mime, ext: MEDIA_LIMITS.types[mime], alt };
}

export const storagePath = (ownerId: string, ext: string) => `${ownerId}/${crypto.randomUUID()}.${ext}`;

/** Path must stay inside the owner's folder (also enforced by storage RLS). */
export const ownsPath = (ownerId: string, path: string) => path.startsWith(`${ownerId}/`) && !path.includes("..") && /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path);

export type MediaRow = {
  id: string; owner_id: string; claimable_profile_id: string; kind: MediaKind; offer_id: string | null; product_id: string | null;
  storage_path: string; alt: string; width: number | null; height: number | null; mime: string; bytes: number; position: number;
  /** widths of the stored WebP variants (migration 20261101000000); [] for legacy single-file rows */
  variants?: number[] | null;
};
export type ProductRow = Omit<Product, "image"> & { claimable_profile_id: string; status: "draft" | "published" };

export interface MediaStore {
  list(profileId: string): Promise<MediaRow[]>;
  products(profileId: string, publishedOnly: boolean): Promise<ProductRow[]>;
  insert(row: Omit<MediaRow, "id">): Promise<MediaRow>;
  remove(ownerId: string, id: string): Promise<MediaRow | null>;
  reorder(ownerId: string, profileId: string, ids: string[]): Promise<boolean>;
  setAlt(ownerId: string, id: string, alt: string): Promise<boolean>;
  upload(path: string, bytes: Uint8Array, mime: string): Promise<void>;
  removeObject(path: string): Promise<void>;
  sign(paths: string[]): Promise<Record<string, string>>;
  createProduct(ownerId: string, profileId: string, p: ProductInput): Promise<ProductRow>;
  updateProduct(ownerId: string, id: string, p: Partial<ProductInput>): Promise<ProductRow | null>;
  deleteProduct(ownerId: string, id: string): Promise<boolean>;
}
export type ProductInput = { title: string; description: string | null; price_amount: number | null; currency: string; url: string | null; status: "draft" | "published"; position: number };

const PCOLS = "id,claimable_profile_id,position,title,description,price_amount,currency,url,status";
const normP = (p: any): ProductRow => ({ ...p, price_amount: p.price_amount === null ? null : Number(p.price_amount) });
let override: MediaStore | null = null;
export function setMediaStoreForTests(s: MediaStore | null) { override = s; }
export function mediaStore(): MediaStore | null {
  if (override) return override;
  const db = serverDb();
  if (!db) return null;
  const COLS = "id,owner_id,claimable_profile_id,kind,offer_id,product_id,storage_path,alt,width,height,mime,bytes,position,variants";
  return {
    async list(profileId) {
      const { data } = await db.from("facilitator_media").select(COLS).eq("claimable_profile_id", profileId).order("position");
      return (data || []) as MediaRow[];
    },
    async products(profileId, publishedOnly) {
      let q = db.from("facilitator_products").select("id,claimable_profile_id,position,title,description,price_amount,currency,url,status").eq("claimable_profile_id", profileId).order("position");
      if (publishedOnly) q = q.eq("status", "published");
      const { data } = await q;
      return ((data || []) as any[]).map((p) => ({ ...p, price_amount: p.price_amount === null ? null : Number(p.price_amount) }));
    },
    async insert(row) {
      const { data, error } = await db.from("facilitator_media").insert(row).select(COLS).single();
      if (error || !data) throw new Error(/gallery_full/.test(error?.message || "") ? "gallery_full" : "media_insert_failed");
      return data as MediaRow;
    },
    async remove(ownerId, id) {
      const { data } = await db.from("facilitator_media").delete().eq("id", id).eq("owner_id", ownerId).select(COLS).maybeSingle();
      return (data as MediaRow) ?? null;
    },
    async reorder(ownerId, profileId, ids) {
      const { error } = await db.rpc("reorder_facilitator_media", { p_owner: ownerId, p_profile: profileId, p_ids: ids });
      return !error;
    },
    async setAlt(ownerId, id, alt) {
      const { error, count } = await db.from("facilitator_media").update({ alt }, { count: "exact" }).eq("id", id).eq("owner_id", ownerId);
      return !error && (count ?? 0) > 0;
    },
    async upload(path, bytes, mime) {
      const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, bytes, { contentType: mime, upsert: false, cacheControl: "31536000" });
      if (error) throw new Error("upload_failed");
    },
    async removeObject(path) { await db.storage.from(MEDIA_BUCKET).remove([path]); },
    async sign(paths) {
      if (!paths.length) return {};
      const { data } = await db.storage.from(MEDIA_BUCKET).createSignedUrls(paths, MEDIA_LIMITS.signedUrlTtl);
      return Object.fromEntries((data || []).filter((d) => d.signedUrl && d.path).map((d) => [d.path!, d.signedUrl as string]));
    },
    async createProduct(ownerId, profileId, p) {
      const { data, error } = await db.from("facilitator_products").insert({ ...p, owner_id: ownerId, claimable_profile_id: profileId }).select(PCOLS).single();
      if (error || !data) throw new Error("product_insert_failed");
      return normP(data);
    },
    async updateProduct(ownerId, id, p) {
      const { data } = await db.from("facilitator_products").update({ ...p, updated_at: new Date().toISOString() }).eq("id", id).eq("owner_id", ownerId).select(PCOLS).maybeSingle();
      return data ? normP(data) : null;
    },
    async deleteProduct(ownerId, id) {
      const { data } = await db.from("facilitator_products").delete().eq("id", id).eq("owner_id", ownerId).select("id").maybeSingle();
      return !!data;
    },
  };
}

/** All stored files of one media row (largest first = storage_path). */
export function mediaPaths(r: Pick<MediaRow, "storage_path" | "variants">): string[] {
  const ws = (r.variants || []).filter((w) => Number.isInteger(w) && w > 0).sort((a, b) => b - a);
  if (!ws.length || !/\.webp$/.test(r.storage_path)) return [r.storage_path];
  return ws.map((w, i) => (i === 0 ? r.storage_path : r.storage_path.replace(/\.webp$/, `-w${w}.webp`)));
}

function toImage(r: MediaRow, urls: Record<string, string>): MediaImage | null {
  const url = urls[r.storage_path];
  if (!url) return null;
  const ws = (r.variants || []).filter((w) => Number.isInteger(w) && w > 0).sort((x, y) => y - x); // largest first, same order as mediaPaths
  const paths = mediaPaths(r);
  const srcset = ws.length > 1 ? ws.map((w, i) => (urls[paths[i]] ? `${urls[paths[i]]} ${w}w` : "")).filter(Boolean).reverse().join(", ") : "";
  return { url, alt: r.alt, width: r.width, height: r.height, ...(srcset ? { srcset } : {}) };
}

/**
 * Gallery + offer/product images for one profile. Call ONLY for profiles that may be shown (live + consented
 * for the public page, or the owner/claimant for the preview). Missing/unsignable files are dropped silently,
 * so the page never shows a broken box.
 */
export async function loadProfileMedia(profileId: string, offers: ClaimableOffer[], opts: { publishedProductsOnly: boolean }): Promise<{ offers: ClaimableOffer[]; extras: ProfileExtras }> {
  const store = mediaStore();
  if (!store) return { offers, extras: {} };
  const [rows, prods] = await Promise.all([store.list(profileId).catch((): MediaRow[] => []), store.products(profileId, opts.publishedProductsOnly).catch((): ProductRow[] => [])]);
  const urls = await store.sign(rows.flatMap(mediaPaths)).catch(() => ({} as Record<string, string>));
  const gallery: GalleryImage[] = rows.filter((r) => r.kind === "gallery").flatMap((r) => { const im = toImage(r, urls); return im ? [{ ...im, id: r.id, position: r.position }] : []; }).slice(0, MEDIA_LIMITS.galleryMax);
  const coverRow = rows.find((r) => r.kind === "cover");
  const cover = coverRow ? toImage(coverRow, urls) : null;
  const byOffer = new Map(rows.filter((r) => r.kind === "offer" && r.offer_id).map((r) => [r.offer_id!, toImage(r, urls)]));
  const byProduct = new Map(rows.filter((r) => r.kind === "product" && r.product_id).map((r) => [r.product_id!, toImage(r, urls)]));
  return {
    offers: offers.map((o) => ({ ...o, image: byOffer.get(o.id) ?? null })),
    extras: { gallery, cover, products: prods.map(({ claimable_profile_id, status, ...p }) => ({ ...p, image: byProduct.get(p.id) ?? null })) },
  };
}
