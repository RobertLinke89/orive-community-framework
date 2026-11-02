"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ClaimableOffer } from "@/lib/claim/types";
import { T, type Lang } from "./i18n";
import { MediaManager, UploadBox } from "./MediaManager";
import { ProductManager } from "./ProductManager";

export function OfferEditor({ offers: initial, lang }: { offers: ClaimableOffer[]; lang: Lang }) {
  const t = T[lang];
  const [offers, setOffers] = useState(initial);
  const [msg, setMsg] = useState("");
  async function call(id: string, method: "PATCH" | "DELETE", body?: unknown) {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`/api/claim/offers/${id}`, { method, headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: body ? JSON.stringify(body) : undefined });
    return res.ok ? res.json() : null;
  }
  async function save(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const price = String(f.get("price") ?? "").replace(",", ".");
    const r = await call(id, "PATCH", { title: f.get("title"), description: f.get("description"), duration_minutes: Number(f.get("duration")), format: f.get("format"), price_amount: price === "" ? null : Number(price) });
    if (r?.offer) { setOffers((xs) => xs.map((x) => (x.id === id ? r.offer : x))); setMsg("✓"); } else setMsg(t.error);
  }
  async function del(id: string) {
    if ((await call(id, "DELETE"))?.ok) setOffers((xs) => xs.filter((x) => x.id !== id)); else setMsg(t.error);
  }
  return (
    <div className="oc-editor oc-card">
      <MediaManager lang={lang} />
      <h2>{t.editOffers}</h2>
      {offers.map((o) => (
        <form key={o.id} onSubmit={(e) => save(e, o.id)} className="oc-edit-row">
          <input name="title" defaultValue={o.title} aria-label="Titel" required minLength={2} maxLength={120} />
          <input name="description" defaultValue={o.description ?? ""} aria-label="Beschreibung" maxLength={600} />
          <input name="duration" type="number" min={5} defaultValue={o.duration_minutes ?? 60} aria-label={t.min} />
          <select name="format" defaultValue={o.format} aria-label="Format">
            <option value="in_person">{t.in_person}</option><option value="online">{t.online}</option><option value="hybrid">{t.hybrid}</option>
          </select>
          <input name="price" inputMode="decimal" defaultValue={o.price_amount ?? ""} aria-label="Preis (EUR)" />
          <button className="oc-btn">{t.save}</button>
          <button type="button" className="oc-btn ghost" onClick={() => del(o.id)}>{t.del}</button>
          <UploadBox lang={lang} kind="offer" offerId={o.id} count={0} onDone={() => setMsg("✓")} />
        </form>
      ))}
      {msg && <p role="status">{msg}</p>}
      <ProductManager lang={lang} />
    </div>
  );
}
