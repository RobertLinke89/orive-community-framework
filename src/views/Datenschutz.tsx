"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";
import { RETENTION as R } from "@/lib/retention";
import { HEALTH_CONSENT_TEXT } from "@/lib/consent-text";

const CONTACT = "robert.linke@me.com";
const UPDATED_DE = "Stand: 27. Oktober 2026";
const UPDATED_EN = "Updated: 27 October 2026";

export default function Datenschutz() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Datenschutz", "Privacy")}
      title={copy("Datenschutzerklärung", "Privacy policy")}
      updated={de ? UPDATED_DE : UPDATED_EN}
    >
      <FactSection title={copy("1. Verantwortlicher", "1. Controller")}>
        <p>
          {copy("Verantwortlich für die Datenverarbeitung auf orive.co ist heybotti, Inhaber Robert Linke, Stiftsgasse 17, 07407 Rudolstadt, Deutschland.", "The controller for personal data processing on orive.co is heybotti, proprietor Robert Linke, Stiftsgasse 17, 07407 Rudolstadt, Germany.")}
        </p>
        <p>
          {copy("E-Mail: ", "Email: ")}
          <a href={`mailto:${CONTACT}`} className="text-slate-900 dark:text-white underline underline-offset-4">
            {CONTACT}
          </a>
        </p>
      </FactSection>

      <FactSection title={copy("2. Was diese Erklärung abdeckt", "2. What this policy covers")}>
        <p>
          {copy("Diese Erklärung gilt für den Besuch von orive.co, Konten von Seekern und Facilitators, ORIVE-Buchungen, Facilitator-Desk (dezk), Shop-Weiterleitung zu Shopify sowie Kontaktanfragen. Partnerlistings verlinken auf externe Anbieter; deren Datenschutz liegt beim Partner.", "This policy covers visits to orive.co, seeker and facilitator accounts, ORIVE bookings, the facilitator desk (dezk), shop handoff to Shopify, and contact requests. Partner listings link to external providers; their privacy practices sit with the partner.")}
        </p>
      </FactSection>

      <FactSection title={copy("3. Welche Daten wir verarbeiten", "3. What data we process")}>
        <FactList
          items={
            de
              ? [
                  "Nutzungsdaten: IP-Adresse (ggf. gekürzt), Zeitstempel, Browser/Gerät, aufgerufene Seiten, Referrer — zur sicheren Bereitstellung der Website.",
                  "Kontodaten: Name, E-Mail, Authentifizierungsdaten, Rollen (Seeker/Facilitator), Profilangaben.",
                  "Buchungsdaten: Angebot, Termin, Preis, Status, Kommunikation zur Buchung, Buchungspass.",
                  "Zahlungsbezogene Metadaten: Stripe-Kunden-/Zahlungs-IDs, Beträge, Status — keine vollständigen Kartendaten auf orive.co.",
                  "Facilitator-Daten: Profil, Angebote, Stripe-Connect-Status, Auszahlungsbezogene Angaben.",
                  "Intake-/Gesundheitsbezogene Angaben: nur wenn ein Facilitator sie für die Buchung abfragt; Zweck ist die Durchführung der gebuchten Leistung. Solche Angaben behandeln wir besonders sensibel und geben sie nur an den jeweiligen Facilitator weiter.",
                  "Shop: Produktsuche auf orive.co; Checkout und Kundendaten beim Kauf laufen über Shopify.",
                ]
              : [
                  "Usage data: IP address (possibly truncated), timestamps, browser/device, pages viewed, referrer — to run the site securely.",
                  "Account data: name, email, authentication data, roles (seeker/facilitator), profile fields.",
                  "Booking data: offering, slot, price, status, booking-related messages, booking pass.",
                  "Payment metadata: Stripe customer/payment IDs, amounts, status — no full card numbers on orive.co.",
                  "Facilitator data: profile, listings, Stripe Connect status, payout-related details.",
                  "Intake / health-related answers: only when a facilitator requests them for a booking; used to deliver that booking. We treat them as sensitive and share them only with that facilitator.",
                  "Shop: product browsing on orive.co; checkout and customer data for purchases run on Shopify.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("4. Zwecke und Rechtsgrundlagen", "4. Purposes and legal bases")}>
        <FactList
          items={
            de
              ? [
                  "Art. 6 Abs. 1 lit. b DSGVO — Vertrag: Konto, Buchung, Zahlungseinleitung, Facilitator-Desk, Support zur gebuchten Leistung.",
                  "Art. 6 Abs. 1 lit. c DSGVO — Rechtspflicht: handels- und steuerrechtliche Aufbewahrung, Auskunft gegenüber Behörden.",
                  "Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse: IT-Sicherheit, Missbrauchs- und Betrugsprävention, Plattformstabilität, Produktverbesserung in aggregierter Form.",
                  "Art. 6 Abs. 1 lit. a DSGVO — Einwilligung: optionale Cookies/Tracking oder Newsletter, soweit eingesetzt und gesondert eingeholt.",
                  "Art. 9 Abs. 2 lit. a DSGVO — soweit besondere Kategorien (z. B. Gesundheitsangaben im Intake) verarbeitet werden: ausdrückliche, gesonderte Einwilligung (siehe Abschnitt 6a).",
                ]
              : [
                  "Art. 6(1)(b) GDPR — contract: account, booking, payment initiation, facilitator desk, support for the booked service.",
                  "Art. 6(1)(c) GDPR — legal obligation: commercial and tax retention, responses to authorities.",
                  "Art. 6(1)(f) GDPR — legitimate interests: IT security, abuse and fraud prevention, platform stability, aggregated product improvement.",
                  "Art. 6(1)(a) GDPR — consent: optional cookies/tracking or newsletters where used and separately obtained.",
                  "Art. 9(2)(a) GDPR — where special-category data (e.g. health answers in intake) is processed: explicit, separate consent (see section 6a).",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("5. Empfänger und Auftragsverarbeitung", "5. Recipients and processors")}>
        <FactList
          items={
            de
              ? [
                  "Facilitator der gebuchten Leistung — Name, Kontakt, Buchungs- und Intake-Angaben, soweit für die Durchführung nötig.",
                  "Stripe Payments Europe, Ltd. — Zahlungen und Auszahlungen (Stripe Connect). Datenschutz: stripe.com/privacy.",
                  "Vercel Inc. — Hosting und Auslieferung der Website; Übermittlung in die USA mit geeigneten Garantien (u. a. Standardvertragsklauseln).",
                  "Supabase — Datenbank und Authentifizierung (EU-Regionen, soweit konfiguriert).",
                  "Resend (Plus Five Five, Inc., USA) — Versand von Transaktionsmails (Buchung, Erinnerung, Facilitator-Hinweise, Claim-Einladungen, Login-Links) als Auftragsverarbeiter nach Art. 28 DSGVO; Absender ist unsere eigene Domain. Übermittlung in die USA auf Basis des EU-US Data Privacy Framework bzw. Standardvertragsklauseln. Verarbeitet werden E-Mail-Adresse, Name und Mailinhalt.",
                  "Cloudflare, Inc. — Turnstile-Prüfung gegen automatisierten Missbrauch bei Buchung, Checkout, Profil-Aktivierung und Opt-out (technische Signale wie IP-Adresse, Browser-Merkmale; keine Werbe-Cookies). Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO; Übermittlung in die USA auf Basis von DPF/SCC."
                  "Shopify — nur wenn du im ORIVE Shop einen Kauf abschließt.",
                  "Behörden — nur wenn gesetzlich verpflichtet.",
                ]
              : [
                  "The facilitator of the booked service — name, contact, booking and intake details as needed to deliver.",
                  "Stripe Payments Europe, Ltd. — payments and payouts (Stripe Connect). Privacy: stripe.com/privacy.",
                  "Vercel Inc. — hosting and delivery of the site; transfers to the USA under appropriate safeguards (including SCCs).",
                  "Supabase — database and authentication (EU regions where configured).",
                  "Resend (Plus Five Five, Inc., USA) — sending transactional mail (booking, reminders, facilitator notices, claim invitations, login links) as processor under Art. 28 GDPR; sender is our own domain. Transfers to the USA under the EU-US Data Privacy Framework or SCCs. Processed: e-mail address, name, message content.",
                  "Cloudflare, Inc. — Turnstile check against automated abuse on booking, checkout, profile activation and opt-out (technical signals such as IP address and browser characteristics; no advertising cookies). Legal basis Art. 6(1)(f) GDPR; transfers to the USA under DPF/SCCs."
                  "Shopify — only if you complete a purchase in the ORIVE Shop.",
                  "Authorities — only when legally required.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("6. Speicherdauer", "6. Retention")}>
        <FactList
          items={
            de
              ? [
                  "Kontodaten: solange das Konto besteht, danach soweit gesetzliche Aufbewahrungspflichten oder die Abwehr von Rechtsansprüchen es erfordern.",
                  `Reservierungen (Halte-Zeit ${R.hold_minutes} Minuten): nicht abgeschlossene, abgelaufene, abgelehnte oder ohne Abbuchung stornierte Buchungen löschen wir nach ${R.unpaid_booking_days} Tagen, verwaiste Anfragen nach ${R.stale_pending_days} Tagen.`,
                  `Bezahlte Buchungen: Name, Kontaktdaten, Notizen und Intake-Antworten werden ${R.anonymise_after_session_days} Tage nach der Session gelöscht bzw. anonymisiert; Beträge und Zahlungs-IDs bewahren wir ${R.accounting_years} Jahre auf (§ 147 AO, § 257 HGB).`,
                  `Einwilligungsnachweise (Version und Zeitpunkt, keine Gesundheitsdaten): so lange wie der zugehörige Buchungsbeleg.`,
                  `Technische Zahlungsereignisse (Stripe-Webhooks): ${R.stripe_events_days} Tage. Missbrauchsschutz-Zähler (gehasht, ohne Klar-IP): ${R.rate_limit_hours} Stunden.`,
                  `Vorbereitete, nicht aktivierte Facilitator-Profile: ${R.unclaimed_draft_days} Tage nach der Einladung; Einladungslinks ${R.claim_token_days} Tage nach Ablauf.`,
                  "Opt-out-Sperrliste: dauerhaft, aber nur als nicht umkehrbarer Hash, damit wir dich nicht erneut anschreiben.",
                ]
              : [
                  "Account data: while the account exists, thereafter as long as legal retention duties or the defence of claims require.",
                  `Reservations (hold time ${R.hold_minutes} minutes): incomplete, expired, declined or uncharged cancelled bookings are deleted after ${R.unpaid_booking_days} days, orphaned requests after ${R.stale_pending_days} days.`,
                  `Paid bookings: name, contact details, notes and intake answers are deleted or anonymised ${R.anonymise_after_session_days} days after the session; amounts and payment IDs are kept for ${R.accounting_years} years (German commercial/tax law).`,
                  "Consent records (version and time, no health data): as long as the related booking record.",
                  `Technical payment events (Stripe webhooks): ${R.stripe_events_days} days. Abuse-protection counters (hashed, no plain IP): ${R.rate_limit_hours} hours.`,
                  `Prepared, not activated facilitator profiles: ${R.unclaimed_draft_days} days after the invitation; invitation links ${R.claim_token_days} days after expiry.`,
                  "Opt-out suppression list: permanently, but only as an irreversible hash so we do not contact you again.",
                ]
          }
        />
      </FactSection>

      <div id="gesundheitsdaten">
        <FactSection title={copy("6a. Gesundheitsangaben im Intake (Art. 9 DSGVO)", "6a. Health information in the intake (Art. 9 GDPR)")}>
          <p>
            {copy(
              "Manche Angebote fragen vor der Session nach Gesundheitsangaben. Diese verarbeiten wir nur mit deiner ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die du über ein separates, nicht vorausgewähltes Kästchen erteilst. Wir speichern die Antworten verschlüsselt und geben sie nur an den gebuchten Facilitator weiter. Als Nachweis speichern wir Textversion, Sprache und Zeitpunkt der Einwilligung. Du kannst sie jederzeit widerrufen (Link in der Buchungsbestätigung oder per E-Mail an " + CONTACT + "); die Antworten werden dann sofort gelöscht. Der Einwilligungstext lautet:",
              "Some offers ask for health information before the session. We process it only with your explicit consent (Art. 9(2)(a) GDPR), given via a separate, unticked checkbox. Answers are stored encrypted and shared only with the booked facilitator. As proof we store text version, language and time of consent. You can withdraw at any time (link in the booking confirmation or by e-mail to " + CONTACT + "); the answers are then deleted immediately. The consent text reads:",
            )}
          </p>
          <blockquote style={{ fontStyle: "italic", opacity: 0.85 }}>{de ? HEALTH_CONSENT_TEXT.de : HEALTH_CONSENT_TEXT.en}</blockquote>
        </FactSection>
      </div>

      <div id="facilitator-profile">
        <FactSection title={copy("6b. Vorbereitete Facilitator-Profile: Herkunft der Daten (Art. 14 DSGVO)", "6b. Prepared facilitator profiles: source of data (Art. 14 GDPR)")}>
          <FactList
            items={
              de
                ? [
                    "Für Anbieter:innen aus Yoga, Breathwork, Meditation u. ä. stellen wir aus öffentlich zugänglichen Quellen (eigene Website, öffentliche Verzeichnisse, öffentliche Social-Media-Profile) einen nicht öffentlichen Profilentwurf zusammen: Name bzw. Studioname, Kategorie, Stadt/Land, Website, Instagram-Link sowie die geschäftliche Kontakt-E-Mail.",
                    "Zweck: einmalige Einladung, das Profil auf ORIVE zu übernehmen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Ansprache von Gewerbetreibenden). Die E-Mail-Adresse wird nie veröffentlicht.",
                    `Der Entwurf ist bis zur Aktivierung nicht öffentlich und für Suchmaschinen gesperrt (noindex). Erst wenn du dich über den persönlichen Link anmeldest (Google, Apple oder E-Mail-Link) und auf „Jetzt aktivieren“ klickst, wird das Profil veröffentlicht. Ohne Aktivierung löschen wir den Entwurf ${R.unclaimed_draft_days} Tage nach der Einladung.`,
                    "Widerspruch / Löschung: Über „Das bin nicht ich / Meine Daten löschen“ auf der Einladungsseite oder per E-Mail an " + CONTACT + " löschen wir den Entwurf sofort und setzen dich auf eine Sperrliste (nur Hash), damit keine erneute Ansprache erfolgt (Art. 17, 21 DSGVO).",
                  ]
                : [
                    "For practitioners in yoga, breathwork, meditation and similar fields we compile a non-public draft profile from publicly available sources (own website, public directories, public social-media profiles): name or studio name, category, city/country, website, Instagram link and the business contact e-mail.",
                    "Purpose: a one-time invitation to claim the profile on ORIVE. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in contacting businesses). The e-mail address is never published.",
                    `The draft is not public and is blocked for search engines (noindex) until activation. Only when you sign in via your personal link (Google, Apple or e-mail link) and click “Activate now” is the profile published. Without activation we delete the draft ${R.unclaimed_draft_days} days after the invitation.`,
                    "Objection / deletion: via “This isn't me / Delete my data” on the invitation page or by e-mail to " + CONTACT + " we delete the draft immediately and add you to a suppression list (hash only) so you are not contacted again (Art. 17, 21 GDPR).",
                  ]
            }
          />
        </FactSection>
      </div>

      <FactSection title={copy("7. Cookies und lokaler Speicher", "7. Cookies and local storage")}>
        <p>
          {copy("Wir nutzen technisch notwendige Speicherung (z. B. Session, Sprache, Theme, Warenkorb-/Checkout-Hilfen) nach § 25 Abs. 2 TDDDG. Nicht notwendige Cookies oder Tracking setzen wir nur mit Einwilligung ein, soweit vorhanden. Du kannst Browser-Speicher und Cookies jederzeit löschen; dann können einzelne Funktionen eingeschränkt sein.", "We use technically necessary storage (e.g. session, language, theme, cart/checkout helpers) under § 25(2) TDDDG. Non-essential cookies or tracking are used only with consent where applicable. You can clear browser storage and cookies at any time; some features may then be limited.")}
        </p>
      </FactSection>

      <FactSection title={copy("8. Sicherheit", "8. Security")}>
        <p>
          {copy("Übertragung erfolgt über TLS/HTTPS. Zugriff auf Buchungs- und Facilitator-Daten ist rollenbezogen beschränkt. Vollständige Kartendaten liegen bei Stripe, nicht auf orive.co. Absolute Sicherheit im Internet kann niemand garantieren; wir treffen angemessene technische und organisatorische Maßnahmen.", "Transfers use TLS/HTTPS. Access to booking and facilitator data is role-restricted. Full card data sits with Stripe, not on orive.co. No one can guarantee absolute internet security; we apply appropriate technical and organisational measures.")}
        </p>
      </FactSection>

      <FactSection title={copy("9. Deine Rechte", "9. Your rights")}>
        <FactList
          items={
            de
              ? [
                  "Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch (Art. 21).",
                  "Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.",
                  "Beschwerde bei einer Aufsichtsbehörde, insbesondere dem Thüringer Landesbeauftragten für den Datenschutz und die Informationsfreiheit (TLfDI), Häßlerstraße 8, 99096 Erfurt, tlfdi.de.",
                ]
              : [
                  "Access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), portability (Art. 20), objection (Art. 21).",
                  "Withdraw consent at any time with effect for the future.",
                  "Lodge a complaint with a supervisory authority, in particular the Thuringian Commissioner for Data Protection and Freedom of Information (TLfDI), Häßlerstraße 8, 99096 Erfurt, Germany, tlfdi.de.",
                ]
          }
        />
        <p>
          {copy("Anfragen an: ", "Requests to: ")}
          <a href={`mailto:${CONTACT}`} className="text-slate-900 dark:text-white underline underline-offset-4">
            {CONTACT}
          </a>
        </p>
      </FactSection>

      <FactSection title={copy("10. Fairness für Seeker, Facilitator und ORIVE", "10. Fairness for seekers, facilitators and ORIVE")}>
        <FactList
          items={
            de
              ? [
                  "Seeker: Buchungsdaten dienen der Durchführung und dem Support; keine Weitergabe an unbeteiligte Dritte zu Werbezwecken ohne Einwilligung.",
                  "Facilitator: Gast- und Intake-Daten nur für die gebuchte Leistung und gesetzliche Pflichten; kein Verkauf von Gästelisten.",
                  "ORIVE: Plattform betreibt Vermittlung und Infrastruktur; speichert nur, was Betrieb, Zahlung und Recht erfordern; Partnerlistings bleiben datenschutzrechtlich beim Partner.",
                ]
              : [
                  "Seekers: booking data is used to deliver and support the booking; no sale to unrelated third parties for advertising without consent.",
                  "Facilitators: guest and intake data only for the booked service and legal duties; no selling of guest lists.",
                  "ORIVE: the platform runs intermediation and infrastructure; stores only what operations, payment and law require; partner listings stay under the partner’s privacy regime.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("11. Änderungen", "11. Changes")}>
        <p>
          {copy("Wir aktualisieren diese Erklärung, wenn sich Dienste, Empfänger oder Rechtslage ändern. Der aktuelle Stand steht oben. Wesentliche Änderungen weisen wir auf orive.co aus.", "We update this policy when services, recipients or the law change. The current date is at the top. Material changes will be indicated on orive.co.")}
        </p>
      </FactSection>

      <FactSection title={copy("12. Weitere Hinweise", "12. Related notices")}>
        <p>
          <Link href="/agb" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("AGB", "Terms of use")}
          </Link>
          {" · "}
          <Link href="/protection" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Buchung & Zahlung", "Booking & payment")}
          </Link>
          {" · "}
          <Link href="/agb#impressum" className="text-slate-900 dark:text-white underline underline-offset-4">
            Impressum
          </Link>
        </p>
      </FactSection>
    </FactPage>
  );
}
