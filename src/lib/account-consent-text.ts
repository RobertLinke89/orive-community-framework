/**
 * Account-level consent, mandatory after EVERY sign-up (e-mail, Google, Apple) before the account can be used.
 * Includes the explicit Art. 9(2)(a) GDPR consent, because the practices a user offers or books on Orive
 * (e.g. breathwork, kambo, spiritual growth) can reveal health data or religious/philosophical beliefs.
 * The per-booking health-intake consent (consent-text.ts, HEALTH_CONSENT_*) stays separate and mandatory at checkout.
 * Bump the version on any text change.
 */
export const ACCOUNT_CONSENT_VERSION = "account-v1-2026-10-28";

export const ACCOUNT_CONSENT_TEXT = {
  de: "Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen. Ich willige ausdrücklich ein (Art. 9 Abs. 2 lit. a DSGVO), dass ORIVE Angaben, die Rückschlüsse auf meine Gesundheit oder meine religiösen bzw. weltanschaulichen Überzeugungen zulassen können (z. B. welche Praktiken wie Breathwork, Kambo oder Spiritual Growth ich anbiete oder buche), zur Bereitstellung meines Kontos und zur Vermittlung von Sessions verarbeitet. Die Einwilligung ist freiwillig und jederzeit mit Wirkung für die Zukunft widerrufbar (E-Mail an ORIVE oder Konto löschen); ohne sie kann ich kein Konto nutzen.",
  en: "I accept the Terms and have read the Privacy Policy. I explicitly consent (Art. 9(2)(a) GDPR) to ORIVE processing information that may reveal my health or my religious or philosophical beliefs (e.g. which practices such as breathwork, kambo or spiritual growth I offer or book) in order to provide my account and arrange sessions. Consent is voluntary and can be withdrawn at any time with effect for the future (e-mail ORIVE or delete the account); without it I cannot use an account.",
} as const;

export type AccountConsentLang = keyof typeof ACCOUNT_CONSENT_TEXT;
export type AccountConsentInput = { granted: true; version: string; lang: AccountConsentLang };

export function parseAccountConsent(v: unknown): AccountConsentInput | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o.granted !== true || o.version !== ACCOUNT_CONSENT_VERSION || (o.lang !== "de" && o.lang !== "en")) return null;
  return { granted: true, version: o.version, lang: o.lang };
}

/** Survives the OAuth / magic-link redirect (sessionStorage, same tab only). */
export const PENDING_CONSENT_KEY = "orive_pending_account_consent";
