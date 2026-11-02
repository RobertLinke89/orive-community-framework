"use client";
import { useEffect, useRef } from "react";

declare global { interface Window { turnstile?: any; __oriveTsLoading?: Promise<void> } }
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!window.__oriveTsLoading) {
    window.__oriveTsLoading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true; s.onload = () => res(); s.onerror = () => rej(new Error("turnstile_load"));
      document.head.appendChild(s);
    });
  }
  return window.__oriveTsLoading;
}

/**
 * Cloudflare Turnstile widget (env NEXT_PUBLIC_TURNSTILE_SITE_KEY). Without a site key (local dev)
 * it immediately reports a placeholder token; the server only accepts that when TURNSTILE_SECRET_KEY is unset outside production.
 */
export function Turnstile({ action, onToken, lang = "de" }: { action: string; onToken: (t: string | null) => void; lang?: "de" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!siteKey) { onToken("dev-no-turnstile"); return; }
    let id: string | undefined; let dead = false;
    loadScript().then(() => {
      if (dead || !ref.current || !window.turnstile) return;
      id = window.turnstile.render(ref.current, {
        sitekey: siteKey, action, language: lang, appearance: "interaction-only",
        callback: (t: string) => onToken(t), "expired-callback": () => onToken(null), "error-callback": () => onToken(null),
      });
    }).catch(() => onToken(null));
    return () => { dead = true; if (id && window.turnstile) window.turnstile.remove(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, action]);
  return <div ref={ref} className="oc-turnstile" />;
}
