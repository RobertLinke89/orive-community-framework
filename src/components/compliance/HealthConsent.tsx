"use client";
import { HEALTH_CONSENT_TEXT, HEALTH_CONSENT_VERSION, type ConsentLang } from "@/lib/consent-text";

export type HealthConsentValue = { granted: true; version: string; lang: ConsentLang } | null;

/**
 * Explicit, separate, unticked opt-in for Art. 9 data. Must be shown next to the intake questions;
 * the intake may only be submitted when checked. Value is sent as `healthConsent` to the checkout APIs.
 */
export function HealthConsent({ lang, value, onChange }: { lang: ConsentLang; value: HealthConsentValue; onChange: (v: HealthConsentValue) => void }) {
  const id = "orive-health-consent";
  return (
    <div className="orive-consent" role="group" aria-labelledby={`${id}-h`}>
      <p id={`${id}-h`} style={{ fontWeight: 700, margin: "0 0 6px" }}>
        {lang === "de" ? "Einwilligung für Gesundheitsangaben (Art. 9 DSGVO)" : "Consent for health information (Art. 9 GDPR)"}
      </p>
      <label htmlFor={id} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
        <input id={id} type="checkbox" checked={!!value} required
          onChange={(e) => onChange(e.target.checked ? { granted: true, version: HEALTH_CONSENT_VERSION, lang } : null)} />
        <span style={{ fontSize: 14, lineHeight: 1.45 }}>
          {HEALTH_CONSENT_TEXT[lang]}{" "}
          <a href="/datenschutz#gesundheitsdaten" target="_blank" rel="noopener">{lang === "de" ? "Datenschutzerklärung" : "Privacy policy"}</a>
        </span>
      </label>
    </div>
  );
}
