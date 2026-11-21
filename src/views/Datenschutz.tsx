"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

const CONTACT = "robert.linke@me.com";
const UPDATED_DE = "Stand: 10. November 2026";
const UPDATED_EN = "Updated: 10 November 2026";

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
          {copy("Diese Erklärung gilt für den Besuch von orive.co, Konten von Seekern und Facilitators, den Facilitator-Desk (dezk), Kontaktanfragen, das Facilitator-Verzeichnis mit Anfrage-, Übernahme- und Entfernungsformular sowie die KI-gestützte Suche. Partnerlistings verlinken auf externe Anbieter; deren Datenschutz liegt beim Partner. Derzeit nicht aktiv sind: Buchungen und Zahlungen über ORIVE (Stripe), Auszahlungen an Facilitators (Stripe Connect) und der ORIVE Shop (Shopify). Die Angaben dazu unten gelten erst, wenn diese Funktionen freigeschaltet werden.", "This policy covers visits to orive.co, seeker and facilitator accounts, the facilitator desk (dezk), contact requests, the facilitator directory with its enquiry, claim and removal forms, and the AI-assisted search. Partner listings link to external providers; their privacy practices sit with the partner. Not active at the moment: bookings and payments via ORIVE (Stripe), payouts to facilitators (Stripe Connect) and the ORIVE Shop (Shopify). The related statements below only apply once these features are switched on.")}
        </p>
      </FactSection>

      <FactSection title={copy("3. Welche Daten wir verarbeiten", "3. What data we process")}>
        <FactList
          items={
            de
              ? [
                  "Nutzungsdaten: IP-Adresse (ggf. gekürzt), Zeitstempel, Browser/Gerät, aufgerufene Seiten, Referrer — zur sicheren Bereitstellung der Website.",
                  "Kontodaten: Name, E-Mail, Authentifizierungsdaten, Rollen (Seeker/Facilitator), Profilangaben.",
                  "Buchungsdaten (derzeit nicht aktiv): Angebot, Termin, Preis, Status, Kommunikation zur Buchung, Buchungspass.",
                  "Zahlungsbezogene Metadaten (derzeit nicht aktiv): Stripe-Kunden-/Zahlungs-IDs, Beträge, Status — keine vollständigen Kartendaten auf orive.co.",
                  "Facilitator-Daten: Profil, Angebote; Stripe-Connect-Status und auszahlungsbezogene Angaben erst, wenn Auszahlungen aktiv sind (derzeit nicht aktiv).",
                  "Intake-/Gesundheitsbezogene Angaben (nur bei ORIVE-Buchungen, derzeit nicht aktiv): nur wenn ein Facilitator sie für die Buchung abfragt; Zweck ist die Durchführung der gebuchten Leistung. Solche Angaben behandeln wir besonders sensibel und geben sie nur an den jeweiligen Facilitator weiter.",
                  "Shop (derzeit nicht aktiv): Produktsuche auf orive.co; Checkout und Kundendaten beim Kauf liefen über Shopify.",
                  "Verzeichnis-Formulare: Anfragen an Profile, Anträge auf Profil-Übernahme und auf Entfernung eines Profils (Details in den Abschnitten 7 und 8).",
                ]
              : [
                  "Usage data: IP address (possibly truncated), timestamps, browser/device, pages viewed, referrer — to run the site securely.",
                  "Account data: name, email, authentication data, roles (seeker/facilitator), profile fields.",
                  "Booking data (not active at the moment): offering, slot, price, status, booking-related messages, booking pass.",
                  "Payment metadata (not active at the moment): Stripe customer/payment IDs, amounts, status — no full card numbers on orive.co.",
                  "Facilitator data: profile, listings; Stripe Connect status and payout-related details only once payouts are active (not active at the moment).",
                  "Intake / health-related answers (ORIVE bookings only, not active at the moment): only when a facilitator requests them for a booking; used to deliver that booking. We treat them as sensitive and share them only with that facilitator.",
                  "Shop (not active at the moment): product browsing on orive.co; checkout and customer data for purchases would run on Shopify.",
                  "Directory forms: enquiries to profiles, requests to claim a profile and requests to remove a profile (details in sections 7 and 8).",
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
                  "Facilitator der gebuchten Leistung (nur bei ORIVE-Buchungen, derzeit nicht aktiv) — Name, Kontakt, Buchungs- und Intake-Angaben, soweit für die Durchführung nötig.",
                  "Stripe Payments Europe, Ltd. — Zahlungen und Auszahlungen (Stripe Connect), derzeit nicht aktiv. Datenschutz: stripe.com/privacy.",
                  "Hostinger International Ltd., 61 Lordou Vyronos, Lumiel Building, 4. Stock, 6023 Larnaka, Zypern — Hosting: orive.co läuft auf einem eigenen, von uns betriebenen Server (VPS) bei Hostinger.",
                  "Supabase — Datenbank und Authentifizierung (EU-Regionen, soweit konfiguriert).",
                  "Resend — E-Mail-Versand von hello@orive.co. Verzeichnis-Anfragen gehen an die öffentlich bekannte Kontakt-E-Mail des Anbieters (Reply-To: deine Adresse) oder, wenn keine nutzbare Adresse vorliegt, an unser Postfach robert.linke@me.com. Übernahme- und Entfernungsanträge bleiben interne Benachrichtigungen an robert.linke@me.com. Du erhältst keine automatische Bestätigungs-E-Mail.",
                  "Shopify — nur bei einem Kauf im ORIVE Shop (derzeit nicht aktiv).",
                  "KI-Anbieter für Suche und Chat (Google Gemini, xAI, Groq, Mistral, Cloudflare Workers AI) — nur der eingegebene Text, siehe Abschnitt 9.",
                  "Behörden — nur wenn gesetzlich verpflichtet.",
                ]
              : [
                  "The facilitator of the booked service (ORIVE bookings only, not active at the moment) — name, contact, booking and intake details as needed to deliver.",
                  "Stripe Payments Europe, Ltd. — payments and payouts (Stripe Connect), not active at the moment. Privacy: stripe.com/privacy.",
                  "Hostinger International Ltd., 61 Lordou Vyronos, Lumiel Building, 4th floor, 6023 Larnaca, Cyprus — hosting: orive.co runs on our own server (VPS) at Hostinger.",
                  "Supabase — database and authentication (EU regions where configured).",
                  "Resend — email delivery from hello@orive.co. Directory enquiries go to the provider’s publicly known contact email (Reply-To: your address) or, if none is usable, to our mailbox robert.linke@me.com. Claim and removal requests remain internal notifications to robert.linke@me.com. You do not receive an automatic confirmation email.",
                  "Shopify — only for a purchase in the ORIVE Shop (not active at the moment).",
                  "AI providers for search and chat (Google Gemini, xAI, Groq, Mistral, Cloudflare Workers AI) — only the text you enter, see section 9.",
                  "Authorities — only when legally required.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("6. Facilitator-Verzeichnis", "6. Facilitator directory")}>
        <p>
          {copy("Unter /facilitators und auf den einzelnen Verzeichnisprofilen zeigen wir Facilitators (z. B. Breathwork, Yoga, Eisbaden, Coaching) in Europa. Die Profile erstellen wir aus öffentlich zugänglichen Angaben auf den Websites der Anbieter und in öffentlichen Verzeichnissen: Name bzw. Studioname, Ort, Land, Kategorien, Website, ggf. Instagram-Profil sowie öffentlich genannte Angebote und Preise mit Quellenangabe. Telefonnummern und Fotos der Anbieter übernehmen wir nicht; öffentlich genannte Kontakt-E-Mails speichern wir nur serverseitig zur Weiterleitung von Anfragen und zeigen sie nicht auf der Profilseite. Jedes Profil ist als „nicht verifiziert“ gekennzeichnet.", "At /facilitators and on the individual directory profiles we show facilitators (e.g. breathwork, yoga, ice bathing, coaching) across Europe. Profiles are compiled from publicly available information on the providers’ own websites and in public directories: name or studio name, town, country, categories, website, Instagram profile where available, and publicly listed offers and prices with the source. We do not copy providers’ phone numbers or photos; publicly listed contact emails are stored server-side only to forward enquiries and are not shown on the profile page. Every profile is marked as “not verified”.")}
        </p>
        <FactList
          items={
            de
              ? [
                  "Zweck: Interessierten einen Überblick über Angebote zu geben und Facilitators sichtbar zu machen; Anbieter können ihr Profil übernehmen und selbst pflegen.",
                  "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem öffentlich zugänglichen Branchenverzeichnis; das Interesse der Anbieter an der Auffindbarkeit ihrer veröffentlichten Angebote wird berücksichtigt).",
                  "Widerspruch und Entfernung: Du kannst der Verarbeitung jederzeit nach Art. 21 DSGVO widersprechen. Auf jedem Profil gibt es den Link „Profil entfernen“; alternativ genügt eine E-Mail. Wir entfernen das Profil dann aus Verzeichnis und Suche.",
                  "Korrektur und Übernahme: Über „Das bin ich – Profil übernehmen“ kannst du beantragen, dein Profil zu übernehmen und korrigieren zu lassen. Wir prüfen jeden Antrag von Hand (siehe Abschnitt 8).",
                ]
              : [
                  "Purpose: to give people looking for a practice an overview of offers and to make facilitators visible; providers can claim their profile and maintain it themselves.",
                  "Legal basis: Art. 6(1)(f) GDPR (legitimate interest in a publicly accessible trade directory, taking into account the providers’ interest in their published offers being found).",
                  "Objection and removal: you can object to the processing at any time under Art. 21 GDPR. Every profile has a “Remove profile” link; an email is enough as well. We then remove the profile from the directory and the search.",
                  "Corrections and claiming: via “This is me – claim profile” you can request to take over your profile and have it corrected. We review every request by hand (see section 8).",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("7. Anfrageformular im Verzeichnis", "7. Directory enquiry form")}>
        <FactList
          items={
            de
              ? [
                  "Gespeicherte Daten: Name, E-Mail-Adresse, Nachricht, optional Wunschtermin, das betroffene Profil/Angebot, Sprache, Zeitpunkt, deine Einwilligung (mit Version), Browserkennung (User-Agent) und ein gesalzener Hash der IP-Adresse. Die IP-Adresse selbst nutzen wir nur kurzzeitig im Arbeitsspeicher zur Begrenzung der Anfragen (Rate-Limit) und zum Schutz vor Missbrauch.",
                  "Zweck: deine Anfrage an den jeweiligen Anbieter zu bearbeiten und Missbrauch zu verhindern.",
                  "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Anfrage auf deinen Wunsch) und Art. 6 Abs. 1 lit. a DSGVO (deine Einwilligung über das Häkchen im Formular, jederzeit für die Zukunft widerrufbar); für den Missbrauchsschutz Art. 6 Abs. 1 lit. f DSGVO.",
                  "Speicherort: Supabase (Datenbank in der EU, Region Frankfurt am Main).",
                  "E-Mail an den Anbieter: Nach dem Absenden leiten wir deine Anfrage per E-Mail von hello@orive.co an die öffentlich bekannte Kontaktadresse des genannten Anbieters weiter (Reply-To: deine E-Mail). Fehlt eine nutzbare Adresse, geht die Mail an unser Postfach robert.linke@me.com. Du erhältst keine automatische Bestätigungs-E-Mail. Anfragen über Profilseiten können an den genannten Anbieter weitergeleitet werden.",
                  "Weitergabe: Name, E-Mail, Nachricht und optional Wunschtermin gehen an den Anbieter bzw. an ORIVE (Fallback). Die Anfrage bleibt zusätzlich in unserer Datenbank gespeichert.",
                  "Speicherdauer: automatische Löschung 12 Monate nach Eingang oder früher, sobald du es verlangst.",
                ]
              : [
                  "Data stored: name, email address, message, preferred date (optional), the profile/offer concerned, language, time, your consent (with version), browser identifier (user agent) and a salted hash of your IP address. The IP address itself is only used briefly in memory to limit the number of enquiries (rate limiting) and to prevent abuse.",
                  "Purpose: to handle your enquiry to the provider and to prevent abuse.",
                  "Legal basis: Art. 6(1)(b) GDPR (pre-contractual enquiry at your request) and Art. 6(1)(a) GDPR (your consent via the checkbox in the form, which you can withdraw at any time for the future); for abuse prevention Art. 6(1)(f) GDPR.",
                  "Storage: Supabase (database in the EU, Frankfurt am Main region).",
                  "Email to the provider: after you submit, we forward your enquiry by email from hello@orive.co to the named provider’s publicly known contact address (Reply-To: your email). If no usable address exists, the mail goes to our mailbox robert.linke@me.com. You do not receive an automatic confirmation email. Enquiries submitted on profile pages may be forwarded to the named provider.",
                  "Disclosure: name, email, message and optional preferred date go to the provider or to ORIVE (fallback). The enquiry is also stored in our database.",
                  "Retention: deleted automatically 12 months after receipt, or earlier at your request.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("8. Profil-Übernahme und Entfernung im Verzeichnis", "8. Claiming and removing directory profiles")}>
        <FactList
          items={
            de
              ? [
                  "Übernahme-Antrag: Wir speichern Name, E-Mail-Adresse, deine Rolle, den angegebenen Nachweis-Link (z. B. Website oder Instagram), eine optionale Nachricht, das betroffene Profil, Zeitpunkt, deine Einwilligung (mit Version), Browserkennung (User-Agent) und einen gesalzenen Hash der IP-Adresse.",
                  "Zweck: prüfen, ob du das Profil übernehmen darfst, und dich dazu kontaktieren. Die Prüfung und Freigabe erfolgen von Hand; eine automatische Bestätigungs- oder Verifizierungs-E-Mail gibt es nicht.",
                  "Entfernungs-Antrag: Wir speichern das betroffene Profil, den Zeitpunkt und den optionalen Grund. Das Profil wird sofort ausgeblendet. Den Antrag bewahren wir auf, solange das Profil ausgeblendet bleiben soll, damit es nicht erneut erscheint.",
                  "Interne Benachrichtigung: Über jeden Antrag informieren wir unser eigenes Postfach robert.linke@me.com per E-Mail (Versand über Resend). Niemand sonst wird automatisch benachrichtigt.",
                  "Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung im Übernahme-Formular), Art. 6 Abs. 1 lit. c DSGVO i. V. m. Art. 17 und 21 DSGVO (Bearbeitung von Widerspruch und Entfernung) sowie Art. 6 Abs. 1 lit. f DSGVO (Missbrauchsschutz).",
                  "Speicherort und Speicherdauer: Übernahme-Anträge in Supabase (Datenbank in der EU, Region Frankfurt am Main), automatische Löschung 12 Monate nach Eingang oder früher auf Wunsch.",
                ]
              : [
                  "Claim request: we store your name, email address, your role, the proof link you provide (e.g. website or Instagram), an optional message, the profile concerned, time, your consent (with version), browser identifier (user agent) and a salted hash of your IP address.",
                  "Purpose: to check whether you may take over the profile and to contact you about it. Review and approval are done by hand; there is no automatic confirmation or verification email.",
                  "Removal request: we store the profile concerned, the time and the optional reason. The profile is hidden immediately. We keep the request for as long as the profile is to stay hidden, so that it does not reappear.",
                  "Internal notification: we inform our own mailbox robert.linke@me.com about every request by email (delivered via Resend). Nobody else is notified automatically.",
                  "Legal basis: Art. 6(1)(a) GDPR (consent in the claim form), Art. 6(1)(c) GDPR in conjunction with Art. 17 and 21 GDPR (handling objection and removal) and Art. 6(1)(f) GDPR (abuse prevention).",
                  "Storage and retention: claim requests in Supabase (database in the EU, Frankfurt am Main region), deleted automatically 12 months after receipt or earlier on request.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("9. KI-gestützte Suche und Chat", "9. AI-assisted search and chat")}>
        <p>
          {copy("Wenn du auf orive.co suchst oder mit Sofia chattest, wird der eingegebene Text zur Auswertung (z. B. Ort, Praxis, Zeitraum) und zur Sortierung passender Profile an KI-Anbieter übermittelt: Google (Gemini), xAI (Grok), Groq, Mistral AI und Cloudflare (Workers AI). Es wird jeweils nur ein Anbieter genutzt; fällt einer aus, übernimmt der nächste. Name oder E-Mail-Adresse übermitteln wir dabei nicht. Einige Anbieter verarbeiten Daten auch außerhalb der EU (insbesondere in den USA).", "When you search on orive.co or chat with Sofia, the text you enter is sent to AI providers to interpret it (e.g. place, practice, dates) and to rank matching profiles: Google (Gemini), xAI (Grok), Groq, Mistral AI and Cloudflare (Workers AI). Only one provider is used at a time; if one is unavailable, the next takes over. We do not send your name or email address. Some providers also process data outside the EU (in particular in the USA).")}
        </p>
        <FactList
          items={
            de
              ? [
                  "Zweck und Rechtsgrundlage: passende Ergebnisse zu deiner Anfrage liefern — Art. 6 Abs. 1 lit. b DSGVO (Nutzung der Suche auf deinen Wunsch) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer funktionierenden Suche).",
                  "Wir nutzen teilweise kostenlose Zugänge der Anbieter. Bei kostenlosen Zugängen können Anbieter Eingaben auch zur Verbesserung ihrer Modelle (Training) verwenden.",
                  "Bitte gib deshalb keine sensiblen Daten ein (z. B. Gesundheitsangaben, vollständige Namen Dritter, Kontaktdaten).",
                  "Ohne KI-Anbieter funktioniert die Suche mit einfacheren, regelbasierten Ergebnissen weiter.",
                ]
              : [
                  "Purpose and legal basis: to return results that match your request — Art. 6(1)(b) GDPR (using the search at your request) or Art. 6(1)(f) GDPR (legitimate interest in a working search).",
                  "We partly use free tiers of these providers. On free tiers, providers may also use inputs to improve their models (training).",
                  "Please do not enter sensitive data (e.g. health information, full names of other people, contact details).",
                  "Without an AI provider the search keeps working with simpler, rule-based results.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("10. Speicherdauer", "10. Retention")}>
        <p>
          {copy("Kontodaten bleiben, solange das Konto besteht und danach so lange, wie gesetzliche Aufbewahrungsfristen oder Abwehr von Rechtsansprüchen es erfordern. Buchungs- und Zahlungsbelege typischerweise bis zu 10 Jahre (handels-/steuerrechtlich). Logs kürzer, soweit nicht zur Sicherheit länger nötig. Intake-Antworten: so lange wie für die Buchung und etwaige Nachsorge/Streitfälle erforderlich, danach Löschung oder Anonymisierung.", "Account data lasts while the account exists and thereafter as long as legal retention or defence of claims requires. Booking and payment records typically up to 10 years (commercial/tax law). Logs shorter unless security needs longer. Intake answers: as long as needed for the booking and any aftercare/disputes, then deletion or anonymisation.")}
        </p>
      </FactSection>

      <FactSection title={copy("11. Cookies und lokaler Speicher", "11. Cookies and local storage")}>
        <p>
          {copy("Wir nutzen technisch notwendige Speicherung (z. B. Session, Sprache, Theme, Warenkorb-/Checkout-Hilfen) nach § 25 Abs. 2 TDDDG. Nicht notwendige Cookies setzen wir nur mit Einwilligung ein, soweit vorhanden. Für die Reichweitenmessung nutzen wir das cookielose Umami (siehe unten). Du kannst Browser-Speicher und Cookies jederzeit löschen; dann können einzelne Funktionen eingeschränkt sein.", "We use technically necessary storage (e.g. session, language, theme, cart/checkout helpers) under § 25(2) TDDDG. Non-essential cookies are used only with consent where applicable. For audience measurement we use cookieless Umami (see below). You can clear browser storage and cookies at any time; some features may then be limited.")}
        </p>
        <p className="mt-3">
          {copy("Reichweitenmessung mit Umami: Damit wir sehen, welche Seiten genutzt werden, verwenden wir die Open-Source-Software Umami – selbst gehostet auf unserem eigenen Server. Messskript und Messdaten laufen ausschließlich über orive.co/stats/. Umami setzt keine Cookies, und wir geben nichts an Dritte weiter oder verkaufen es. Verarbeitet werden aufgerufene Seite, Referrer, Gerätetyp, Betriebssystem, Browser, Bildschirmgröße und Sprache sowie der ungefähre Standort (Land, Region, Stadt), den unser Server aus deiner IP-Adresse ableitet. Die IP-Adresse selbst wird nicht gespeichert; Umami bildet daraus nur eine anonyme, monatlich wechselnde Besuchskennung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer datensparsamen Reichweitenmessung). Sendet dein Browser „Do Not Track“, wird nichts gemessen; widersprechen kannst du außerdem jederzeit per E-Mail.", "Audience measurement with Umami: to see which pages are used, we use the open-source software Umami – self-hosted on our own server. The tracking script and data run exclusively via orive.co/stats/. Umami sets no cookies, and we do not share or sell anything to third parties. Processed are the page viewed, referrer, device type, operating system, browser, screen size and language, plus the approximate location (country, region, city) our server derives from your IP address. The IP address itself is not stored; Umami only derives an anonymous visitor identifier that changes monthly. Legal basis is Art. 6(1)(f) GDPR (legitimate interest in privacy-friendly audience measurement). If your browser sends “Do Not Track”, nothing is measured; you can also object at any time by email.")}
        </p>
      </FactSection>

      <FactSection title={copy("12. Sicherheit", "12. Security")}>
        <p>
          {copy("Übertragung erfolgt über TLS/HTTPS. Zugriff auf Buchungs- und Facilitator-Daten ist rollenbezogen beschränkt. Vollständige Kartendaten liegen bei Stripe, nicht auf orive.co. Absolute Sicherheit im Internet kann niemand garantieren; wir treffen angemessene technische und organisatorische Maßnahmen.", "Transfers use TLS/HTTPS. Access to booking and facilitator data is role-restricted. Full card data sits with Stripe, not on orive.co. No one can guarantee absolute internet security; we apply appropriate technical and organisational measures.")}
        </p>
      </FactSection>

      <FactSection title={copy("13. Deine Rechte", "13. Your rights")}>
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

      <FactSection title={copy("14. Fairness für Seeker, Facilitator und ORIVE", "14. Fairness for seekers, facilitators and ORIVE")}>
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

      <FactSection title={copy("15. Änderungen", "15. Changes")}>
        <p>
          {copy("Wir aktualisieren diese Erklärung, wenn sich Dienste, Empfänger oder Rechtslage ändern. Der aktuelle Stand steht oben. Wesentliche Änderungen weisen wir auf orive.co aus.", "We update this policy when services, recipients or the law change. The current date is at the top. Material changes will be indicated on orive.co.")}
        </p>
      </FactSection>

      <FactSection title={copy("16. Weitere Hinweise", "16. Related notices")}>
        <p>
          <Link href="/agb" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("AGB", "Terms of use")}
          </Link>
          {" · "}
          <Link href="/protection" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Buchung & Zahlung (derzeit nicht aktiv)", "Booking & payment (not active yet)")}
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
