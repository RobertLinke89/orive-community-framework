"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

const CONTACT = "robert.linke@me.com";
const UPDATED_DE = "Stand: 28. September 2026";
const UPDATED_EN = "Updated: 28 September 2026";

export function Terms() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Vertrag", "Contract")}
      title={copy("Allgemeine Geschäftsbedingungen", "Terms of use")}
      updated={de ? UPDATED_DE : UPDATED_EN}
    >
      <FactSection title={copy("1. Geltungsbereich", "1. Scope")}>
        <p>
          {copy("Diese Bedingungen gelten für die Nutzung von orive.co (ORIVE) und für Buchungen, die über ORIVE verkauft werden. Anbieter ist heybotti, Inhaber Robert Linke, Stiftsgasse 17, 07407 Rudolstadt, Deutschland. Mit Registrierung, Veröffentlichung eines Angebots oder Abschluss einer Buchung akzeptierst du diese Bedingungen.", "These terms govern use of orive.co (ORIVE) and bookings sold through ORIVE. The operator is heybotti, proprietor Robert Linke, Stiftsgasse 17, 07407 Rudolstadt, Germany. By registering, publishing a listing or completing a booking you accept these terms.")}
        </p>
      </FactSection>

      <FactSection title={copy("2. Rollen", "2. Roles")}>
        <FactList
          items={
            de
              ? [
                  "Seeker: die buchende Person.",
                  "Facilitator: die Person oder Praxis, die das Angebot durchführt.",
                  "ORIVE: Verzeichnis und Vermittlungsplattform. ORIVE erbringt die Session, das Event oder Retreat nicht selbst, sofern nicht ausdrücklich als ORIVE-eigenes Angebot gekennzeichnet.",
                  "Partnerlistings (z. B. Eventbrite): nur im Katalog sichtbar. Zahlung, Plätze und Storno liegen beim Partner — nicht bei ORIVE.",
                ]
              : [
                  "Seeker: the booker.",
                  "Facilitator: the person or practice delivering the offering.",
                  "ORIVE: directory and intermediation platform. ORIVE does not itself deliver the session, event or retreat unless expressly marked as an ORIVE-hosted offering.",
                  "Partner listings (e.g. Eventbrite): catalog visibility only. Payment, seats and cancellation sit with the partner — not ORIVE.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("3. Vertragsschluss (ORIVE-Buchungen)", "3. Contract formation (ORIVE bookings)")}>
        <p>
          {copy("Ein Listing auf orive.co ist eine Einladung zur Buchung. Bei Angeboten mit „Auf ORIVE buchen“ kommt der Vertrag zustande, wenn die Karte bei Stripe erfolgreich hinterlegt bzw. die Zahlung freigegeben ist und ORIVE die Buchung bestätigt (Buchungspass / Bestätigung).", "A listing on orive.co is an invitation to book. For “Book on ORIVE” listings, the contract is formed when the card is successfully saved or payment is authorised on Stripe and ORIVE confirms the booking (booking pass / confirmation).")}
        </p>
      </FactSection>

      <FactSection title={copy("4. Preise und Zahlung", "4. Prices and payment")}>
        <FactList
          items={
            de
              ? [
                  "Marktplatzpreise sind in Euro, sofern nicht anders angegeben.",
                  "Bei ORIVE-Buchungen: Karte wird bei der Buchung über Stripe gespeichert; Abbuchung nach der Session bzw. gemäß dem am Listing ausgewiesenen Zahlungszeitpunkt.",
                  "Zusätzlich zum Angebotspreis fällt 1,00 € ORIVE-Vermittlungsgebühr an. Der vereinbarte Satz geht an den Facilitator (abzüglich Stripe-/Auszahlungskosten, soweit ausgewiesen).",
                  "Kartennummern werden nicht auf orive.co gespeichert. Zahlungsdaten verarbeitet Stripe.",
                  "Partnerlistings: Endpreis und Zahlung ausschließlich beim Partner.",
                ]
              : [
                  "Marketplace prices are in euro unless stated otherwise.",
                  "On ORIVE bookings: the card is saved at booking via Stripe; the charge runs after the session or at the timing shown on the listing.",
                  "A €1.00 ORIVE intermediation fee is added to the offering price. The agreed rate goes to the facilitator (less Stripe/payout costs where disclosed).",
                  "Card numbers are not stored on orive.co. Stripe processes payment data.",
                  "Partner listings: final price and payment sit solely with the partner.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("5. Pflichten der Seeker", "5. Seeker duties")}>
        <FactList
          items={
            de
              ? [
                  "Angaben bei Buchung und Intake müssen wahrheitsgemäß sein (Name, E-Mail, relevante Teilnahme- oder Gesundheitshinweise, soweit abgefragt).",
                  "Termine, Ort und Online-Zugang selbst wahrnehmen; Zugangsdaten nicht weitergeben.",
                  "Haus-, Sicherheits- und Teilnahmebedingungen des Facilitators gelten zusätzlich.",
                  "ORIVE ist keine medizinische Einrichtung. Wellness-Angebote ersetzen keine ärztliche oder therapeutische Behandlung.",
                ]
              : [
                  "Booking and intake details must be accurate (name, email, and any participation or health information requested).",
                  "Attend the stated time, place or online access; do not share access credentials.",
                  "The facilitator’s house, safety and participation rules apply in addition.",
                  "ORIVE is not a medical provider. Wellness offerings do not replace medical or therapeutic care.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("6. Pflichten der Facilitators", "6. Facilitator duties")}>
        <FactList
          items={
            de
              ? [
                  "Angebote, Preise, Kapazität, Ort und Beschreibung müssen richtig und aktuell sein (Mindestqualität der Beschreibung gemäß ORIVE-Vorgaben).",
                  "Nur Angebote listen, zu deren Durchführung die erforderliche Qualifikation, Versicherung und Genehmigung vorliegen.",
                  "Gebuchte Termine zuverlässig halten oder rechtzeitig und nachvollziehbar stornieren bzw. umbuchen.",
                  "Gast- und Intake-Daten nur für die gebuchte Leistung nutzen und datenschutzkonform behandeln.",
                  "Auszahlungen setzen ein gültiges Stripe-Connect-Konto und korrekte steuerliche Angaben voraus; Facilitators sind für ihre Steuerpflichten selbst verantwortlich.",
                ]
              : [
                  "Listings, prices, capacity, location and description must be accurate and current (description quality per ORIVE requirements).",
                  "Only list offerings you are qualified, insured and authorised to deliver.",
                  "Honour booked dates or cancel/reschedule in time with a clear trail.",
                  "Use guest and intake data only for the booked service and handle it lawfully.",
                  "Payouts require a valid Stripe Connect account and correct tax details; facilitators remain responsible for their own tax obligations.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("7. Stornierung und Widerruf", "7. Cancellation and withdrawal")}>
        <FactList
          items={
            de
              ? [
                  "Standard bei ORIVE-Buchungen: kostenfreie Stornierung bis 24 Stunden vor Beginn. Danach und bei Nichterscheinen kann der Betrag abgebucht werden.",
                  "Abweichende Stornoregeln im jeweiligen Angebot gehen vor, wenn sie vor der Buchung klar ausgewiesen sind.",
                  "Viele termingebundene Freizeit- oder Dienstleistungen sind vom gesetzlichen 14-Tage-Widerruf ausgenommen (§ 312g Abs. 2 BGB). Soweit Widerruf möglich ist, informieren wir gesondert.",
                  "Facilitator-seitige Ausfälle: ORIVE bemüht sich um Umbuchung oder Erstattung des ORIVE-bezogenen Betrags; Partnerlistings folgen den Partnerregeln.",
                  "Streitfälle zu ORIVE-Buchungen: " + CONTACT + " — Prüfung im Einzelfall, fair und dokumentiert.",
                ]
              : [
                  "Default for ORIVE bookings: free cancellation until 24 hours before start. After that and for no-shows, the amount may be charged.",
                  "Listing-specific cancellation rules prevail when clearly shown before booking.",
                  "Many time-specific leisure or personal services are excluded from the statutory 14-day withdrawal right. Where withdrawal applies, we will state it separately.",
                  "Facilitator-side cancellations: ORIVE will work toward a rebooking or refund of the ORIVE-related amount; partner listings follow partner rules.",
                  "Disputes on ORIVE bookings: " + CONTACT + " — reviewed case by case, fairly and with a record.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("8. Inhalte und Konten", "8. Content and accounts")}>
        <p>
          {copy("Facilitators bleiben Inhaber ihrer Angebotsinhalte und räumen ORIVE eine nicht-exklusive Lizenz ein, sie auf der Plattform anzuzeigen und zu vermarkten. ORIVE darf Angebote ablehnen, sperren oder entfernen, die irreführend, rechtswidrig, unsicher oder gegen diese Bedingungen verstoßen. Konten können bei Missbrauch, Betrugsverdacht oder schwerwiegenden Pflichtverletzungen eingeschränkt werden.", "Facilitators retain ownership of their listing content and grant ORIVE a non-exclusive licence to display and market it on the platform. ORIVE may refuse, suspend or remove listings that are misleading, unlawful, unsafe or contrary to these terms. Accounts may be restricted for abuse, suspected fraud or serious breaches.")}
        </p>
      </FactSection>

      <FactSection title={copy("9. Haftung", "9. Liability")}>
        <p>
          {copy("ORIVE haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit. Bei leichter Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, typischen Schaden. Die Durchführung der Leistung liegt beim Facilitator. Für Partnerlistings und externe Websites übernimmt ORIVE keine Verantwortung für Inhalt, Preis, Verfügbarkeit oder Zahlung. Gesetzliche Verbraucherrechte bleiben unberührt.", "ORIVE is fully liable for intent and gross negligence and for injury to life, body or health. For simple negligence, only for breach of essential duties and limited to foreseeable typical damage. Delivery of the service sits with the facilitator. For partner listings and external sites ORIVE is not responsible for content, price, availability or payment. Mandatory consumer rights remain unaffected.")}
        </p>
      </FactSection>

      <FactSection title={copy("10. Datenschutz", "10. Privacy")}>
        <p>
          {de ? (
            <>
              Verarbeitung personenbezogener Daten: siehe{" "}
              <Link href="/datenschutz" className="text-slate-900 dark:text-white underline underline-offset-4">
                Datenschutzerklärung
              </Link>
              .
            </>
          ) : (
            <>
              Processing of personal data: see the{" "}
              <Link href="/datenschutz" className="text-slate-900 dark:text-white underline underline-offset-4">
                privacy policy
              </Link>
              .
            </>
          )}
        </p>
      </FactSection>

      <FactSection title={copy("11. Änderungen", "11. Changes")}>
        <p>
          {copy("ORIVE kann diese Bedingungen anpassen, wenn Gesetze, Zahlungswege oder Plattformfunktionen das erfordern. Wesentliche Änderungen werden auf orive.co kenntlich gemacht. Fortgesetzte Nutzung nach dem angegebenen Stand gilt als Zustimmung, soweit gesetzlich zulässig. Für bereits bestätigte Buchungen gelten die Bedingungen zum Buchungszeitpunkt.", "ORIVE may update these terms when law, payment rails or platform features require it. Material changes will be indicated on orive.co. Continued use after the stated date may constitute acceptance where permitted by law. Confirmed bookings keep the terms in force at the time of booking.")}
        </p>
      </FactSection>

      <FactSection title={copy("12. Recht und Kontakt", "12. Law and contact")}>
        <p>
          {copy("Es gilt das Recht der Bundesrepublik Deutschland. Zwingender Verbraucherschutz am Wohnsitz der buchenden Person bleibt unberührt. Gerichtsstand für Kaufleute ist der Sitz des Anbieters.", "German law applies. Mandatory consumer protections at the booker’s residence remain unaffected. Venue for merchants is the operator’s registered location.")}
        </p>
        <p>
          {copy("Kontakt: ", "Contact: ")}
          <a href={`mailto:${CONTACT}`} className="text-slate-900 dark:text-white underline underline-offset-4">
            {CONTACT}
          </a>
          {" · "}
          <Link href="/protection" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Buchung & Zahlung", "Booking & payment")}
          </Link>
          {" · "}
          <Link href="/partner-terms" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Partnerbedingungen", "Partner terms")}
          </Link>
          {" · "}
          <Link href="/datenschutz" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Datenschutz", "Privacy")}
          </Link>
        </p>
      </FactSection>

      <div id="impressum" className="scroll-mt-28 space-y-10">
        <FactSection title={copy("13. Impressum — Angaben gemäß § 5 DDG", "13. Legal notice — § 5 DDG")}>
          <p>
            {copy("ORIVE ist eine Marke und ein digitales Angebot von:", "ORIVE is a brand and digital service operated by:")}
          </p>
          <p>
            <strong>heybotti</strong>
            <br />
            {copy("Inhaber: Robert Linke", "Proprietor: Robert Linke")}
            <br />
            Stiftsgasse 17
            <br />
            07407 Rudolstadt
            <br />
            {copy("Deutschland", "Germany")}
          </p>
        </FactSection>

        <FactSection title={copy("14. Kontakt (Impressum)", "14. Contact (legal notice)")}>
          <p>
            {copy("E-Mail: ", "Email: ")}
            <a href={`mailto:${CONTACT}`} className="text-slate-900 dark:text-white underline underline-offset-4">
              {CONTACT}
            </a>
          </p>
          <p>
            {copy("Internet: ", "Website: ")}
            <a
              href="https://www.orive.co"
              className="text-slate-900 dark:text-white underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.orive.co
            </a>
          </p>
        </FactSection>

        <FactSection
          title={
            copy("15. Verantwortlich für redaktionelle Inhalte (§ 18 Abs. 2 MStV)", "15. Responsible for editorial content (§ 18(2) MStV)")
          }
        >
          <p>
            Robert Linke
            <br />
            Stiftsgasse 17
            <br />
            07407 Rudolstadt
            <br />
            {copy("Deutschland", "Germany")}
          </p>
        </FactSection>

        <FactSection title={copy("16. Verbraucherstreitbeilegung", "16. Consumer dispute resolution")}>
          <p>
            {copy("Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:", "The European Commission provides a platform for online dispute resolution (ODR):")}{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-white underline underline-offset-4"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            .
          </p>
          <p>
            {copy("Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.", "We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.")}
          </p>
        </FactSection>

        <FactSection title={copy("17. Haftung für Inhalte", "17. Liability for content")}>
          <p>
            {copy("Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung nach den allgemeinen Gesetzen bleiben unberührt. Haftung hierfür ist erst ab Kenntnis einer konkreten Rechtsverletzung möglich; bei Bekanntwerden entfernen wir entsprechende Inhalte umgehend.", "As a service provider we are responsible for our own content on these pages under general law (§ 7(1) DDG). Under §§ 8–10 DDG we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity. Obligations to remove or block information under general law remain unaffected. Liability in that regard is only possible from the time we become aware of a specific infringement; we will then remove such content without delay.")}
          </p>
        </FactSection>

        <FactSection title={copy("18. Haftung für Links", "18. Liability for links")}>
          <p>
            {copy("Unser Angebot enthält Links zu externen Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss und übernehmen keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung wurden die Seiten auf mögliche Rechtsverstöße geprüft; rechtswidrige Inhalte waren nicht erkennbar. Eine permanente Kontrolle ist ohne konkrete Anhaltspunkte nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.", "Our site contains links to external third-party websites. We have no influence over their content and accept no liability for it. The respective provider or operator is always responsible for linked pages. At the time of linking, pages were checked for possible legal violations; unlawful content was not apparent. Ongoing monitoring without concrete indications is not reasonable. We will remove such links promptly if we become aware of infringements.")}
          </p>
        </FactSection>

        <FactSection title={copy("19. Urheberrecht", "19. Copyright")}>
          <p>
            {copy("Die von uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit Inhalte nicht vom Betreiber stammen, werden Rechte Dritter beachtet. Hinweise auf Rechtsverletzungen bitte an die oben genannte E-Mail; bei Bekanntwerden entfernen wir betroffene Inhalte umgehend.", "Content and works created by us on these pages are subject to German copyright. Reproduction, editing, distribution and any use beyond the limits of copyright require the written consent of the respective author or creator. Downloads and copies are permitted only for private, non-commercial use. Where content was not created by the operator, third-party rights are respected. Please report infringements to the email above; we will remove affected content promptly when notified.")}
          </p>
        </FactSection>
      </div>
    </FactPage>
  );
}
