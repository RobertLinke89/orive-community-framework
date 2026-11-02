"use client";
import { useState, type ReactNode } from "react";
import { T, type Lang } from "./i18n";

/**
 * Top bar of the claim preview: like a finished website that only needs publishing.
 * The toggle starts sign-in (Google / Apple / e-mail link); the profile goes live only after the
 * authenticated claim succeeds (server decides), then the toggle shows "Live".
 */
export function GoLiveBar({ lang, live, onToggle, open, badge, children }: {
  lang: Lang; live: boolean; open: boolean; onToggle: () => void; badge?: ReactNode; children?: ReactNode;
}) {
  const t = T[lang];
  return (
    <div className="oc-golive" data-live={live ? "1" : "0"}>
      <div className="oc-golive-row">
        <b className="oc-brand">Orive</b>
        <span className="oc-golive-state">{live ? t.liveState : t.draftState}</span>
        {badge}
        <button type="button" role="switch" aria-checked={live} aria-expanded={open} className="oc-switch" onClick={onToggle} disabled={live}>
          <span className="oc-switch-track"><span className="oc-switch-knob" /></span>
          <span className="oc-switch-label">{live ? t.isLive : t.goLive}</span>
        </button>
      </div>
      {open && !live && <div className="oc-golive-panel"><p className="oc-muted">{t.goLiveHint}</p>{children}</div>}
    </div>
  );
}

/** Small tier badge (A ≥ 80, B 65–79, C 50–64, reject < 50). Only rendered for admins (see AdminQualityBadge). */
export function QualityBadge({ score, tier, lang }: { score: number; tier: string; lang: Lang }) {
  return <span className={`oc-q oc-q-${tier}`} title={`${T[lang].quality}: ${score}/100 · Tier ${tier} (intern)`}>Q {score} · {tier}</span>;
}
