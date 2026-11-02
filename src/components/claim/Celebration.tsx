"use client";
import { useMemo, useState } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/claim/categories";
import { Icon } from "./Icon";
import { T, type Lang } from "./i18n";

/** Deterministic pseudo-random so SSR and client markup match. */
const rnd = (i: number, s: number) => { const x = Math.sin(i * 9301 + s * 49297) * 233280; return x - Math.floor(x); };

export function Celebration({ category, shareUrl, lang, onClose }: { category: CategoryKey; shareUrl: string; lang: Lang; onClose?: () => void }) {
  const c = CATEGORIES[category] ?? CATEGORIES.mindfulness;
  const t = T[lang];
  const [copied, setCopied] = useState(false);
  const particles = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: `${Math.round(rnd(i, 1) * 100)}%`, top: `${Math.round(rnd(i, 2) * 100)}%`,
    delay: `${(rnd(i, 3) * 3).toFixed(2)}s`, dur: `${(3 + rnd(i, 4) * 4).toFixed(2)}s`, scale: (0.5 + rnd(i, 5)).toFixed(2),
  })), []);
  const text = encodeURIComponent(`${t.share} ${shareUrl}`);
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* user can select manually */ }
  }
  async function share() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: c.label, text: t.share, url: shareUrl }); } catch { /* cancelled */ }
    } else copy();
  }
  return (
    <div className={`oc-cel oc-theme-${c.celebration}`} role="dialog" aria-modal="true" aria-labelledby="oc-cel-title"
      style={{ ["--acc" as any]: c.accent, ["--acc2" as any]: c.accent2 }}>
      <div className="oc-fx" aria-hidden="true">
        {particles.map((p, i) => (
          <i key={i} style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.dur, ["--s" as any]: p.scale }} />
        ))}
      </div>
      <div className="oc-cel-box">
        <p className="oc-cel-kicker"><Icon name={c.icon} size={22} /> {t.live}</p>
        <h2 id="oc-cel-title">{t.share}</h2>
        <a className="oc-share-link" href={shareUrl}>{shareUrl.replace(/^https?:\/\//, "")}</a>
        <div className="oc-cel-actions">
          <button className="oc-btn big" onClick={copy}><Icon name={copied ? "check" : "copy"} /> {copied ? t.copied : t.copy}</button>
          <button className="oc-btn big ghost" onClick={share}><Icon name="share" /> {t.shareBtn}</button>
        </div>
        <p className="oc-cel-fallback">
          <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(t.share)}`} target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href={`mailto:?subject=${encodeURIComponent(c.label)}&body=${text}`}>E-Mail</a>
        </p>
        {copied && <p className="oc-sr" role="status">{t.copied}</p>}
        {onClose && <button className="oc-link-btn" onClick={onClose}>{t.editOffers} →</button>}
      </div>
    </div>
  );
}
