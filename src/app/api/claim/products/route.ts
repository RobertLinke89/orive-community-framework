import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { claimRepo } from "@/lib/claim/repo";
import { mediaStore, mediaPaths, MEDIA_LIMITS, type ProductInput } from "@/lib/claim/media";
import { validateProduct } from "@/lib/claim/products";
import { guard, json } from "../_shared";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function owner(req: Request) {
  const user = await facilitatorFromRequest(req);
  if (!user) return { error: json({ error: "unauthenticated" }, 401) };
  const row = await claimRepo().byOwner(user.userId).catch(() => null);
  if (!row) return { error: json({ error: "no_profile" }, 404) };
  const store = mediaStore();
  if (!store) return { error: json({ error: "unavailable" }, 503) };
  return { user, row, store };
}

/** GET: all own products (drafts too) incl. image preview. */
export async function GET(req: Request) {
  const blocked = await guard(req, "claim-products", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const [prods, media] = await Promise.all([o.store.products(o.row.profile.id, false), o.store.list(o.row.profile.id)]);
  const imgs = media.filter((m) => m.kind === "product");
  const urls = await o.store.sign(imgs.map((m) => m.storage_path)).catch(() => ({} as Record<string, string>));
  return json({ max: MEDIA_LIMITS.productsMax, products: prods.map(({ claimable_profile_id, ...p }) => {
    const m = imgs.find((x) => x.product_id === p.id);
    return { ...p, image: m && urls[m.storage_path] ? { id: m.id, url: urls[m.storage_path], alt: m.alt } : null };
  }) });
}

/** POST: create (starts as draft unless status=published). */
export async function POST(req: Request) {
  const blocked = await guard(req, "claim-products", 30); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const v = validateProduct(await req.json().catch(() => null));
  if (!v.ok) return json({ error: v.error }, 400);
  const existing = await o.store.products(o.row.profile.id, false);
  if (existing.length >= MEDIA_LIMITS.productsMax) return json({ error: "products_full" }, 409);
  const value = { ...v.value, position: v.value.position ?? existing.length } as ProductInput;
  const p = await o.store.createProduct(o.user.userId, o.row.profile.id, value).catch(() => null);
  return p ? json({ ok: true, product: p }, 201) : json({ error: "unavailable" }, 503);
}

/** PATCH { id, ...fields } – edit, publish/unpublish (status). */
export async function PATCH(req: Request) {
  const blocked = await guard(req, "claim-products", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const body = await req.json().catch(() => null);
  if (!UUID.test(String(body?.id || ""))) return json({ error: "not_found" }, 404);
  const { id, ...rest } = body;
  const v = validateProduct(rest, true);
  if (!v.ok) return json({ error: v.error }, 400);
  if (!Object.keys(v.value).length) return json({ error: "invalid" }, 400);
  const p = await o.store.updateProduct(o.user.userId, id, v.value);
  return p ? json({ ok: true, product: p }) : json({ error: "not_found" }, 404);
}

/** DELETE ?id= – removes the product, its image row (FK cascade) and the image files. */
export async function DELETE(req: Request) {
  const blocked = await guard(req, "claim-products", 60); if (blocked) return blocked;
  const o = await owner(req); if ("error" in o) return o.error;
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!UUID.test(id)) return json({ error: "not_found" }, 404);
  const imgs = (await o.store.list(o.row.profile.id)).filter((m) => m.kind === "product" && m.product_id === id);
  if (!(await o.store.deleteProduct(o.user.userId, id))) return json({ error: "not_found" }, 404);
  for (const m of imgs) { await o.store.remove(o.user.userId, m.id).catch(() => null); for (const mp of mediaPaths(m)) await o.store.removeObject(mp).catch(() => {}); }
  return json({ ok: true });
}
