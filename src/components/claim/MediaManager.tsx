"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "./i18n";

type M = { id: string; kind: "gallery" | "offer" | "product" | "cover"; offer_id: string | null; product_id: string | null; alt: string; position: number; url: string | null };
const MAX = 12, MAX_BYTES = 5 * 1024 * 1024, TYPES = ["image/jpeg", "image/png", "image/webp"];

const L = {
  de: { cover: "Titelbild", coverEmpty: "Noch kein eigenes Titelbild – es wird das Kategorie-Bild gezeigt.", title: "Bildergalerie", hint: `Bis zu ${MAX} Bilder (JPG, PNG oder WebP, max. 5 MB): Raum, Atmosphäre, du bei der Arbeit.`,
    rights: "Ich besitze die Rechte an diesem Bild (selbst fotografiert oder Lizenz) und abgebildete Personen haben der Veröffentlichung zugestimmt.",
    alt: "Bildbeschreibung (für Screenreader, z. B. „Heller Yogaraum mit Matten“)", add: "Bild hochladen", up: "Nach vorne", down: "Nach hinten", del: "Löschen",
    full: `Maximal ${MAX} Bilder.`, type: "Nur JPG, PNG oder WebP.", size: "Datei ist größer als 5 MB.", needRights: "Bitte die Bildrechte bestätigen.", needAlt: "Bitte eine Bildbeschreibung eingeben (mind. 3 Zeichen).",
    fail: "Hochladen fehlgeschlagen.", empty: "Noch keine Bilder – die Galerie wird auf deinem Profil erst angezeigt, wenn du welche hochlädst.", offerImg: "Bild zum Angebot", saveAlt: "Beschreibung speichern", small: "Bild ist zu klein (mind. 200 × 200 px).", resized: "Bilder werden automatisch verkleinert (WebP) und Metadaten wie Standort (GPS) entfernt." },
  en: { cover: "Cover image", coverEmpty: "No cover yet – the category image is shown.", title: "Photo gallery", hint: `Up to ${MAX} photos (JPG, PNG or WebP, max 5 MB): your space, the atmosphere, you at work.`,
    rights: "I own the rights to this image (my own photo or licensed) and people shown have agreed to its publication.",
    alt: "Image description (for screen readers, e.g. “Bright yoga room with mats”)", add: "Upload photo", up: "Move forward", down: "Move back", del: "Delete",
    full: `Maximum ${MAX} photos.`, type: "JPG, PNG or WebP only.", size: "File is larger than 5 MB.", needRights: "Please confirm the image rights.", needAlt: "Please add an image description (min. 3 characters).",
    fail: "Upload failed.", empty: "No photos yet – the gallery only shows on your profile once you upload some.", offerImg: "Image for this offer", saveAlt: "Save description", small: "Image is too small (min. 200 × 200 px).", resized: "Images are resized automatically (WebP) and metadata such as location (GPS) is removed." },
};

export async function auth() { const { data } = await supabase.auth.getSession(); return { authorization: `Bearer ${data.session?.access_token ?? ""}` }; }

/** Client-side pre-check (the server re-checks everything, incl. the real file type). */
export function precheck(f: { type: string; size: number }, alt: string, rights: boolean, count: number, kind: "gallery" | "offer" | "product" | "cover") {
  if (!rights) return "needRights" as const;
  if (alt.trim().length < 3) return "needAlt" as const;
  if (!TYPES.includes(f.type)) return "type" as const;
  if (f.size > MAX_BYTES) return "size" as const;
  if (kind === "gallery" && count >= MAX) return "full" as const;
  return null;
}

