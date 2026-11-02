"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryKey } from "@/lib/claim/categories";
import type { ClaimableOffer } from "@/lib/claim/types";
import { Celebration } from "./Celebration";
import { OfferEditor } from "./OfferEditor";
import { Icon } from "./Icon";
import { Turnstile } from "@/components/compliance/Turnstile";
import { T, type Lang } from "./i18n";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AccountConsentBox, consentPayload } from "@/components/auth/AccountConsentBox";
import { startOAuth, OAUTH_ERROR_TEXT, type OAuthProvider } from "@/lib/auth/oauth";
import { PENDING_CONSENT_KEY } from "@/lib/account-consent-text";

const KEY = "orive_claim_token";
const CONSENT_KEY = "orive_claim_consent";

export function ClaimActivate({ token, lang, offers, onLive }: { token: string; lang: Lang; offers: ClaimableOffer[]; onLive?: () => void }) {
  const t = T[lang];
  const [state, setState] = useState<"idle" | "working" | "sent" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{ shareUrl: string; category: CategoryKey } | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const ran = useRef(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const captchaRef = useRef<string | null>(null);
  const pendingJwt = useRef<string | null>(null);
  const onCaptcha = (t: string | null) => { captchaRef.current = t; setCaptcha(t); if (t && pendingJwt.current) finish(pendingJwt.current); };
  const started = useRef(false);
  const redirectTo = () => `${window.location.origin}/auth/callback?${new URLSearchParams({ next: `/claim/${encodeURIComponent(token)}?activate=1`, intent: "claim" })}`;

  async function finish(accessToken: string) {
    if (!captchaRef.current) { pendingJwt.current = accessToken; return; } // wait for Turnstile
    if (started.current) return; started.current = true;
    setState("working");
    const res = await fetch("/api/claim/complete", {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
      // account consent (terms + Art. 9) is stored atomically with the claim; mandatory for OAuth and e-mail alike
      body: JSON.stringify({ token, turnstileToken: captchaRef.current, accountConsent: JSON.parse(sessionStorage.getItem(CONSENT_KEY) || "null") }),
    });
    const body = await res.json().catch(() => ({}));
    sessionStorage.removeItem(KEY); sessionStorage.removeItem(CONSENT_KEY);
    if (!res.ok) { started.current = false; setErr(body.error === "claim_expired" || body.error === "claim_used" ? t.expired : body.error === "consent_required" ? t.consentNeeded : t.error); setState("error"); return; }
    window.history.replaceState(null, "", window.location.pathname);
    setDone({ shareUrl: body.shareUrl, category: body.category }); setState("done"); onLive?.();
  }

  // After the OAuth / magic-link round trip the session lands here (?activate=1).
  useEffect(() => {
    if (ran.current) return; ran.current = true;
    // activate=1 is only set by our own redirect (/auth/callback or the magic link); the token is in the path
    const wants = new URLSearchParams(window.location.search).get("activate") === "1";
    if (!wants) return;
    supabase.auth.getSession().then(({ data }) => { if (data.session) finish(data.session.access_token); });
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => { if (ev === "SIGNED_IN" && s) finish(s.access_token); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function remember() {
    sessionStorage.setItem(KEY, token);
    sessionStorage.setItem(CONSENT_KEY, JSON.stringify(consentPayload(lang)));
    sessionStorage.setItem(PENDING_CONSENT_KEY, JSON.stringify({ consent: consentPayload(lang) })); // for /auth/callback
  }
  async function oauth(provider: OAuthProvider) {
    if (!consent) { setErr(t.consentNeeded); setState("error"); return; }
    remember(); setState("working"); setBusy(provider);
    // via /auth/callback (consent gate) back to this page with ?activate=1
    const { error } = await startOAuth(provider, `/claim/${encodeURIComponent(token)}?activate=1`, "claim");
    if (error) { setErr(OAUTH_ERROR_TEXT[error][lang]); setState("error"); setBusy(null); }
  }
  async function magic(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setErr(t.consentNeeded); setState("error"); return; }
    remember(); setState("working");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } });
    if (error) { setErr(t.error); setState("error"); } else setState("sent");
  }

  if (done) return (
    <>
      {!showEditor && <Celebration category={done.category} shareUrl={done.shareUrl} lang={lang} onClose={() => setShowEditor(true)} />}
      {showEditor && <OfferEditor offers={offers} lang={lang} />}
    </>
  );
  return (
    <div className="oc-activate" id="activate">
      <div className="oc-auth">
        <AccountConsentBox lang={lang} checked={consent} onChange={setConsent} dark />
        <OAuthButtons lang={lang} theme="dark" onSelect={oauth} disabled={state === "working" || !consent} busy={busy} />
        <form onSubmit={magic} className="oc-mail">
          <input type="email" required placeholder={t.email} aria-label={t.email} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <button className="oc-btn ghost" disabled={state === "working" || !consent}><Icon name="mail" /> {t.sendLink}</button>
        </form>
      </div>
      <Turnstile action="claim" onToken={onCaptcha} lang={lang} />
      {state === "sent" && <p role="status">{t.linkSent}</p>}
      {state === "working" && <p role="status">{t.working}</p>}
      {state === "error" && <p role="alert" className="oc-err">{err}</p>}
    </div>
  );
}
