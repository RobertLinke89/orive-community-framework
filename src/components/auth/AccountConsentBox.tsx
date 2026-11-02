"use client";
import { ACCOUNT_CONSENT_TEXT, ACCOUNT_CONSENT_VERSION, type AccountConsentInput } from "@/lib/account-consent-text";

/** Mandatory checkbox (not pre-ticked) shown before ANY sign-up button and in the post-OAuth consent gate. */
export function AccountConsentBox({ lang, checked, onChange, dark }: { lang: "de" | "en"; checked: boolean; onChange: (v: boolean) => void; dark?: boolean }) {
  return (
    <label className="orive-consent" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, lineHeight: 1.45, textAlign: "left", color: dark ? "rgba(255,255,255,.8)" : "#334155" }}>
      <input type="checkbox" required checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, flex: "none" }}
        aria-describedby="orive-consent-text" data-consent-version={ACCOUNT_CONSENT_VERSION} />
      <span id="orive-consent-text">
        {ACCOUNT_CONSENT_TEXT[lang]}{" "}
        <a href="/agb" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline" }}>{lang === "de" ? "AGB" : "Terms"}</a>
        {" · "}
        <a href="/datenschutz" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline" }}>{lang === "de" ? "Datenschutz" : "Privacy"}</a>
      </span>
    </label>
  );
}

export const consentPayload = (lang: "de" | "en"): AccountConsentInput => ({ granted: true, version: ACCOUNT_CONSENT_VERSION, lang });
