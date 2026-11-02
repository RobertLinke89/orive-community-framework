/** Explicit consent for health-related intake answers (Art. 9(2)(a) GDPR). Bump the version on any text change. */
export const HEALTH_CONSENT_VERSION = "health-v1-2026-10-27";

export const HEALTH_CONSENT_TEXT = {
  de: "Ich willige ausdrücklich ein, dass ORIVE meine Gesundheitsangaben aus dem Intake-Fragebogen (z. B. gesundheitliche Verfassung, Medikamente, Verletzungen, Schwangerschaft) verschlüsselt speichert und ausschließlich an den von mir gebuchten Facilitator zur sicheren Durchführung dieser Session weitergibt. Die Einwilligung ist freiwillig; ohne sie werden keine Gesundheitsangaben gespeichert und ich bespreche diese direkt mit dem Facilitator. Ich kann sie jederzeit mit Wirkung für die Zukunft widerrufen (Link in der Buchungsbestätigung oder per E-Mail an ORIVE); die Angaben werden dann gelöscht. Spätestens 90 Tage nach der Session werden sie automatisch gelöscht.",
  en: "I explicitly consent to ORIVE storing my health information from the intake questionnaire (e.g. state of health, medication, injuries, pregnancy) in encrypted form and sharing it only with the facilitator I booked, for the safe delivery of this session. Consent is voluntary; without it no health information is stored and I discuss it directly with the facilitator. I can withdraw it at any time with effect for the future (link in the booking confirmation or by e-mail to ORIVE); the information is then deleted. It is deleted automatically no later than 90 days after the session.",
} as const;

export type ConsentLang = keyof typeof HEALTH_CONSENT_TEXT;

