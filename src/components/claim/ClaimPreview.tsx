"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ClaimableOffer } from "@/lib/claim/types";
import { GoLiveBar, QualityBadge } from "./GoLiveBar";
import { ClaimActivate } from "./ClaimActivate";
import type { Lang } from "./i18n";

/** Client shell around the server-rendered full profile: go-live toggle + admin-only quality badge. */
export function ClaimTopBar({ token, lang, offers, initialOpen = false }: { token: string; lang: Lang; offers: ClaimableOffer[]; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [live, setLive] = useState(false);
  const [q, setQ] = useState<{ score: number; tier: string } | null>(null);
  useEffect(() => {
    // returning from OAuth / magic link: keep the panel open so the claim can complete
    if (new URLSearchParams(window.location.search).get("activate") === "1") setOpen(true);
    supabase.auth.getSession().then(async ({ data }) => {
      const jwt = data.session?.access_token;
      if (!jwt) return;
      const r = await fetch(`/api/claim/quality`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` }, body: JSON.stringify({ token }) });
      if (r.ok) { const b = await r.json(); if (typeof b.score === "number") setQ({ score: b.score, tier: b.tier }); }
    }).catch(() => {});
  }, [token]);
  return (
    <GoLiveBar lang={lang} live={live} open={open} onToggle={() => setOpen((o) => !o)} badge={q ? <QualityBadge score={q.score} tier={q.tier} lang={lang} /> : null}>
      <ClaimActivate token={token} lang={lang} offers={offers} onLive={() => setLive(true)} />
    </GoLiveBar>
  );
}
