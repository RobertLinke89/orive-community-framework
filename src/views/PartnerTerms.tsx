"use client";

import Link from "next/link";
import { FactList, FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

export function PartnerTerms() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Affiliate", "Affiliate")}
      title={copy("Partnerbedingungen und Vergütung", "Partner terms and payouts")}
      updated={copy("Stand: 23. September 2026", "Updated: 23 September 2026")}
    >
      <FactSection title={copy("Programm", "Programme")}>
        <p>
          {copy("Das ORIVE-Partnerprogramm vergütet vermittelte Buchungen, die über einen zugeordneten Partnerlink oder ein Widget zustande kommen. Bewerbung und Aufnahme: ", "The ORIVE partner programme pays for referred bookings attributed to a partner link or widget. Application and admission: ")}
          <Link href="/affiliate" className="text-slate-900 dark:text-white underline underline-offset-4">
            /affiliate
          </Link>
          .
        </p>
      </FactSection>

      <FactSection title={copy("Vergütung, die derzeit kommuniziert wird", "Compensation currently stated")}>
        <FactList
          items={
            de
              ? [
                  "Provision: bis zu 20 % der vermittelten Buchung.",
                  "Rechenbeispiel auf der Partnerseite: 15 % bei einem Durchschnittswert von 120 €.",
                  "Attributionsfenster: 60 Tage nach Klick auf den Partnerlink (Cookie).",
                  "Auszahlung: monatlich per SEPA oder Stripe, sobald die Buchung zugeordnet ist.",
                ]
              : [
                  "Commission: up to 20% of the referred booking.",
                  "Worked example on the partner page: 15% at an average booking value of €120.",
                  "Attribution window: 60 days after the partner-link click (cookie).",
                  "Payout: monthly by SEPA or Stripe once the booking is attributed.",
                ]
          }
        />
        <p>
          {copy("Die konkrete Rate steht in der jeweiligen Partnervereinbarung. Öffentliche Rechnerwerte sind Schätzungen, keine Garantie.", "The exact rate is set in the individual partner agreement. Public calculator figures are estimates, not a guarantee.")}
        </p>
      </FactSection>

      <FactSection title={copy("Voraussetzungen", "Requirements")}>
        <FactList
          items={
            de
              ? [
                  "Vollständige und wahrheitsgemäße Angaben im Antragsformular.",
                  "Keine irreführende Werbung, kein Kauf von Fake-Traffic, kein Brand-Bidding auf „ORIVE“ ohne Freigabe.",
                  "Einhaltung der DSGVO bei eigener Website, Newsletter oder Social Ads.",
                  "ORIVE kann Partnerschaften bei Missbrauch beenden; offene, berechtigte Provisionen bleiben zahlbar.",
                ]
              : [
                  "Complete and accurate application details.",
                  "No misleading ads, fake traffic, or brand bidding on “ORIVE” without approval.",
                  "GDPR compliance on the partner’s own site, newsletter or ads.",
                  "ORIVE may end a partnership for abuse; earned, valid commissions remain payable.",
                ]
          }
        />
      </FactSection>

      <FactSection title={copy("Steuern", "Tax")}>
        <p>
          {copy("Partner sind für ihre steuerliche Einordnung selbst verantwortlich (z. B. Umsatzsteuer, Einkommensteuer). ORIVE zahlt die vereinbarte Netto-Provision gemäß der aufgenommenen Partnerdaten.", "Partners are responsible for their own tax treatment (VAT, income tax). ORIVE pays the agreed net commission according to the partner record on file.")}
        </p>
      </FactSection>

      <FactSection title={copy("Kontakt", "Contact")}>
        <p>
          <a href="mailto:robert.linke@me.com" className="text-slate-900 dark:text-white underline underline-offset-4">
            robert.linke@me.com
          </a>
          {" · "}
          <Link href="/affiliate" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Programmseite", "Programme page")}
          </Link>
          {" · "}
          <Link href="/agb" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("AGB", "Terms")}
          </Link>
        </p>
      </FactSection>
    </FactPage>
  );
}