export function UploadBox({ lang, kind, offerId, productId, count, onDone }: { lang: Lang; kind: "gallery" | "offer" | "product" | "cover"; offerId?: string; productId?: string; count: number; onDone: () => void }) {
  const t = L[lang];
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [rights, setRights] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!file) return;
    const p = precheck(file, alt, rights, count, kind);
    if (p) return setErr(t[p]);
    setBusy(true); setErr("");
    const fd = new FormData(); fd.set("file", file); fd.set("kind", kind); fd.set("alt", alt); fd.set("rights", "true"); if (offerId) fd.set("offerId", offerId); if (productId) fd.set("productId", productId);
    const r = await fetch("/api/claim/media", { method: "POST", headers: await auth(), body: fd });
    setBusy(false);
    if (!r.ok) { const b = await r.json().catch(() => ({})); return setErr(b.error === "gallery_full" ? t.full : b.error === "bad_type" ? t.type : b.error === "too_large" ? t.size : b.error === "too_small" ? t.small : t.fail); }
    setFile(null); setAlt(""); setRights(false); onDone();
  }
  return (
    <div className="oc-upload">
      <input type="file" accept={TYPES.join(",")} aria-label={kind === "gallery" ? t.add : t.offerImg} onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={kind === "gallery" && count >= MAX} />
      <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={t.alt} aria-label={t.alt} maxLength={200} />
      <label className="oc-rights"><input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} /> {t.rights}</label>
      <button type="button" className="oc-btn" onClick={send} disabled={!file || busy}>{t.add}</button>
      {err && <p role="alert" className="oc-err">{err}</p>}
    </div>
  );
}

/** Gallery management after go-live: upload, alt text, reorder (forward/back), delete. Max 12. */
export function MediaManager({ lang }: { lang: Lang }) {
  const t = L[lang];
  const [items, setItems] = useState<M[]>([]);
  const load = async () => { const r = await fetch("/api/claim/media", { headers: await auth() }); if (r.ok) setItems((await r.json()).media); };
  useEffect(() => { load(); }, []);
  const cover = items.find((m) => m.kind === "cover");
  const gallery = items.filter((m) => m.kind === "gallery").sort((a, b) => a.position - b.position);
  async function move(i: number, d: number) {
    const ids = gallery.map((g) => g.id); const j = i + d; if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const r = await fetch("/api/claim/media", { method: "PATCH", headers: { ...(await auth()), "content-type": "application/json" }, body: JSON.stringify({ order: ids }) });
    if (r.ok) load();
  }
  async function del(id: string) { const r = await fetch(`/api/claim/media?id=${id}`, { method: "DELETE", headers: await auth() }); if (r.ok) load(); }
  async function saveAlt(id: string, alt: string) { await fetch("/api/claim/media", { method: "PATCH", headers: { ...(await auth()), "content-type": "application/json" }, body: JSON.stringify({ id, alt }) }); }
  return (
    <section className="oc-media oc-card">
      <h2>{t.title} <small className="oc-muted">{gallery.length}/{MAX}</small></h2>
      <p className="oc-muted">{t.hint} {t.resized}</p>
      {gallery.length === 0 ? <p className="oc-muted">{t.empty}</p> : (
        <ol className="oc-media-list">
          {gallery.map((g, i) => (
            <li key={g.id}>
              {g.url ? <img src={g.url} alt={g.alt} width={96} height={72} /> : <span className="oc-thumb-missing" aria-hidden="true" />}
              <input defaultValue={g.alt} aria-label={t.alt} maxLength={200} onBlur={(e) => e.target.value.trim().length >= 3 && saveAlt(g.id, e.target.value.trim())} />
              <button type="button" className="oc-btn ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t.up}>↑</button>
              <button type="button" className="oc-btn ghost" onClick={() => move(i, 1)} disabled={i === gallery.length - 1} aria-label={t.down}>↓</button>
              <button type="button" className="oc-btn ghost" onClick={() => del(g.id)}>{t.del}</button>
            </li>
          ))}
        </ol>
      )}
      <h3>{t.cover}</h3>
      {cover?.url ? <img src={cover.url} alt={cover.alt} width={192} height={72} className="oc-cover-thumb" /> : <p className="oc-muted">{t.coverEmpty}</p>}
      <UploadBox lang={lang} kind="cover" count={0} onDone={load} />
      <h3>{t.title}</h3>
      <UploadBox lang={lang} kind="gallery" count={gallery.length} onDone={load} />
    </section>
  );
}
