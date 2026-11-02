"use client";
import { useState } from "react";
import { T, type Lang } from "./i18n";
import { Turnstile } from "@/components/compliance/Turnstile";

export function OptOutButton({ token, lang }: { token: string; lang: Lang }) {
  const t = T[lang];
  const [done, setDone] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  async function go() {
    if (!window.confirm(t.optOutConfirm)) return;
    const r = await fetch("/api/claim/optout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, turnstileToken: captcha }) });
    if (r.ok) setDone(true);
  }
  return done ? <p role="status" className="oc-optout">{t.optOutDone}</p>
    : <p className="oc-optout"><small className="oc-muted">{t.whyHere}</small><br /><Turnstile action="optout" onToken={setCaptcha} lang={lang} /><button className="oc-link-btn" disabled={!captcha} onClick={go}>{t.optOut}</button></p>;
}
