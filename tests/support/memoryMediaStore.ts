import crypto from "crypto";
import type { MediaRow, MediaStore, ProductRow } from "@/lib/claim/media";

/** In-memory MediaStore (mirrors facilitator_media / facilitator_products + the private bucket). */
export function memoryMediaStore() {
  const rows = new Map<string, MediaRow>(); const files = new Map<string, Uint8Array>(); const products = new Map<string, ProductRow & { owner_id: string }>();
  const s: MediaStore = {
    async list(pid) { return [...rows.values()].filter((r) => r.claimable_profile_id === pid).sort((a, b) => a.position - b.position); },
    async products(pid, publishedOnly) { return [...products.values()].filter((p) => p.claimable_profile_id === pid && (!publishedOnly || p.status === "published")).sort((a, b) => a.position - b.position).map(({ owner_id, ...p }) => p); },
    async insert(r) {
      if (r.kind === "offer" && [...rows.values()].some((x) => x.kind === "offer" && x.offer_id === r.offer_id)) throw new Error("media_insert_failed"); // unique index
      if (r.kind === "product" && [...rows.values()].some((x) => x.kind === "product" && x.product_id === r.product_id)) throw new Error("media_insert_failed");
      const row = { ...r, id: crypto.randomUUID() } as MediaRow; rows.set(row.id, row); return row;
    },
    async remove(u, id) { const r = rows.get(id); if (!r || r.owner_id !== u) return null; rows.delete(id); return r; },
    async reorder(u, pid, ids) { const g = [...rows.values()].filter((r) => r.owner_id === u && r.claimable_profile_id === pid && r.kind === "gallery");
      if (g.length !== ids.length || !ids.every((i) => g.some((r) => r.id === i))) return false; ids.forEach((id, i) => (rows.get(id)!.position = i)); return true; },
    async setAlt(u, id, alt) { const r = rows.get(id); if (!r || r.owner_id !== u) return false; r.alt = alt; return true; },
    async upload(p, b) { files.set(p, b); },
    async removeObject(p) { files.delete(p); },
    async sign(ps) { return Object.fromEntries(ps.filter((p) => files.has(p)).map((p) => [p, `https://signed.test/${p}`])); },
    async createProduct(owner_id, claimable_profile_id, p) { const id = crypto.randomUUID(); const row = { ...p, id, owner_id, claimable_profile_id }; products.set(id, row); const { owner_id: _, ...out } = row; return out; },
    async updateProduct(u, id, p) { const r = products.get(id); if (!r || r.owner_id !== u) return null; Object.assign(r, p); const { owner_id, ...out } = r; return out; },
    async deleteProduct(u, id) { const r = products.get(id); if (!r || r.owner_id !== u) return false; products.delete(id);
      for (const [k, m] of rows) if (m.product_id === id) rows.delete(k); return true; },
  };
  return { s, rows, files, products };
}
