"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { T, type Lang } from "./i18n";

type Item = { u: string; a: string; l: string | null };

/**
 * Lightbox for the server-rendered gallery (section[data-gallery] > [data-lb]). Click/Enter opens,
 * arrows/Esc on desktop, swipe left/right on touch, focus returns to the clicked tile on close.
 */
export function GalleryLightbox({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [items, setItems] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-lb]");
      const sec = btn?.closest<HTMLElement>("section[data-gallery]");
      if (!btn || !sec) return;
      try { setItems(JSON.parse(sec.dataset.gallery || "[]")); } catch { return; }
      opener.current = btn; setI(Number(btn.dataset.lb) || 0);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  const close = useCallback(() => { setItems(null); opener.current?.focus(); }, []);
  const go = useCallback((d: number) => setI((x) => (items ? (x + d + items.length) % items.length : 0)), [items]);
  useEffect(() => {
    if (!items) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [items, close, go]);

  if (!items?.length) return null;
  const it = items[i];
  return (
    <div className="oc-lb" role="dialog" aria-modal="true" aria-label={t.gallery} onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const s = touchX.current; touchX.current = null; if (s === null) return; const dx = e.changedTouches[0].clientX - s; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}>
      <figure>
        <img src={it.u} alt={it.a} />
        {it.l && <span className="imglabel">{it.l}</span>}
        <figcaption>{it.a} · {i + 1}/{items.length}</figcaption>
      </figure>
      <button ref={closeBtn} type="button" className="x" aria-label={t.close} onClick={close}>×</button>
      {items.length > 1 && <>
        <button type="button" className="p" aria-label={t.prev} onClick={() => go(-1)}>‹</button>
        <button type="button" className="n" aria-label={t.next} onClick={() => go(1)}>›</button>
      </>}
    </div>
  );
}
