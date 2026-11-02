"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { callbackStep, type CallbackStep } from "@/lib/auth/callbackFlow";
import { OAUTH_ERROR_TEXT } from "@/lib/auth/oauth";
import { PENDING_CONSENT_KEY } from "@/lib/account-consent-text";
import { AccountConsentBox, consentPayload } from "./AccountConsentBox";

const lang = (): "de" | "en" => (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("de") ? "de" : "en");

async function consentStatus(jwt: string): Promise<boolean> {
  const pending = sessionStorage.getItem(PENDING_CONSENT_KEY);
  if (pending) {
    // the user ticked the box BEFORE leaving for Google/Apple – record it now that we know who they are
    const r = await fetch("/api/auth/consent", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` }, body: pending });
    if (r.ok) { sessionStorage.removeItem(PENDING_CONSENT_KEY); return true; }
  }
  const r = await fetch("/api/auth/consent", { headers: { authorization: `Bearer ${jwt}` } });
  if (!r.ok) throw new Error("consent_status");
  return (await r.json()).consented === true;
}

/** /auth/callback – finishes Supabase OAuth (PKCE), enforces the account consent, then forwards to `next`. */
export function AuthCallback() {
  const [step, setStep] = useState<CallbackStep>({ step: "wait" });
  const [jwt, setJwt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const ran = useRef(false);
  const l = lang();

  async function run() {
    let { data: { session } } = await supabase.auth.getSession();
    const first = callbackStep({ search: location.search, hash: location.hash, hasSession: !!session, consented: null });
    if (first.step === "exchange") {
      const { data, error } = await supabase.auth.exchangeCodeForSession(first.code);
      if (error || !data.session) return setStep(callbackStep({ search: `?error=${encodeURIComponent(error?.message || "pkce")}&${location.search.slice(1)}`, hasSession: false, consented: null }));
      session = data.session;
    } else if (first.step === "error") return setStep(first);
    setJwt(session!.access_token);
    let consented = false;
    try { consented = await consentStatus(session!.access_token); } catch { return setStep({ step: "error", code: "oauth_failed", retry: "/auth" }); }
    const s = callbackStep({ search: location.search, hasSession: true, consented });
    if (s.step === "redirect" && s.intent === "facilitator-signup" && !session!.user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role: "facilitator" } }); // same metadata the e-mail sign-up sets
    }
    if (s.step === "redirect") { window.history.replaceState(null, "", "/auth/callback"); window.location.replace(s.to); return; }
    setStep(s);
  }
  useEffect(() => { if (!ran.current) { ran.current = true; run(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function accept() {
    if (!jwt || !checked) return;
    setBusy(true);
    const r = await fetch("/api/auth/consent", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` }, body: JSON.stringify({ consent: consentPayload(l) }) });
    setBusy(false);
    if (!r.ok) return setStep({ step: "error", code: "oauth_failed", retry: "/auth" });
    run();
  }
  async function decline() { await supabase.auth.signOut(); window.location.replace("/"); }

  const box: React.CSSProperties = { maxWidth: 480, margin: "12vh auto", padding: 28, borderRadius: 20, background: "#fff", boxShadow: "0 10px 40px #0001", fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" };
  if (step.step === "error") return (
    <main style={box} role="alert"><h1 style={{ fontSize: 20 }}>{(OAUTH_ERROR_TEXT[step.code] || OAUTH_ERROR_TEXT.oauth_failed)[l]}</h1>
      <p><a href={step.retry} style={{ color: "#0f766e" }}>{l === "de" ? "Zurück und erneut versuchen" : "Go back and try again"}</a></p></main>
  );
  if (step.step === "consent") return (
    <main style={box}>
      <h1 style={{ fontSize: 20, marginTop: 0 }}>{l === "de" ? "Noch ein Schritt" : "One more step"}</h1>
      <p style={{ color: "#475569", fontSize: 14 }}>{l === "de" ? "Bevor du Orive nutzen kannst, brauchen wir deine ausdrückliche Einwilligung." : "Before you can use Orive we need your explicit consent."}</p>
      <AccountConsentBox lang={l} checked={checked} onChange={setChecked} />
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button type="button" onClick={accept} disabled={!checked || busy} style={{ flex: 1, height: 44, borderRadius: 999, border: 0, background: checked ? "#0f766e" : "#94a3b8", color: "#fff", fontWeight: 600 }}>
          {l === "de" ? "Zustimmen und weiter" : "Agree and continue"}</button>
        <button type="button" onClick={decline} style={{ height: 44, borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", padding: "0 16px" }}>
          {l === "de" ? "Ablehnen" : "Decline"}</button>
      </div>
    </main>
  );
  return <main style={box} role="status">{l === "de" ? "Anmeldung wird abgeschlossen …" : "Finishing sign-in …"}</main>;
}
