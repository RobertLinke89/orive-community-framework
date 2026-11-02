"use client";

import Link from "next/link";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

const MAIL = "mailto:robert.linke@me.com?subject=ORIVE%20%E2%80%94%20Investoren";

export default function Invest() {
  const { language } = useLanguage();
  const isDe = language === "de";
  const t = isDe ? de : en;

  return (
    <Layout>
      <article className="bg-background text-foreground">
        <header className="border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {t.kicker}
            </p>
            <h1 className="mt-5 max-w-[18ch] text-[2.55rem] sm:text-6xl lg:text-[4.35rem] font-semibold tracking-[-0.035em] leading-[1.02] text-[#01223F] dark:text-white">
              {t.title}
              <span className="block text-[#01223F]/55 dark:text-white/55">{t.titleSecond}</span>
            </h1>
            <p className="mt-8 max-w-[40rem] text-lg sm:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
              {t.lede}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <a
                href={MAIL}
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#01223F] dark:bg-white text-white dark:text-[#01223F] text-sm font-semibold hover:bg-[#017F80] dark:hover:bg-[#00CDAC] transition-colors"
              >
                {t.cta}
              </a>
              <a
                href="#shift"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#01223F] dark:hover:text-white"
              >
                {t.read}
              </a>
            </div>
          </div>
        </header>

        <nav
          aria-label={t.navLabel}
          className="sticky top-16 z-40 bg-background/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10"
        >
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 flex gap-6 overflow-x-auto py-3 text-[12px] font-semibold tracking-wide text-slate-500">
            {t.nav.map((item) => (
              <a key={item.href} href={item.href} className="shrink-0 hover:text-[#01223F] dark:hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="shift" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="01" label={t.shift.label} />
            <h2 className="mt-4 max-w-[22ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.shift.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.shift.body}
            </p>

            <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
              {t.shift.items.map((item) => (
                <li key={item.name} className="bg-background p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80] dark:text-[#00CDAC]">
                    {item.name}
                  </p>
                  <p className="mt-4 text-2xl sm:text-[1.7rem] font-semibold tracking-tight leading-snug text-[#01223F] dark:text-white">
                    {item.line}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[46rem] text-xl sm:text-2xl font-medium tracking-tight leading-snug text-[#01223F] dark:text-white">
              {t.shift.thesis}
            </p>
          </div>
        </section>

        <section id="home" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B]">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="02" label={t.home.label} />
            <h2 className="mt-4 max-w-[20ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.home.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.home.body}
            </p>

            <div className="mt-12 divide-y divide-slate-200/80 dark:divide-white/10 border-y border-slate-200/80 dark:border-white/10">
              {t.home.layers.map((layer) => (
                <div key={layer.name} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] lg:grid-cols-[11rem_14rem_1fr] gap-2 sm:gap-8 py-6 sm:py-7">
                  <p className="text-sm font-semibold text-[#01223F] dark:text-white">{layer.name}</p>
                  <p className="text-sm text-[#017F80] dark:text-[#00CDAC]">{layer.product}</p>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{layer.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <h3 className="lg:col-span-4 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-[#01223F] dark:text-white">
                {t.home.sequenceTitle}
              </h3>
              <ol className="lg:col-span-8 space-y-5">
                {t.home.sequence.map((step, i) => (
                  <li key={step} className="grid grid-cols-[2rem_1fr] gap-3 text-[17px] leading-relaxed text-slate-700 dark:text-slate-200">
                    <span className="font-mono text-xs pt-1.5 text-[#017F80] dark:text-[#00CDAC]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="market" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="03" label={t.market.label} />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.market.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.market.body}
            </p>

            <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {t.market.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[1.65rem] sm:text-[2rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                    {fact.value}
                  </dt>
                  <dd className="mt-3 text-sm leading-snug text-slate-600 dark:text-slate-300">{fact.label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-12 max-w-[44rem] text-[17px] leading-[1.7] text-slate-700 dark:text-slate-200">
              {t.market.wellbeing}
            </p>
            <p className="mt-6 max-w-[44rem] text-xs leading-relaxed text-slate-500">
              {t.market.source}
            </p>
          </div>
        </section>

        <section id="model" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B]">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="04" label={t.model.label} />
            <h2 className="mt-4 max-w-[20ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.model.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.model.body}
            </p>

            <ol className="mt-12 space-y-0 border-t border-slate-200/80 dark:border-white/10">
              {t.model.steps.map((step, i) => (
                <li key={step.name} className="grid grid-cols-1 md:grid-cols-[7rem_1fr] gap-2 md:gap-10 py-7 border-b border-slate-200/80 dark:border-white/10">
                  <p className="font-mono text-xs text-[#017F80] dark:text-[#00CDAC] pt-1">
                    {String(i + 1).padStart(2, "0")} · {step.when}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">{step.name}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[44rem] text-sm leading-relaxed text-slate-500">
              {t.model.note}
            </p>
          </div>
        </section>

        <section id="surface" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="05" label={t.surface.label} />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.surface.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.surface.body}
            </p>

            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {t.surface.stats.map((stat) => (
                <li key={stat.label} className="rounded-2xl border border-slate-200/80 dark:border-white/10 px-4 py-5">
                  <p className="text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{stat.label}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.surface.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200/80 dark:border-white/10 px-5 py-5 hover:border-[#00CDAC]/60 transition-colors"
                >
                  <p className="text-sm font-semibold text-[#01223F] dark:text-white group-hover:text-[#017F80] dark:group-hover:text-[#00CDAC]">
                    {item.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="capital" className="scroll-mt-28 bg-[#01223F] text-white">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="06" label={t.capital.label} light />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
              {t.capital.title}
            </h2>
            <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {t.capital.items.map((item, i) => (
                <li key={item.name}>
                  <p className="font-mono text-xs text-[#00CDAC]">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.detail}</p>
                </li>
              ))}
            </ol>

            <div className="mt-16 pt-10 border-t border-white/15 max-w-[40rem]">
              <p className="text-2xl sm:text-[2rem] font-semibold tracking-tight leading-snug">
                {t.capital.close}
              </p>
              <a
                href={MAIL}
                className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-full bg-white text-[#01223F] text-sm font-semibold hover:bg-[#00CDAC] hover:text-white transition-colors"
              >
                {t.cta}
              </a>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}

function SectionLabel({ index, label, light }: { index: string; label: string; light?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${light ? "text-[#00CDAC]" : "text-[#017F80] dark:text-[#00CDAC]"}`}>
      <span className="font-mono tracking-normal">{index}</span>
      <span className="mx-2 opacity-40">/</span>
      {label}
    </p>
  );
}

const de = {
  kicker: "Investoren",
  title: "Eine Generation verlässt den Arbeitsvertrag.",
  titleSecond: "ORIVE ist das Zuhause, das danach kommt.",
  lede: "Einkommen, Körper und Unternehmen lösen sich aus demselben Gehäuse. Dieses Kapital steht in diesem Gesellschaftswechsel — in der Infrastruktur für ein Leben, das frei verdient, reguliert atmet und als Firma handeln kann.",
  cta: "Gespräch beginnen",
  read: "Die Verschiebung lesen",
  navLabel: "Abschnitte",
  nav: [
    { href: "#shift", label: "Verschiebung" },
    { href: "#home", label: "Zuhause" },
    { href: "#market", label: "Markt" },
    { href: "#model", label: "Modell" },
    { href: "#surface", label: "Was steht" },
    { href: "#capital", label: "Kapital" },
  ],
  shift: {
    label: "Die Verschiebung",
    title: "Drei Bewegungen. Ein Leben.",
    body: "Was früher der Arbeitgeber bündelte, fällt gleichzeitig auseinander. Wer das nur als Freelance-Trend, Wellness-Boom oder Gründungs-App liest, sieht drei Märkte. Es ist einer.",
    items: [
      {
        name: "Arbeit",
        line: "Sie gehört der Person.",
        detail: "27,8 Millionen Freelancer in Europa, rund vier Millionen als digitale Nomaden. Der Plattformmarkt für ihre Arbeit wächst von 3,4 auf 9,2 Milliarden US-Dollar.",
      },
      {
        name: "Körper",
        line: "Er wird zur Infrastruktur.",
        detail: "Atem, Klang, Eis und Somatik sind die Regulation einer überreizten Gesellschaft. Facilitators halten diesen Raum — bisher allein, zwischen Chats und verspäteten Überweisungen.",
      },
      {
        name: "Unternehmen",
        line: "Es reist mit der Person.",
        detail: "Wer frei arbeitet, braucht Rechtsform, Konto, Rechnung und eine Adresse, die mitkommt. Gründung war ein Notartermin. Sie wird ein Moment im eigenen Leben.",
      },
    ],
    thesis: "Kapital in ORIVE arbeitet am neuen Gesellschaftsvertrag: frei im Einkommen, reguliert im Körper, handlungsfähig als Unternehmen.",
  },
  home: {
    label: "Das Zuhause",
    title: "Fünf Schichten, ein Vertrag.",
    body: "Der Arbeitsvertrag lieferte Träger, Büro, Kollegen, Orientierung und Geld in einem. ORIVE setzt dieselben Schichten für ein Leben ohne Arbeitgeber wieder zusammen.",
    layers: [
      {
        name: "Rechtsform",
        product: "Formation",
        detail: "Digitale Gründung in Europa — von der EU Inc. bis zu nationalen Formen. Namensprüfung, Satzung, Identitätsprüfung, Register. Festpreise ab 299 €, Bereitstellung in 24 bis 48 Stunden.",
      },
      {
        name: "Betrieb",
        product: "dezk",
        detail: "Der Arbeitsplatz der Praxis: Angebote, Termine, Honorar. Darunter die Firma selbst — Zeit, Aufgaben, Dateien, Freigaben, Rechnungen — damit Praxis und Gesellschaft in einem Raum liegen.",
      },
      {
        name: "Feld",
        product: "Marktplatz",
        detail: "Sessions, Zeremonien, Retreats. Menschen treffen Menschen. Der Beitrag eines einzelnen Angebots reicht weiter als die Stunde: ein beruhigtes Nervensystem verändert den Kreis darum.",
      },
      {
        name: "Orientierung",
        product: "Sofia",
        detail: "Ein Concierge, der Stadt, Thema und den nächsten Termin kennt. Aus dem Deck die Idee eines Führers ins eigene Flow — auf der Seite als konkrete nächste Begegnung gebaut.",
      },
      {
        name: "Geld",
        product: "Finanzen",
        detail: "Rechnung aus geleisteter Zeit, Compliance im Hintergrund, eine Geldbörse für eine Praxis über Grenzen hinweg. Fiat und Krypto gehören zur Richtung des einen Kontos.",
      },
    ],
    sequenceTitle: "Die Schichten folgen einem Leben.",
    sequence: [
      "Ein Mensch sucht Regulation und bucht eine Session.",
      "Der Facilitator, der den Raum hält, braucht Auszahlung, Rechnung, eine Firma.",
      "Die Firma braucht einen Arbeitsplatz, Fristen und ein Konto.",
      "Wer sich reguliert, gründet oft selbst — und kommt zurück, wenn der Körper wieder einen Ort braucht.",
    ],
  },
  market: {
    label: "Der Markt",
    title: "Die Größenordnung des Wechsels.",
    body: "Öffentliche Marktbilder. Sie beschreiben die Gesellschaft, in die ORIVE gebaut wird. Sie sind keine Kennzahlen des Unternehmens.",
    facts: [
      { value: "1,68 Mrd.", label: "Freelancer weltweit" },
      { value: "27,8 Mio.", label: "davon in Europa" },
      { value: "4 Mio.", label: "digitale Nomaden in Europa" },
      { value: "50–90 Tsd. €", label: "Jahreseinkommen dieser Gruppe" },
      { value: "80 %", label: "mit Hochschulabschluss" },
      { value: "70 %", label: "finden Arbeit über Marktplätze" },
      { value: "80 %", label: "zufrieden mit diesem Leben" },
      { value: "46 %", label: "sehen steigende Nachfrage" },
      { value: "+45 %", label: "Freelancer in Europa seit 2000" },
      { value: "15,3 %", label: "Wachstum der Plattformen bis 2026" },
      { value: "61 %", label: "vermissen Gemeinschaft fester Arbeit" },
      { value: "56 %", label: "der Angestellten ziehen es in Betracht" },
    ],
    wellbeing:
      "Parallel liegt der Körper. ORIVE ordnet den europäischen Wellbeing-Markt bis 2027 in der Größenordnung von 1,2 Billionen Euro ein. Atem, Yoga, Klang und Somatik sind der Teil davon, den Menschen halten. 61 Prozent der Freelancer vermissen Gemeinschaft, 88 Prozent der technischen Freelancer suchen mehr Verbindung zu anderen. Der Marktplatz ist die Antwort auf diese Lücke, die Gründung die Antwort auf das Einkommen.",
    source:
      "Marktkontext aus dem ORIVE-Gründungsdeck, gestützt auf öffentlich berichtete Größen zu Freelancing und digitalen Nomaden in Europa, darunter Flatio und ThinkRemote, sowie auf die Entwicklung von Freelance-Plattformen (3,4 Mrd. USD 2020, 9,2 Mrd. USD 2027). Altersbild dieser Nomaden: 44 % Millennials, 23 % Generation X, 21 % Generation Z, 12 % Babyboomer. Die Wellbeing-Größe ist die eigene Einordnung von ORIVE.",
  },
  model: {
    label: "Das Modell",
    title: "Verdient wird in der Reihenfolge des Lebens.",
    body: "ORIVE wächst mit der Firma, die es möglich macht. Der Einstieg kostet nichts. Geld entsteht, wenn aus einer Praxis eine Rechtsform wird — und wenn diese Rechtsform im Alltag bleibt.",
    steps: [
      {
        when: "Heute",
        name: "Begegnung",
        detail: "Der Marktplatz vermittelt Sessions, Events und Retreats. Facilitators starten ohne monatliche Fixgebühr. Partner verdienen bis zu 20 Prozent auf Buchungen, die über ihren Link zustande kommen.",
      },
      {
        when: "Heute",
        name: "Rechtsform",
        detail: "Gründung zu Festpreisen: 299, 599 und 999 Euro. Die höheren Stufen schließen ein Jahr laufende Compliance ein — Fristen und Register, damit die junge Firma tragfähig bleibt.",
      },
      {
        when: "Bindung",
        name: "Arbeitsplatz",
        detail: "dezk ist der Ort nach der Gründung. Angebote, Termine und Honorar bleiben hier. Je vollständiger der Betrieb in diesem Raum liegt, desto selbstverständlicher bleibt die Firma bei ORIVE.",
      },
      {
        when: "Vertiefung",
        name: "Mit der Komplexität",
        detail: "Wenn die Firma wächst, wächst der Vertrag: Umsatzsteuer, Buchhaltung, Mobilität, Non-Dom, Einwanderung. Aus einem Gründungsmoment wird eine jährliche Beziehung. Das ist die Form aus dem Gründungsdeck — Free als Eingang, dann Starter, Pro, Pro Plus.",
      },
    ],
    note: "Frühe Modellrechnungen im Deck zeichnen denselben Trichter bis 2026, mit sehr hohen Umsatzlinien am Ende. Diese Seite wiederholt sie bewusst nicht. Die Form stimmt: kostenloser Eingang, Gründung als erste ernsthafte Conversion, laufende Dienste für einen kleineren Kreis mit höherem Wert. Eine Linie in einem Chart ist keine Zusage.",
  },
  surface: {
    label: "Was steht",
    title: "Die Oberfläche ist öffentlich.",
    body: "Vier Orte sind live und prüfbar. Die tieferen Betriebsschichten — Aufgaben, Zeit, Dateien, Freigaben, automatische Rechnungen, die gemeinsame Geldbörse — sind der Ausbau dieses Zuhauses, kein zweites Unternehmen.",
    stats: [
      { value: "960+", label: "Angebote im öffentlichen Katalog" },
      { value: "39", label: "europäische Hubs" },
      { value: "0 €", label: "monatliche Fixgebühr für Facilitators" },
      { value: "ab 299 €", label: "digitale Gründung, 24–48 Stunden" },
    ],
    links: [
      { href: "/", name: "Marktplatz", detail: "Sessions, Events und Retreats — der Ort, an dem der Körper einen Termin bekommt." },
      { href: "/for-facilitators", name: "Facilitators", detail: "Der Beruf, der den Raum hält, und der Anspruch einer friedlicheren Gesellschaft." },
      { href: "/formation", name: "Formation", detail: "Die Rechtsform, europäisch und digital, inklusive laufender Compliance." },
      { href: "/whatsapp-assistant", name: "Sofia", detail: "Der Concierge für Stadt und Thema — die Orientierungsschicht, schon benutzbar." },
    ],
  },
  capital: {
    label: "Das Kapital",
    title: "Es beschleunigt den Übergang.",
    items: [
      {
        name: "Vertrauen",
        detail: "Register, Identitätsprüfung, Auszahlung, Buchung. Eine Gesellschaft wechselt den Vertrag nur, wenn der neue trägt.",
      },
      {
        name: "Das Feld",
        detail: "Facilitators in Europa auffindbar machen. Regulation, die man buchen kann, in der Stadt, in der jemand gerade ist.",
      },
      {
        name: "Die Rechtsform",
        detail: "Gründung so selbstverständlich wie ein Profil — in jedem Land, das die Formation schon führt.",
      },
      {
        name: "Sofia",
        detail: "Der nächste ehrliche Schritt, in einem Satz: atmen, gründen, abrechnen.",
      },
    ],
    close: "Wer dieses Kapital gibt, finanziert den Ort, an dem eine Generation Einkommen, Körper und Unternehmen wieder in eine Ordnung bringt.",
  },
};

const en = {
  kicker: "Investors",
  title: "A generation is leaving employment.",
  titleSecond: "ORIVE is the home that follows.",
  lede: "Income, body, and company are leaving the same container. This capital stands in that society shift — in the infrastructure for a life that earns freely, breathes in a regulated way, and can act as a company.",
  cta: "Start a conversation",
  read: "Read the shift",
  navLabel: "Sections",
  nav: [
    { href: "#shift", label: "Shift" },
    { href: "#home", label: "Home" },
    { href: "#market", label: "Market" },
    { href: "#model", label: "Model" },
    { href: "#surface", label: "What stands" },
    { href: "#capital", label: "Capital" },
  ],
  shift: {
    label: "The shift",
    title: "Three movements. One life.",
    body: "What employment used to bundle is coming apart at the same time. Read it as a freelance trend, a wellness boom, and a formation app, and you will see three markets. It is one.",
    items: [
      {
        name: "Work",
        line: "It belongs to the person.",
        detail: "27.8 million freelancers in Europe, about four million living as digital nomads. The platform market for their work grows from $3.4 billion to $9.2 billion.",
      },
      {
        name: "Body",
        line: "It becomes infrastructure.",
        detail: "Breath, sound, cold, and somatics are how an overstimulated society regulates. Facilitators hold that room — so far alone, between chats and late wires.",
      },
      {
        name: "Company",
        line: "It travels with the person.",
        detail: "A free working life needs a legal entity, an account, an invoice, and an address that comes along. Formation was an appointment at the notary. It becomes a moment in a life.",
      },
    ],
    thesis: "Capital in ORIVE works on the next social contract: free in income, regulated in the body, capable as a company.",
  },
  home: {
    label: "The home",
    title: "Five layers, one contract.",
    body: "Employment delivered a legal carrier, an office, colleagues, orientation, and money in one bundle. ORIVE rebuilds those layers for a life without an employer.",
    layers: [
      {
        name: "Entity",
        product: "Formation",
        detail: "Digital company formation across Europe — from the EU Inc. to national forms. Name check, articles, identity, register. Fixed prices from €299, ready in 24 to 48 hours.",
      },
      {
        name: "Operations",
        product: "dezk",
        detail: "The workspace of a practice: offerings, dates, fees. Under that, the company itself — time, tasks, files, approvals, invoices — so the practice and the firm share one room.",
      },
      {
        name: "Field",
        product: "Marketplace",
        detail: "Sessions, ceremonies, retreats. People meet people. One offering reaches past the hour: a settled nervous system changes the circle around it.",
      },
      {
        name: "Orientation",
        product: "Sofia",
        detail: "A concierge that knows the city, the subject, and the next date. The deck imagined a guide into a person’s own flow. On the site it is built as the next real encounter.",
      },
      {
        name: "Money",
        product: "Finances",
        detail: "Invoices from time actually worked, compliance in the background, a wallet for a practice that crosses borders. Fiat and crypto sit in the direction of one account.",
      },
    ],
    sequenceTitle: "The layers follow a life.",
    sequence: [
      "A person looks for regulation and books a session.",
      "The facilitator holding the room needs a payout, an invoice, a company.",
      "The company needs a workspace, deadlines, and an account.",
      "A person who regulates often incorporates — and comes back when the body needs a place again.",
    ],
  },
  market: {
    label: "The market",
    title: "The scale of the shift.",
    body: "Public market context. It describes the society ORIVE is built into. These are not company metrics.",
    facts: [
      { value: "1.68bn", label: "Freelancers worldwide" },
      { value: "27.8m", label: "of them in Europe" },
      { value: "4m", label: "digital nomads in Europe" },
      { value: "€50–90k", label: "Annual income of this group" },
      { value: "80%", label: "Hold a degree" },
      { value: "70%", label: "Find work through marketplaces" },
      { value: "80%", label: "Satisfied with this life" },
      { value: "46%", label: "See rising demand for their work" },
      { value: "+45%", label: "Freelancers in Europe since 2000" },
      { value: "15.3%", label: "Platform market growth through 2026" },
      { value: "61%", label: "Miss the community of employment" },
      { value: "56%", label: "Of employees would consider it" },
    ],
    wellbeing:
      "The body sits beside that. ORIVE places the European wellbeing economy on the order of €1.2 trillion by 2027. Breath, yoga, sound, and somatics are the part of it that people hold. 61 percent of freelancers miss community, and 88 percent of technical freelancers want more connection. The marketplace answers that gap. Formation answers the income.",
    source:
      "Market context from the ORIVE founding deck, drawn from publicly reported figures on freelancing and digital nomads in Europe, including Flatio and ThinkRemote, and on freelance platforms ($3.4bn in 2020, $9.2bn in 2027). Age mix of those nomads: 44% millennials, 23% Gen X, 21% Gen Z, 12% boomers. The wellbeing figure is ORIVE’s own framing.",
  },
  model: {
    label: "The model",
    title: "Revenue follows the order of a life.",
    body: "ORIVE grows with the company it makes possible. Entry is free. Money appears when a practice becomes a legal entity — and when that entity stays in daily use.",
    steps: [
      {
        when: "Today",
        name: "Encounter",
        detail: "The marketplace intermediates sessions, events, and retreats. Facilitators start with no monthly fixed fee. Partners earn up to 20 percent on bookings that come through their link.",
      },
      {
        when: "Today",
        name: "Entity",
        detail: "Formation at fixed prices: €299, €599, and €999. The higher tiers include a year of ongoing compliance — deadlines and registers — so the young company can carry itself.",
      },
      {
        when: "Retention",
        name: "Workspace",
        detail: "dezk is the place after formation. Offerings, dates, and fees stay here. The more completely the company runs in this room, the more natural it is that it stays with ORIVE.",
      },
      {
        when: "Depth",
        name: "With complexity",
        detail: "As the company grows, the contract grows: VAT, accounting, mobility, non-dom status, immigration. A formation moment becomes an annual relationship. That is the shape in the founding deck — Free as the door, then Starter, Pro, Pro Plus.",
      },
    ],
    note: "Early model runs in the deck draw the same funnel through 2026, with very high revenue lines at the end. This page deliberately does not repeat them. The shape holds: a free door, formation as the first serious conversion, ongoing services for a smaller circle of higher value. A line on a chart is not a commitment.",
  },
  surface: {
    label: "What stands",
    title: "The surface is public.",
    body: "Four places are live and checkable. The deeper operating layers — tasks, time, files, approvals, automatic invoices, the shared wallet — are the completion of this home, not a second company.",
    stats: [
      { value: "960+", label: "Offerings in the public catalog" },
      { value: "39", label: "European hubs" },
      { value: "€0", label: "Monthly fixed fee for facilitators" },
      { value: "from €299", label: "Digital formation, 24–48 hours" },
    ],
    links: [
      { href: "/", name: "Marketplace", detail: "Sessions, events, and retreats — where the body gets a date." },
      { href: "/for-facilitators", name: "Facilitators", detail: "The profession that holds the room, and the claim of a more peaceful society." },
      { href: "/formation", name: "Formation", detail: "The legal entity, European and digital, including ongoing compliance." },
      { href: "/whatsapp-assistant", name: "Sofia", detail: "The concierge for city and subject — the orientation layer, already usable." },
    ],
  },
  capital: {
    label: "The capital",
    title: "It accelerates the passage.",
    items: [
      {
        name: "Trust",
        detail: "Registers, identity checks, payouts, bookings. A society changes its contract only when the new one holds.",
      },
      {
        name: "The field",
        detail: "Make facilitators in Europe findable. Regulation you can book, in the city where someone actually is.",
      },
      {
        name: "The entity",
        detail: "Formation as ordinary as a profile — in every country the formation flow already carries.",
      },
      {
        name: "Sofia",
        detail: "The next honest step, in one line: breathe, incorporate, invoice.",
      },
    ],
    close: "Capital given here funds the place where a generation brings income, body, and company back into one order.",
  },
};
