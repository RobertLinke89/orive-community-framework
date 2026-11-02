import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { claimRepo } from "@/lib/claim/repo";
import { mediaStore, validateUpload, storagePath, mediaPaths, MEDIA_LIMITS, type MediaKind } from "@/lib/claim/media";
import { processImage, variantPath } from "@/lib/claim/imageProcessing";
import { guard, json } from "../_shared";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // sharp (image resizing) needs the Node runtime
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only the facilitator who claimed the profile manages its media. */
async function owner(req: Request) {
  const user = await facilitatorFromRequest(req);
  if (!user) return { error: json({ error: "unauthenticated" }, 401) };
  const row = await claimRepo().byOwner(user.userId).catch(() => null);
  if (!row) return { error: json({ error: "no_profile" }, 404) };
  const store = mediaStore();
  if (!store) return { error: json({ error: "unavailable" }, 503) };
  return { user, row, store };
}

/** GET: own media (editor). */
export async function GET(req: Request) {
  const blocked = await guard(req, "claim-media", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const rows = await o.store.list(o.row.profile.id);
  const urls = await o.store.sign(rows.map((r) => r.storage_path)).catch(() => ({} as Record<string, string>));
  return json({ limits: { galleryMax: MEDIA_LIMITS.galleryMax, maxBytes: MEDIA_LIMITS.maxBytes, types: Object.keys(MEDIA_LIMITS.types) },
    media: rows.map((r) => ({ id: r.id, kind: r.kind, offer_id: r.offer_id, product_id: r.product_id, alt: r.alt, position: r.position, url: urls[r.storage_path] ?? null })) });
}

/** POST multipart/form-data: file, kind (gallery|offer|product|cover), alt, rights=true, offerId|productId. */
export async function POST(req: Request) {
  const blocked = await guard(req, "claim-media-upload", 20); if (blocked) return blocked;
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MEDIA_LIMITS.maxBytes + 64 * 1024) return json({ error: "too_large" }, 413);
  const o = await owner(req); if ("error" in o) return o.error;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !file || typeof file === "string") return json({ error: "empty" }, 400);
  const kind = String(form.get("kind") || "") as MediaKind;
  const offerId = kind === "offer" ? String(form.get("offerId") || "") : null;
  const productId = kind === "product" ? String(form.get("productId") || "") : null;
  if (kind === "offer" && (!offerId || !UUID.test(offerId) || !o.row.offers.some((x) => x.id === offerId))) return json({ error: "not_found" }, 404);
  if (kind === "product" && (!productId || !UUID.test(productId) || !(await o.store.products(o.row.profile.id, false)).some((p) => p.id === productId))) return json({ error: "not_found" }, 404);
  const bytes = new Uint8Array(await (file as Blob).arrayBuffer());
  const existing = await o.store.list(o.row.profile.id);
  const v = validateUpload({ kind, bytes, declaredType: (file as Blob).type || null, alt: form.get("alt"), rightsConfirmed: form.get("rights"), galleryCount: existing.filter((r) => r.kind === "gallery").length });
  if (!v.ok) return json({ error: v.error }, v.error === "too_large" ? 413 : v.error === "bad_type" ? 415 : v.error === "gallery_full" ? 409 : 400);
  // decode + strip metadata (EXIF/GPS) + WebP variants 400/800/1600; the original bytes are never stored
  let img;
  try { img = await processImage(bytes); } catch (e) {
    const m = (e as Error).message;
    return json({ error: m === "too_small" ? "too_small" : "bad_type" }, m === "too_small" ? 400 : 415);
  }
  const path = storagePath(o.user.userId, "webp");
  const largest = img.variants[img.variants.length - 1].width;
  const written: string[] = [];
  try {
    for (const vr of img.variants) { const vp = variantPath(path, vr.width, largest); await o.store.upload(vp, vr.bytes, img.mime); written.push(vp); }
    // offer/product: one image each -> replace the old one
    const old = existing.find((r) => (kind === "cover" && r.kind === "cover") || (kind === "offer" && r.offer_id === offerId) || (kind === "product" && r.product_id === productId));
    if (old) { await o.store.remove(o.user.userId, old.id); for (const op of mediaPaths(old)) await o.store.removeObject(op).catch(() => {}); }
    const pos = kind === "gallery" ? existing.filter((r) => r.kind === "gallery").length : 0;
    const row = await o.store.insert({ owner_id: o.user.userId, claimable_profile_id: o.row.profile.id, kind, offer_id: offerId, product_id: productId,
      storage_path: path, alt: v.alt, width: img.width, height: img.height, mime: img.mime, bytes: img.variants[img.variants.length - 1].bytes.length, position: pos,
      variants: img.variants.map((x) => x.width) });
    return json({ ok: true, media: { id: row.id, kind, alt: row.alt, position: row.position, width: img.width, height: img.height } }, 201);
  } catch (e) {
    for (const wp of written) await o.store.removeObject(wp).catch(() => {});
    return json({ error: (e as Error).message === "gallery_full" ? "gallery_full" : "unavailable" }, (e as Error).message === "gallery_full" ? 409 : 503);
  }
}

/** PATCH { order: [ids] } (gallery order) or { id, alt }. */
export async function PATCH(req: Request) {
  const blocked = await guard(req, "claim-media", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const body = await req.json().catch(() => null);
  if (Array.isArray(body?.order)) {
    const ids = body.order.filter((x: unknown) => typeof x === "string" && UUID.test(x));
    const mine = new Set((await o.store.list(o.row.profile.id)).filter((r) => r.kind === "gallery").map((r) => r.id));
    if (ids.length !== mine.size || ids.some((id: string) => !mine.has(id))) return json({ error: "invalid" }, 400);
    return (await o.store.reorder(o.user.userId, o.row.profile.id, ids)) ? json({ ok: true }) : json({ error: "unavailable" }, 503);
  }
  const alt = String(body?.alt ?? "").trim();
  if (!UUID.test(String(body?.id || "")) || alt.length < MEDIA_LIMITS.altMin || alt.length > MEDIA_LIMITS.altMax) return json({ error: "invalid" }, 400);
  return (await o.store.setAlt(o.user.userId, body.id, alt)) ? json({ ok: true }) : json({ error: "not_found" }, 404);
}

/** DELETE ?id=… – removes the DB row and the stored file. */
export async function DELETE(req: Request) {
  const blocked = await guard(req, "claim-media", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!UUID.test(id)) return json({ error: "not_found" }, 404);
  const gone = await o.store.remove(o.user.userId, id);
  if (!gone) return json({ error: "not_found" }, 404);
  for (const gp of mediaPaths(gone)) await o.store.removeObject(gp).catch(() => {});
  return json({ ok: true });
}
