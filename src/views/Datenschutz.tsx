"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

const CONTACT = "robert.linke@me.com";
const UPDATED_DE = "Stand: 28. September 2026";
const UPDATED_EN = "Updated: 28 September 2026";

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
                  "Art. 9 Abs. 2 lit. a DSGVO — soweit besondere Kategorien (z. B. Gesundheitsangaben im Intake) verarbeitet werden: ausdrückliche Einwilligung oder Notwendigkeit für die vom Gast gewünschte Leistung im Rahmen der Buchung.",
                ]
              : [
                  "Art. 6(1)(b) GDPR — contract: account, booking, payment initiation, facilitator desk, support for the booked service.",
                  "Art. 6(1)(c) GDPR — legal obligation: commercial and tax retention, responses to authorities.",
                  "Art. 6(1)(f) GDPR — legitimate interests: IT security, abuse and fraud prevention, platform stability, aggregated product improvement.",
                  "Art. 6(1)(a) GDPR — consent: optional cookies/tracking or newsletters where used and separately obtained.",
                  "Art. 9(2)(a) GDPR — where special-category data (e.g. health answers in intake) is processed: explicit consent or necessity for the service the guest requested as part of the booking.",
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
                  "E-Mail-/Benachrichtigungsdienste — Transaktionsmails (Buchung, Erinnerung, Facilitator-Hinweise).",
                  "Shopify — nur wenn du im ORIVE Shop einen Kauf abschließt.",
                  "Behörden — nur wenn gesetzlich verpflichtet.",
                ]
              : [
                  "The facilitator of the booked service — name, contact, booking and intake details as needed to deliver.",
                  "Stripe Payments Europe, Ltd. — payments and payouts (Stripe Connect). Privacy: stripe.com/privacy.",
                  "Vercel Inc. — hosting and delivery of the site; transfers to the USA under appropriate safeguards (including SCCs).",
                  "Supabase — database and authentication (EU regions where configured).",
                  "Email / notification providers — transactional mail (booking, reminder, facilitator notices).",
                  "Shopify — only if you complete a purchase in the ORIVE Shop.",
                  "Authorities — only when legally required.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("6. Speicherdauer", "6. Retention")}>
        <p>
          {copy("Kontodaten bleiben, solange das Konto besteht und danach so lange, wie gesetzliche Aufbewahrungsfristen oder Abwehr von Rechtsansprüchen es erfordern. Buchungs- und Zahlungsbelege typischerweise bis zu 10 Jahre (handels-/steuerrechtlich). Logs kürzer, soweit nicht zur Sicherheit länger nötig. Intake-Antworten: so lange wie für die Buchung und etwaige Nachsorge/Streitfälle erforderlich, danach Löschung oder Anonymisierung.", "Account data lasts while the account exists and thereafter as long as legal retention or defence of claims requires. Booking and payment records typically up to 10 years (commercial/tax law). Logs shorter unless security needs longer. Intake answers: as long as needed for the booking and any aftercare/disputes, then deletion or anonymisation.")}
        </p>
      </FactSection>

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
