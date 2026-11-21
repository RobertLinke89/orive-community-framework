"use client";

import Link from "next/link";
import { FactPage, FactSection } from "@/components/FactPage";
import { useLanguage } from "@/hooks/useLanguage";
import { IMPRESSUM as D, IMPRESSUM_MISSING, IMPRESSUM_READY } from "@/lib/impressumData";

const UPDATED_DE = "Stand: 10. November 2026";
const UPDATED_EN = "Updated: 10 November 2026";

/** Renders a value, or a clearly marked gap (draft preview only – the page is not public until all required data exists). */
function V({ v, label }: { v: string | null; label: string }) {
  if (v) return <>{v}</>;
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
      [fehlt: {label}]
    </span>
  );
}

export default function Impressum() {
  const { language, copy } = useLanguage();
  const de = language === "de";

  return (
    <FactPage
      kicker={copy("Rechtliche Angaben", "Legal notice")}
      title="Impressum"
      updated={de ? UPDATED_DE : UPDATED_EN}
    >
      {!IMPRESSUM_READY ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          Entwurf (nur Staging) – fehlende Pflichtangaben: {IMPRESSUM_MISSING.join(", ")}
        </p>
      ) : null}

      <FactSection title={copy("Angaben gemäß § 5 DDG", "Information pursuant to § 5 DDG")}>
        <p>
          {copy("ORIVE (orive.co) ist ein Angebot von:", "ORIVE (orive.co) is operated by:")}
          <br />
          <strong><V v={D.anbieterName} label="Name / Firma" /></strong>
          <br />
          {copy("Inhaber: ", "Owner: ")}<V v={D.inhaber} label="Inhaber" />
          {D.rechtsform ? (<><br />{D.rechtsform}</>) : null}
          {D.vertretenDurch ? (<><br />{copy("Vertreten durch: ", "Represented by: ")}{D.vertretenDurch}</>) : null}
          <br />
          <V v={D.strasse} label="Straße und Hausnummer" />
          <br />
          <V v={D.plzOrt} label="PLZ und Ort" />
          <br />
          <V v={D.land} label="Land" />
        </p>
      </FactSection>

      <FactSection title={copy("Kontakt", "Contact")}>
        <p>
          {copy("E-Mail: ", "Email: ")}
          {D.email ? (
            <a href={`mailto:${D.email}`} className="text-slate-900 dark:text-white underline underline-offset-4">{D.email}</a>
          ) : <V v={null} label="E-Mail" />}
          {D.telefon || !IMPRESSUM_READY ? (
            <>
              <br />
              {copy("Telefon: ", "Phone: ")}<V v={D.telefon} label="Telefon oder zweiter schneller Kontaktweg" />
            </>
          ) : null}
        </p>
      </FactSection>

      {D.register || !IMPRESSUM_READY ? (
        <FactSection title={copy("Registereintrag", "Register entry")}>
          <p><V v={D.register} label="Registergericht + Registernummer (nur falls eingetragen)" /></p>
        </FactSection>
      ) : null}

      {D.ustId || !IMPRESSUM_READY ? (
        <FactSection title={copy("Umsatzsteuer-ID", "VAT ID")}>
          <p>{copy("Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ", "VAT identification number (§ 27a UStG): ")}<V v={D.ustId} label="USt-IdNr. (nur falls vorhanden)" /></p>
        </FactSection>
      ) : null}

      {D.verantwortlichMStV || !IMPRESSUM_READY ? (
        <FactSection
          title={copy("Verantwortlich für redaktionelle Inhalte (§ 18 Abs. 2 MStV)", "Responsible for editorial content (§ 18(2) MStV)")}
        >
          <p><V v={D.verantwortlichMStV} label="Name + Anschrift der verantwortlichen Person" /></p>
        </FactSection>
      ) : null}

      <FactSection
        title={copy("Verbraucherstreitbeilegung (§ 36 VSBG)", "Consumer dispute resolution (§ 36 VSBG)")}
      >
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
