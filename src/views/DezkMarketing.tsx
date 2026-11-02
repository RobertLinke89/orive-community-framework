"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { setMetaDescription, setPageTitle } from "@/lib/branding";
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

export default function DezkMarketing() {
  const { language } = useLanguage();
  const isDe = language === "de";
  const t = isDe ? de : en;

  useEffect(() => {
    setPageTitle("ORIVE dezk");
    setMetaDescription(t.meta);
  }, [isDe, t.meta]);

  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* Hero */}
        <header className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/10">
          <img
            src="/facilitators/motif-still.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#01223F]/88 via-[#01223F]/92 to-[#011B33]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,205,172,0.18), transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-[1120px] px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#00CDAC]">
              ORIVE dezk
            </p>
            <h1 className="mt-5 max-w-[16ch] text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-semibold tracking-[-0.035em] leading-[1.02] text-white">
              {t.hero.title}
            </h1>
            <p className="mt-7 max-w-[36rem] text-lg sm:text-xl leading-relaxed text-white/65">
              {t.hero.lede}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <Link
                href="/auth?mode=facilitator&returnUrl=/dezk"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#00CDAC] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#02AAB0]"
              >
                {t.hero.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#operate"
                className="text-sm font-semibold text-white/70 transition hover:text-white"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>
        </header>

        {/* 01 — Operate */}
        <section id="operate" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="mx-auto max-w-[1120px] px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="01" label={t.operate.label} />
            <h2 className="mt-4 max-w-[22ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.operate.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.operate.body}
            </p>
            <div className="mt-14 divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-white/10 dark:border-white/10">
              {t.operate.items.map((item) => (
                <div
                  key={item.title}
                  className="grid grid-cols-1 gap-2 py-7 sm:grid-cols-[12rem_1fr] sm:gap-8"
                >
                  <p className="text-sm font-semibold text-[#01223F] dark:text-white">{item.title}</p>
                  <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 — Flow */}
        <section
          id="flow"
          className="scroll-mt-28 border-b border-slate-200/80 bg-[#F7F7F7] dark:border-white/10 dark:bg-[#02182B]"
        >
          <div className="mx-auto max-w-[1120px] px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="02" label={t.flow.label} />
            <h2 className="mt-4 max-w-[20ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.flow.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.flow.body}
            </p>
            <ol className="mt-12 space-y-0 border-t border-slate-200/80 dark:border-white/10">
              {t.flow.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="grid grid-cols-1 gap-2 border-b border-slate-200/80 py-7 md:grid-cols-[7rem_1fr] md:gap-10 dark:border-white/10"
                >
                  <p className="pt-1 font-mono text-xs text-[#017F80] dark:text-[#00CDAC]">
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

        {/* 03 — Reach */}
        <section id="reach" className="scroll-mt-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="mx-auto max-w-[1120px] px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="03" label={t.reach.label} />
            <h2 className="mt-4 max-w-[22ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.reach.title}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.reach.body}
            </p>
            <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
              {t.reach.points.map((point) => (
                <div key={point.title}>
                  <p className="text-lg font-semibold tracking-tight text-[#01223F] dark:text-white">
                    {point.title}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {point.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — Start */}
        <section id="start" className="scroll-mt-28">
          <div className="mx-auto max-w-[1120px] px-5 sm:px-8 py-16 sm:py-24">
            <SectionLabel index="04" label={t.start.label} />
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {t.start.title}
            </h2>
            <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {t.start.body}
            </p>
            <ul className="mt-10 max-w-[28rem] space-y-3">
              {t.start.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00CDAC]" />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth?mode=facilitator&returnUrl=/dezk"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#00CDAC] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#02AAB0]"
              >
                {t.start.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-facilitators"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#01223F] dark:text-slate-300 dark:hover:text-white"
              >
                {t.start.secondary}
              </Link>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}

const de = {
  meta: "ORIVE dezk — der Arbeitsraum für Facilitators: Workspace, Angebote, Termine, Gäste, Intake und Stripe-Auszahlung an einem Ort.",
  hero: {
    title: "Dein Betrieb. Ein Raum.",
    lede: "dezk ist der Facilitator-Arbeitsplatz auf ORIVE — Workspace planen, Angebote führen, Termine setzen, Gäste und Intake sehen, Auszahlung über Stripe. Ohne monatliche Fixgebühr.",
    cta: "dezk öffnen",
    secondary: "So arbeitet dezk",
  },
  operate: {
    label: "Der Raum",
    title: "Alles, was den Tag trägt — an einem Ort.",
    body: "Kein Flickenteppich aus Tabellen, DMs und Zahlungslinks. dezk hält Angebot, Kalender, Suchende und Zahlung in einem klaren Betrieb.",
    items: [
      {
        title: "Heute & Kalender",
        detail: "Was läuft, was kommt, wo Kapazität frei ist — ohne zwischen Tools zu springen.",
      },
      {
        title: "Workspace",
        detail: "Kanban, Boards und Timer aus dem ORYVE Desktop — Prep und Follow-ups im selben Raum wie Termine und Angebote.",
      },
      {
        title: "Angebote & Termine",
        detail: "Formate anlegen, Daten veröffentlichen, Storno und Kapazität steuern.",
      },
      {
        title: "Gäste & Intake",
        detail: "Wer kommt, was sie mitbringen, was du vor der Session wissen musst.",
      },
      {
        title: "Zahlung & Stripe",
        detail: "Bei ORIVE-Buchungen zahlt der Gast über Stripe — Auszahlung landet bei dir.",
      },
    ],
  },
  flow: {
    label: "Ablauf",
    title: "Vom Angebot zur Auszahlung.",
    body: "Vier Schritte. Kein CRM. Kein zweites Backend. Der Alltag eines Facilitators — verdichtet.",
    steps: [
      {
        title: "Angebot anlegen",
        detail: "Breathwork, Yoga, 1:1, Retreat — klar benannt, mit Dauer und Preis.",
      },
      {
        title: "Termin setzen",
        detail: "Datum, Ort oder Online, Kapazität. Sichtbar für Suchende auf dem Marktplatz.",
      },
      {
        title: "Gäste begleiten",
        detail: "Buchungen, Intake und Profil auf einen Blick — vor und nach der Session.",
      },
      {
        title: "Auszahlung erhalten",
        detail: "Stripe Connect für ORIVE-Buchungen. Transparent, ohne Abo-Druck.",
      },
    ],
  },
  reach: {
    label: "Reichweite",
    title: "Gebaut für den europaweiten Marktplatz.",
    body: "dezk ist nicht nur Verwaltung — es ist der Ort, an dem dein Profil Nachfrage trifft. Ein Arbeitsraum, der mit dem ORIVE-Marktplatz zusammenhängt.",
    points: [
      {
        title: "Europa",
        detail: "Suchende finden dich über Stadt, Praxis und Termin — nicht nur über dein Netzwerk.",
      },
      {
        title: "Klarheit",
        detail: "Ein Profil, sichtbare Termine, verbindliche Buchung. Weniger Hin und Her.",
      },
      {
        title: "0 € Fix",
        detail: "Keine monatliche Gebühr für den Arbeitsraum. Du zahlst über den Buchungsfluss.",
      },
    ],
  },
  start: {
    label: "Start",
    title: "Heute öffnen. Morgen führen.",
    body: "Claim dein Profil, verbinde Stripe, setze den ersten Termin. dezk ist bereit, wenn du es bist.",
    bullets: [
      "Kostenlos starten — kein Abo",
      "Stripe für ORIVE-Buchungen",
      "Direkt in den Arbeitsraum",
    ],
    cta: "Kostenlos starten",
    secondary: "Mehr für Facilitators →",
  },
};

const en = {
  meta: "ORIVE dezk — the facilitator workspace: boards, offerings, dates, guests, intake, and Stripe payout in one place.",
  hero: {
    title: "Your practice. One room.",
    lede: "dezk is the facilitator workspace on ORIVE — plan in Workspace, run offerings, set dates, see guests and intake, get paid through Stripe. No monthly fixed fee.",
    cta: "Open dezk",
    secondary: "How dezk works",
  },
  operate: {
    label: "The room",
    title: "Everything that carries the day — in one place.",
    body: "No patchwork of spreadsheets, DMs, and payment links. dezk keeps offerings, calendar, seekers, and payout in one clear operation.",
    items: [
      {
        title: "Today & calendar",
        detail: "What’s live, what’s next, where capacity is open — without jumping between tools.",
      },
      {
        title: "Workspace",
        detail: "Kanban, boards, and timer from ORYVE Desktop — prep and follow-ups in the same room as dates and offerings.",
      },
      {
        title: "Offerings & dates",
        detail: "Create formats, publish dates, manage capacity and cancellation.",
      },
      {
        title: "Guests & intake",
        detail: "Who’s coming, what they bring, what you need before the session.",
      },
      {
        title: "Payment & Stripe",
        detail: "On ORIVE bookings, guests pay through Stripe — payout lands with you.",
      },
    ],
  },
  flow: {
    label: "Flow",
    title: "From offering to payout.",
    body: "Four steps. No CRM. No second backend. The facilitator’s day — distilled.",
    steps: [
      {
        title: "Create an offering",
        detail: "Breathwork, yoga, 1:1, retreat — clearly named, with duration and price.",
      },
      {
        title: "Set a date",
        detail: "Time, place or online, capacity. Visible to seekers on the marketplace.",
      },
      {
        title: "Host your guests",
        detail: "Bookings, intake, and profile at a glance — before and after the session.",
      },
      {
        title: "Receive payout",
        detail: "Stripe Connect for ORIVE bookings. Transparent, without subscription pressure.",
      },
    ],
  },
  reach: {
    label: "Reach",
    title: "Built for the Europe-wide marketplace.",
    body: "dezk is not only operations — it’s where your profile meets demand. A workspace wired into the ORIVE marketplace.",
    points: [
      {
        title: "Europe",
        detail: "Seekers find you by city, practice, and date — not only through your network.",
      },
      {
        title: "Clarity",
        detail: "One profile, visible dates, binding booking. Less back-and-forth.",
      },
      {
        title: "€0 fixed",
        detail: "No monthly fee for the workspace. You earn through the booking flow.",
      },
    ],
  },
  start: {
    label: "Start",
    title: "Open today. Run tomorrow.",
    body: "Claim your profile, connect Stripe, publish the first date. dezk is ready when you are.",
    bullets: [
      "Start free — no subscription",
      "Stripe for ORIVE bookings",
      "Straight into the workspace",
    ],
    cta: "Get started free",
    secondary: "More for facilitators →",
  },
};
