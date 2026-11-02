"use client";
import { useEffect, useState } from "react";
import type { Lang } from "./i18n";
import { UploadBox, auth } from "./MediaManager";

type P = { id: string; title: string; description: string | null; price_amount: number | null; currency: string; url: string | null; status: "draft" | "published"; position: number; image: { id: string; url: string; alt: string } | null };
const L = {
  de: { title: "Produkte", hint: "Z. B. Gutscheine, Kurskarten, Matten oder Öle. Entwürfe sind nur für dich sichtbar.", add: "Produkt anlegen", name: "Name", desc: "Beschreibung (optional)",
    price: "Preis in € (optional)", url: "Link zum Shop (optional, https://…)", save: "Speichern", del: "Löschen", publish: "Veröffentlichen", unpublish: "Zurückziehen",
    draft: "Entwurf", live: "Veröffentlicht", confirmDel: "Produkt wirklich löschen?", empty: "Noch keine Produkte.", full: "Maximal 24 Produkte.",
    err: { title_required: "Bitte einen Namen (mind. 2 Zeichen) eingeben.", bad_price: "Bitte einen gültigen Preis eingeben.", bad_url: "Bitte einen gültigen Link (https://…) eingeben.", too_long: "Text ist zu lang.", products_full: "Maximal 24 Produkte.", default: "Speichern fehlgeschlagen." } as Record<string, string>,
    img: "Produktbild" },
  en: { title: "Products", hint: "E.g. gift cards, class passes, mats or oils. Drafts are only visible to you.", add: "Add product", name: "Name", desc: "Description (optional)",
    price: "Price in € (optional)", url: "Shop link (optional, https://…)", save: "Save", del: "Delete", publish: "Publish", unpublish: "Unpublish",
    draft: "Draft", live: "Published", confirmDel: "Really delete this product?", empty: "No products yet.", full: "Maximum 24 products.",
    err: { title_required: "Please enter a name (min. 2 characters).", bad_price: "Please enter a valid price.", bad_url: "Please enter a valid link (https://…).", too_long: "Text is too long.", products_full: "Maximum 24 products.", default: "Saving failed." } as Record<string, string>,
    img: "Product image" },
};

async function call(method: string, body?: unknown, q = "") {
  const r = await fetch(`/api/claim/products${q}`, { method, headers: { ...(await auth()), ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

/** Product management (create, edit, delete, publish/unpublish, one image each). */
export function ProductManager({ lang }: { lang: Lang }) {
  const t = L[lang];
  const [items, setItems] = useState<P[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => { const r = await call("GET"); if (r.ok) setItems(r.data.products); };
  useEffect(() => { load(); }, []);
  const fail = (d: any) => setMsg(t.err[d?.error] ?? t.err.default);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const r = await call("POST", { title: f.get("title"), description: f.get("description"), price_amount: f.get("price_amount") || null, url: f.get("url") || null });
    if (!r.ok) return fail(r.data);
    (e.target as HTMLFormElement).reset(); setMsg("✓"); load();
  }
  async function save(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const r = await call("PATCH", { id, title: f.get("title"), description: f.get("description"), price_amount: f.get("price_amount") || null, url: f.get("url") || null });
    r.ok ? (setMsg("✓"), load()) : fail(r.data);
  }
  async function toggle(p: P) { const r = await call("PATCH", { id: p.id, status: p.status === "published" ? "draft" : "published" }); r.ok ? load() : fail(r.data); }
  async function del(p: P) { if (!window.confirm(t.confirmDel)) return; const r = await call("DELETE", undefined, `?id=${p.id}`); r.ok ? load() : fail(r.data); }

  const fields = (p?: P) => (<>
    <input name="title" defaultValue={p?.title} placeholder={t.name} aria-label={t.name} required minLength={2} maxLength={120} />
    <textarea name="description" defaultValue={p?.description ?? ""} placeholder={t.desc} aria-label={t.desc} maxLength={600} rows={2} />
    <input name="price_amount" type="number" min={0} max={100000} step="0.01" defaultValue={p?.price_amount ?? ""} placeholder={t.price} aria-label={t.price} />
    <input name="url" type="url" defaultValue={p?.url ?? ""} placeholder={t.url} aria-label={t.url} maxLength={500} />
  </>);

  return (
    <section className="oc-products oc-card">
      <h2>{t.title} <small className="oc-muted">{items.length}/24</small></h2>
      <p className="oc-muted">{t.hint}</p>
      {items.length === 0 && <p className="oc-muted">{t.empty}</p>}
      {items.map((p) => (
        <form key={p.id} className="oc-product" onSubmit={(e) => save(p.id, e)}>
          <div className="oc-product-head">
            {p.image ? <img src={p.image.url} alt={p.image.alt} width={96} height={72} /> : <span className="oc-thumb-missing" aria-hidden="true" />}
            <span className={`oc-pill ${p.status}`}>{p.status === "published" ? t.live : t.draft}</span>
          </div>
          {fields(p)}
          <div className="oc-row">
            <button type="submit" className="oc-btn">{t.save}</button>
            <button type="button" className="oc-btn ghost" onClick={() => toggle(p)}>{p.status === "published" ? t.unpublish : t.publish}</button>
            <button type="button" className="oc-btn ghost" onClick={() => del(p)}>{t.del}</button>
          </div>
          <UploadBox lang={lang} kind="product" productId={p.id} count={0} onDone={load} />
        </form>
      ))}
      {items.length < 24 ? (
        <form className="oc-product new" onSubmit={create}>{fields()}<button type="submit" className="oc-btn">{t.add}</button></form>
      ) : <p className="oc-muted">{t.full}</p>}
      {msg && <p role="status" className="oc-muted">{msg}</p>}
    </section>
  );
}
