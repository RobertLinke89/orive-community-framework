import type { ProductInput } from "./media";

export type ProductError = "title_required" | "bad_price" | "bad_url" | "bad_currency" | "bad_status" | "too_long";

/** Validates owner input for a product (create: full, update: partial). */
export function validateProduct(b: any, partial = false): { ok: true; value: Partial<ProductInput> } | { ok: false; error: ProductError } {
  const out: Partial<ProductInput> = {};
  const has = (k: string) => b && Object.prototype.hasOwnProperty.call(b, k);
  if (!partial || has("title")) {
    const t = String(b?.title ?? "").replace(/[\u0000-\u001f]/g, " ").trim();
    if (t.length < 2) return { ok: false, error: "title_required" };
    if (t.length > 120) return { ok: false, error: "too_long" };
    out.title = t;
  }
  if (has("description")) {
    const d = b.description == null ? "" : String(b.description).replace(/[\u0000-\u0008\u000b-\u001f]/g, " ").trim();
    if (d.length > 600) return { ok: false, error: "too_long" };
    out.description = d || null;
  } else if (!partial) out.description = null;
  if (has("price_amount")) {
    const p = b.price_amount === null || b.price_amount === "" ? null : Number(b.price_amount);
    if (p !== null && (!Number.isFinite(p) || p < 0 || p > 100000)) return { ok: false, error: "bad_price" };
    out.price_amount = p === null ? null : Math.round(p * 100) / 100;
  } else if (!partial) out.price_amount = null;
  if (has("currency")) {
    if (!/^[A-Z]{3}$/.test(String(b.currency))) return { ok: false, error: "bad_currency" };
    out.currency = String(b.currency);
  } else if (!partial) out.currency = "EUR";
  if (has("url")) {
    const u = b.url == null ? "" : String(b.url).trim();
    if (u) { try { const x = new URL(u); if (x.protocol !== "https:" && x.protocol !== "http:") throw 0; } catch { return { ok: false, error: "bad_url" }; } }
    if (u.length > 500) return { ok: false, error: "too_long" };
    out.url = u || null;
  } else if (!partial) out.url = null;
  if (has("status")) {
    if (b.status !== "draft" && b.status !== "published") return { ok: false, error: "bad_status" };
    out.status = b.status;
  } else if (!partial) out.status = "draft";
  if (has("position")) { const n = Number(b.position); if (Number.isInteger(n) && n >= 0 && n < 100) out.position = n; }
  return { ok: true, value: out };
}
