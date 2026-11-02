"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

export function BuyerProtection() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Zahlung & Vermittlung", "Payment & intermediation")}
      title={copy("Buchung & Zahlung", "Booking & payment")}
      updated={copy("Stand: 24. September 2026", "Updated: 24 September 2026")}
    >
      <FactSection title={copy("Was ORIVE ist", "What ORIVE is")}>
        <p>
          {copy("ORIVE ist ein Verzeichnis und ein im Aufbau befindlicher Marktplatz von heybotti (Inhaber: Robert Linke, Stiftsgasse 17, 07407 Rudolstadt). Eventbrite- und andere Partnerangebote im Katalog sind nicht über ORIVE verkauft. Zahlung und Platzvergabe liegen beim Partner.", "ORIVE is a directory and a marketplace in progress, operated by heybotti (proprietor: Robert Linke, Stiftsgasse 17, 07407 Rudolstadt, Germany). Eventbrite and other partner listings in the catalog are not sold by ORIVE. Payment and seats stay with the partner.")}
        </p>
      </FactSection>

      <FactSection title={copy("Wann ORIVE Geld nimmt", "When ORIVE takes money")}>
        <FactList
          items={
            de
              ? [
                  "Nur bei Angeboten, die ausdrücklich „Auf ORIVE buchen“ heißen: claimed Facilitator, echter Termin, Stripe Checkout.",
                  "Kartennummern werden nie auf orive.co erfasst. Zahlung läuft bei Stripe.",
                  "Eine simulierte Zahlung gilt nicht als Buchung.",
                  "Partnerlistings haben keinen ORIVE-Käuferschutz.",
                ]
              : [
                  "Only on listings that say “Book on ORIVE”: a claimed facilitator, a real slot, and Stripe Checkout.",
                  "Card numbers are never collected on orive.co. Payment runs on Stripe.",
                  "A simulated payment is not a booking.",
                  "Partner listings have no ORIVE buyer protection.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("Zahlungsweg", "How payment works")}>
        <p>
          {copy("Sobald ein Angebot auf ORIVE verkauft wird, läuft die Zahlung über Stripe Checkout. Kartennummern werden nicht auf orive.co erfasst. Eine Simulation ist in Produktion ausgeschaltet.", "When a listing is sold on ORIVE, payment goes through Stripe Checkout. Card numbers are not collected on orive.co. Simulation is off in production.")}
        </p>
      </FactSection>

      <FactSection title={copy("Was der Schutz umfasst", "What the protection covers")}>
        <FactList
          items={
            de
              ? [
                  "Nur ORIVE-verkaufte Termine: Zahlung an ORIVE, Beleg, Storno- und Streitfall über contact@orive.app.",
                  "Partnerlistings: Schutz und Rückerstattung liegen beim Partner, nicht bei ORIVE.",
                ]
              : [
                  "ORIVE-sold slots only: payment to ORIVE, a receipt, and disputes via contact@orive.app.",
                  "Partner listings: protection and refunds stay with the partner, not ORIVE.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("Was nicht automatisch gilt", "What is not automatic")}>
        <p>
          {copy("ORIVE ist kein Versicherer. Es gibt keine pauschale Sofort-Rückerstattung per Knopfdruck. Änderungen, Umbuchungen und Rückzahlungen werden einzeln geprüft. Termingebundene Dienstleistungen können vom gesetzlichen Widerrufsrecht ausgenommen sein.", "ORIVE is not an insurer. There is no one-click instant refund. Changes, rebookings and repayments are reviewed case by case. Time-specific services may be excluded from statutory withdrawal rights.")}
        </p>
      </FactSection>

      <FactSection title={copy("Kontakt", "Contact")}>
        <p>
          {copy("E-Mail: ", "Email: ")}
          <a href="mailto:robert.linke@me.com" className="text-slate-900 dark:text-white underline underline-offset-4">
            robert.linke@me.com
          </a>
          {copy(". Rechtliche Angaben: ", ". Legal notice: ")}
          <Link href="/agb#impressum" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Impressum", "Impressum")}
          </Link>
          {copy(". Vertragsregeln: ", ". Contract rules: ")}
          <Link href="/agb" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("AGB", "Terms")}
          </Link>
          .
        </p>
      </FactSection>
    </FactPage>
  );
}
