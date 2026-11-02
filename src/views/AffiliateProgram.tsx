"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80] dark:text-[#00CDAC]">
      <span className="font-mono tracking-normal">{index}</span>
      <span className="mx-2 text-slate-300 dark:text-white/20">·</span>
      {label}
    </p>
  );
}

const FIELD =
  "w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-background text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00CDAC]/35";

export function AffiliateProgramView() {
  const { language } = useLanguage();
  const isDe = language === "de";
  const t = isDe ? de : en;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    partnerType: "creator",
    audienceSize: "< 5.000",
    message: "",
  });
  const [estimatedBookings, setEstimatedBookings] = useState(15);
  const monthlyEarnings = Math.round(estimatedBookings * 120 * 0.15);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormSubmitted(true);
  };

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
                href="#apply"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold transition-colors"
              >
                {t.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#01223F] dark:hover:text-white"
              >
                {t.read}
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              {t.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[1.65rem] sm:text-[2rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                    {fact.value}
                  </dt>
                  <dd className="mt-3 text-sm leading-snug text-slate-600 dark:text-slate-300">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <section id="why" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="01" label={t.why.label} />
            <h2 className="mt-4 max-w-[22ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.why.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.why.body}
            </p>

            <div className="mt-14 divide-y divide-slate-200/80 dark:divide-white/10 border-y border-slate-200/80 dark:border-white/10">
              {t.why.items.map((item) => (
                <div
                  key={item.title}
                  className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-2 sm:gap-8 py-7"
                >
                  <p className="text-sm font-semibold text-[#01223F] dark:text-white">{item.title}</p>
                  <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B]"
        >
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="02" label={t.how.label} />
            <h2 className="mt-4 max-w-[20ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.how.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.how.body}
            </p>

            <ol className="mt-12 space-y-0 border-t border-slate-200/80 dark:border-white/10">
              {t.how.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="grid grid-cols-1 md:grid-cols-[7rem_1fr] gap-2 md:gap-10 py-7 border-b border-slate-200/80 dark:border-white/10"
                >
                  <p className="font-mono text-xs text-[#017F80] dark:text-[#00CDAC] pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="earn" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="03" label={t.earn.label} />
            <h2 className="mt-4 max-w-[20ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.earn.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.earn.body}
            </p>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.earn.slider}</span>
                  <span className="font-semibold tabular-nums text-[#017F80] dark:text-[#00CDAC]">
                    {estimatedBookings} {t.earn.bookings}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={100}
                  step={1}
                  value={estimatedBookings}
                  onChange={(event) => setEstimatedBookings(Number(event.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00CDAC]"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>2</span>
                  <span>50</span>
                  <span>100+</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">{t.earn.note}</p>
              </div>

              <div className="lg:col-span-5 border border-slate-200/80 dark:border-white/10 p-8 sm:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t.earn.result}
                </p>
                <p className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-[#01223F] dark:text-white tabular-nums">
                  ~{monthlyEarnings} €
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {t.earn.perMonth} · {monthlyEarnings * 12} € {t.earn.perYear}
                </p>
                <a
                  href="#apply"
                  className="mt-8 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#01223F] dark:bg-white text-white dark:text-[#01223F] text-sm font-semibold hover:bg-[#017F80] dark:hover:bg-[#00CDAC] transition-colors"
                >
                  {t.earn.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="who"
          className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B]"
        >
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="04" label={t.who.label} />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.who.title}
            </h2>

            <ol className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
              {t.who.items.map((item) => (
                <li key={item.title} className="bg-background p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80] dark:text-[#00CDAC]">
                    {item.title}
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="apply" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5">
                <SectionLabel index="05" label={t.apply.label} />
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
                  {t.apply.title}
                </h2>
                <p className="mt-6 text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
                  {t.apply.body}
                </p>
                <p className="mt-6 text-sm text-slate-500">
                  {t.apply.terms}{" "}
                  <Link
                    href="/partner-terms"
                    className="text-[#01223F] dark:text-white underline underline-offset-4"
                  >
                    {t.apply.termsLink}
                  </Link>
                  .
                </p>
              </div>

              <div className="lg:col-span-7">
                {formSubmitted ? (
                  <div className="border border-slate-200/80 dark:border-white/10 p-8 sm:p-10">
                    <CheckCircle2 className="w-8 h-8 text-[#00CDAC]" />
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white">
                      {t.apply.successTitle}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {t.apply.successBody}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="mt-8 text-sm font-semibold text-[#01223F] dark:text-white hover:opacity-70"
                    >
                      {t.apply.again}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {t.apply.name}
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                          className={FIELD}
                          placeholder={t.apply.namePh}
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {t.apply.email}
                        </span>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                          className={FIELD}
                          placeholder={t.apply.emailPh}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {t.apply.website}
                        </span>
                        <input
                          type="url"
                          required
                          value={formData.website}
                          onChange={(event) => setFormData({ ...formData, website: event.target.value })}
                          className={FIELD}
                          placeholder={t.apply.websitePh}
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {t.apply.type}
                        </span>
                        <select
                          value={formData.partnerType}
                          onChange={(event) => setFormData({ ...formData, partnerType: event.target.value })}
                          className={FIELD}
                        >
                          {t.apply.types.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {t.apply.reach}
                      </span>
                      <select
                        value={formData.audienceSize}
                        onChange={(event) => setFormData({ ...formData, audienceSize: event.target.value })}
                        className={FIELD}
                      >
                        {t.apply.reaches.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {t.apply.message}
                      </span>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                        className={`${FIELD} h-auto py-3 resize-none`}
                        placeholder={t.apply.messagePh}
                      />
                    </label>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold transition-colors"
                    >
                      {t.apply.submit}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:pb-28 sm:pt-24">
            <SectionLabel index="06" label={t.faq.label} />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.faq.title}
            </h2>

            <div className="mt-12 divide-y divide-slate-200/80 dark:divide-white/10 border-y border-slate-200/80 dark:border-white/10">
              {t.faq.items.map((item) => (
                <div key={item.q} className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-3 md:gap-10 py-7">
                  <h3 className="text-sm font-semibold text-[#01223F] dark:text-white leading-snug">{item.q}</h3>
                  <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}

const de = {
  kicker: "Partner & Affiliate",
  title: "Empfehlen.",
  titleSecond: "Verdienen.",
  lede:
    "Verbinde Community, Website oder Studio mit Facilitators für Breathwork, Coaching, Somatics und Retreats — und erhalte bis zu 20 % Provision auf vermittelte Buchungen.",
  cta: "Partner werden",
  read: "So funktioniert es",
  facts: [
    { value: "Bis 20 %", label: "Provision pro Buchung" },
    { value: "60 Tage", label: "Cookie-Attribution" },
    { value: "Monatlich", label: "Auszahlung per SEPA / Stripe" },
    { value: "Europa", label: "Sessions, Events, Retreats" },
  ],
  why: {
    label: "Warum",
    title: "Ein Partnerprogramm für Qualität, nicht für Klickvolumen.",
    body: "Für Studios, Publisher, Creator und Plattformen, die Empfehlungen ernst nehmen — und ihre Community nicht mit Beliebigkeit abspeisen.",
    items: [
      {
        title: "High-Ticket Provision",
        detail:
          "Nicht nur Einzelsessions: auch Workshops und Retreats (oft 650–1.200 €). Bis zu 150 €+ pro vermittelter Buchung sind realistisch.",
      },
      {
        title: "Kuratierte Qualität",
        detail:
          "Facilitators auf ORIVE werden auf Erfahrung und Angebot geprüft. Du empfiehlst Termine mit Substanz.",
      },
      {
        title: "Links, Widgets, API",
        detail:
          "Tracking-Links für Newsletter und Social, Einbettungen für die Website, REST-API für größere Partner.",
      },
    ],
  },
  how: {
    label: "Ablauf",
    title: "Drei Schritte. Danach läuft es.",
    body: "Unkompliziert, transparent, ohne monatliche Gebühr für dich.",
    steps: [
      {
        title: "Kostenlos bewerben",
        detail: "Kurzes Formular. Nach Freigabe erhältst du Zugang zum Partner-Dashboard.",
      },
      {
        title: "Empfehlen & einbinden",
        detail: "Teile Links, verlinke Sessions oder binde Widgets in Blog und Newsletter ein.",
      },
      {
        title: "Monatlich auszahlen lassen",
        detail: "Jede Buchung im 60-Tage-Fenster wird verbucht und per SEPA oder Stripe ausgezahlt.",
      },
    ],
  },
  earn: {
    label: "Rechnung",
    title: "Was ist realistisch?",
    body: "Schätzung auf Basis von 120 € Durchschnittsbuchung und 15 % Provision. Keine Garantie — die Rate steht in deiner Partnervereinbarung.",
    slider: "Vermittelte Buchungen / Monat",
    bookings: "Buchungen",
    note: "Rechenbeispiel. Öffentliche Werte sind Schätzungen, keine Zusage.",
    result: "Geschätzte Provision",
    perMonth: "pro Monat",
    perYear: "/ Jahr",
    cta: "Jetzt bewerben",
  },
  who: {
    label: "Für wen",
    title: "Wer hier gut aufgehoben ist.",
    items: [
      {
        title: "Creator",
        detail: "Yoga, Breathwork, Mindset und Biohacking auf Instagram, YouTube, TikTok und Podcast.",
      },
      {
        title: "Websites & Magazine",
        detail: "Health-, Reise- und Lifestyle-Publisher mit gesundheitsbewusster Leserschaft.",
      },
      {
        title: "Studios & Academies",
        detail: "Schulen, die Absolventen und Schülerinnen kuratierte Sessions empfehlen.",
      },
      {
        title: "B2B & Consultants",
        detail: "Betriebliche Gesundheit, HR und Coaches, die Klienten Termine vermitteln.",
      },
    ],
  },
  apply: {
    label: "Bewerbung",
    title: "Offizieller ORIVE Partner werden.",
    body: "Unter zwei Minuten. Wir prüfen innerhalb von 24 Stunden.",
    terms: "Mit dem Absenden akzeptierst du die",
    termsLink: "Partnerbedingungen",
    successTitle: "Bewerbung eingegangen.",
    successBody: "Wir melden uns mit Zugangsdaten und deinen Partnerlinks.",
    again: "Weitere Bewerbung",
    name: "Name",
    namePh: "Sarah Meier",
    email: "E-Mail",
    emailPh: "sarah@domain.de",
    website: "Website oder Social",
    websitePh: "https://instagram.com/…",
    type: "Partnertyp",
    types: [
      { value: "creator", label: "Creator / Influencer" },
      { value: "publisher", label: "Website / Blog / Magazin" },
      { value: "studio", label: "Studio / Schule / Academy" },
      { value: "platform", label: "Plattform / Software" },
      { value: "corporate", label: "B2B / Corporate Health" },
    ],
    reach: "Reichweite / Monat",
    reaches: ["< 5.000", "5.000 - 25.000", "25.000 - 100.000", "> 100.000"],
    message: "Nachricht (optional)",
    messagePh: "Newsletter, Blog-Review, Studio-Empfehlung…",
    submit: "Bewerbung absenden",
  },
  faq: {
    label: "FAQ",
    title: "Kurz beantwortet.",
    items: [
      {
        q: "Wie funktioniert das Tracking?",
        a: "Über deinen Partnerlink oder dein Widget wird ein Cookie mit 60 Tagen Laufzeit gesetzt. Buchungen in diesem Fenster werden dir zugeordnet.",
      },
      {
        q: "Wann kommt die Auszahlung?",
        a: "Monatlich für den Vormonat, ab 50 € Guthaben, per SEPA oder Stripe Connect — mit PDF-Abrechnung.",
      },
      {
        q: "Kostet die Teilnahme etwas?",
        a: "Nein. Keine Gebühr, keine Mindestlaufzeit.",
      },
      {
        q: "Gibt es eine API?",
        a: "Ja. Für größere Partner: REST-API und einbettbare Widgets.",
      },
    ],
  },
};

const en: typeof de = {
  kicker: "Partners & affiliates",
  title: "Refer.",
  titleSecond: "Earn.",
  lede:
    "Connect your community, site or studio with facilitators for breathwork, coaching, somatics and retreats — and earn up to 20% commission on referred bookings.",
  cta: "Become a partner",
  read: "How it works",
  facts: [
    { value: "Up to 20%", label: "Commission per booking" },
    { value: "60 days", label: "Cookie attribution" },
    { value: "Monthly", label: "Payout via SEPA / Stripe" },
    { value: "Europe", label: "Sessions, events, retreats" },
  ],
  why: {
    label: "Why",
    title: "A partner programme built for trust, not click farms.",
    body: "For studios, publishers, creators and platforms that recommend with care — and refuse to spam their audience.",
    items: [
      {
        title: "High-ticket commission",
        detail:
          "Not only 1:1 sessions: workshops and retreats (often €650–1,200). €150+ per referred booking is realistic.",
      },
      {
        title: "Curated quality",
        detail: "Facilitators on ORIVE are reviewed for experience and offering. You recommend dates with substance.",
      },
      {
        title: "Links, widgets, API",
        detail: "Tracking links for newsletter and social, embeds for your site, REST API for larger partners.",
      },
    ],
  },
  how: {
    label: "Flow",
    title: "Three steps. Then it runs.",
    body: "Straightforward, transparent, no monthly fee for you.",
    steps: [
      {
        title: "Apply free",
        detail: "Short form. After approval you get partner dashboard access.",
      },
      {
        title: "Share & embed",
        detail: "Share links, point to sessions, or embed widgets in blog and newsletter.",
      },
      {
        title: "Get paid monthly",
        detail: "Every booking in the 60-day window is logged and paid by SEPA or Stripe.",
      },
    ],
  },
  earn: {
    label: "Estimate",
    title: "What is realistic?",
    body: "Estimate based on a €120 average booking and 15% commission. Not a guarantee — your rate is in the partner agreement.",
    slider: "Referred bookings / month",
    bookings: "bookings",
    note: "Worked example. Public figures are estimates, not a promise.",
    result: "Estimated commission",
    perMonth: "per month",
    perYear: "/ year",
    cta: "Apply now",
  },
  who: {
    label: "Who",
    title: "Who this fits.",
    items: [
      {
        title: "Creators",
        detail: "Yoga, breathwork, mindset and biohacking on Instagram, YouTube, TikTok and podcasts.",
      },
      {
        title: "Sites & magazines",
        detail: "Health, travel and lifestyle publishers with an intentional audience.",
      },
      {
        title: "Studios & academies",
        detail: "Schools recommending curated sessions to graduates and students.",
      },
      {
        title: "B2B & consultants",
        detail: "Workplace health, HR and coaches referring clients to real dates.",
      },
    ],
  },
  apply: {
    label: "Apply",
    title: "Become an official ORIVE partner.",
    body: "Under two minutes. We review within 24 hours.",
    terms: "By submitting you accept the",
    termsLink: "partner terms",
    successTitle: "Application received.",
    successBody: "We will follow up with access and your partner links.",
    again: "Send another application",
    name: "Name",
    namePh: "Sarah Meier",
    email: "Email",
    emailPh: "sarah@domain.com",
    website: "Website or social",
    websitePh: "https://instagram.com/…",
    type: "Partner type",
    types: [
      { value: "creator", label: "Creator / influencer" },
      { value: "publisher", label: "Website / blog / magazine" },
      { value: "studio", label: "Studio / school / academy" },
      { value: "platform", label: "Platform / software" },
      { value: "corporate", label: "B2B / corporate health" },
    ],
    reach: "Reach / month",
    reaches: ["< 5.000", "5.000 - 25.000", "25.000 - 100.000", "> 100.000"],
    message: "Message (optional)",
    messagePh: "Newsletter, blog review, studio referral…",
    submit: "Submit application",
  },
  faq: {
    label: "FAQ",
    title: "Short answers.",
    items: [
      {
        q: "How does tracking work?",
        a: "Your partner link or widget sets a 60-day cookie. Bookings in that window are attributed to you.",
      },
      {
        q: "When do I get paid?",
        a: "Monthly for the previous month, from €50 balance, via SEPA or Stripe Connect — with a PDF statement.",
      },
      {
        q: "Does it cost anything?",
        a: "No. No fee, no minimum term.",
      },
      {
        q: "Is there an API?",
        a: "Yes. For larger partners: REST API and embeddable widgets.",
      },
    ],
  },
};
