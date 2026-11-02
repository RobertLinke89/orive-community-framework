"use client";

import Link from "next/link";
import { FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";

const CONTACT = "robert.linke@me.com";
const UPDATED_DE = "Stand: 28. September 2026";
const UPDATED_EN = "Updated: 28 September 2026";

export default function Impressum() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Rechtliche Angaben", "Legal notice")}
      title="Impressum"
      updated={de ? UPDATED_DE : UPDATED_EN}
    >
      <FactSection title={copy("Angaben gemäß § 5 DDG", "Information pursuant to § 5 DDG")}>
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

      <FactSection title={copy("Kontakt", "Contact")}>
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
          copy("Verantwortlich für redaktionelle Inhalte (§ 18 Abs. 2 MStV)", "Responsible for editorial content (§ 18(2) MStV)")
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

      <FactSection
        title={copy("Verbraucherstreitbeilegung", "Consumer dispute resolution")}
      >
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

      <FactSection title={copy("Haftung für Inhalte", "Liability for content")}>
        <p>
          {copy("Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung nach den allgemeinen Gesetzen bleiben unberührt. Haftung hierfür ist erst ab Kenntnis einer konkreten Rechtsverletzung möglich; bei Bekanntwerden entfernen wir entsprechende Inhalte umgehend.", "As a service provider we are responsible for our own content on these pages under general law (§ 7(1) DDG). Under §§ 8–10 DDG we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity. Obligations to remove or block information under general law remain unaffected. Liability in that regard is only possible from the time we become aware of a specific infringement; we will then remove such content without delay.")}
        </p>
      </FactSection>

      <FactSection title={copy("Haftung für Links", "Liability for links")}>
        <p>
          {copy("Unser Angebot enthält Links zu externen Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss und übernehmen keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung wurden die Seiten auf mögliche Rechtsverstöße geprüft; rechtswidrige Inhalte waren nicht erkennbar. Eine permanente Kontrolle ist ohne konkrete Anhaltspunkte nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.", "Our site contains links to external third-party websites. We have no influence over their content and accept no liability for it. The respective provider or operator is always responsible for linked pages. At the time of linking, pages were checked for possible legal violations; unlawful content was not apparent. Ongoing monitoring without concrete indications is not reasonable. We will remove such links promptly if we become aware of infringements.")}
        </p>
      </FactSection>

      <FactSection title={copy("Urheberrecht", "Copyright")}>
        <p>
          {copy("Die von uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit Inhalte nicht vom Betreiber stammen, werden Rechte Dritter beachtet. Hinweise auf Rechtsverletzungen bitte an die oben genannte E-Mail; bei Bekanntwerden entfernen wir betroffene Inhalte umgehend.", "Content and works created by us on these pages are subject to German copyright. Reproduction, editing, distribution and any use beyond the limits of copyright require the written consent of the respective author or creator. Downloads and copies are permitted only for private, non-commercial use. Where content was not created by the operator, third-party rights are respected. Please report infringements to the email above; we will remove affected content promptly when notified.")}
        </p>
      </FactSection>

      <FactSection title={copy("Weitere Hinweise", "Related notices")}>
        <p>
          <Link href="/agb" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("AGB", "Terms of use")}
          </Link>
          {" · "}
          <Link href="/datenschutz" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Datenschutz", "Privacy")}
          </Link>
          {" · "}
          <Link href="/protection" className="text-slate-900 dark:text-white underline underline-offset-4">
            {copy("Buchung & Zahlung", "Booking & payment")}
          </Link>
        </p>
      </FactSection>
    </FactPage>
  );
}
