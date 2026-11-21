"use client";

import Link from 'next/link';
import { Layout } from "@/components/Layout";
import { EuropeFacilitatorMap } from "@/components/EuropeFacilitatorMap";
import { ArrowRight, Search, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

// Honest About page: no unverifiable market numbers, no "verified"/"guarantee" claims.
const About = () => {
  const { copy } = useLanguage();
  const points = [
    { icon: Search, t: copy("Ein Verzeichnis für ganz Europa", "One directory for all of Europe"), d: copy("Breathwork, Yoga, Eisbaden, Sound Healing, Coaching, Körperarbeit und mehr – Facilitators und ihre Angebote an einem Ort.", "Breathwork, yoga, ice bathing, sound healing, coaching, bodywork and more – facilitators and their offers in one place.") },
    { icon: Sparkles, t: copy("KI-Suche in deinen Worten", "AI search in your own words"), d: copy("Beschreib, was du suchst – etwa „Eisbaden in Hamburg am Wochenende“ – und die Suche findet passende Profile und Termine.", "Describe what you are looking for – e.g. “ice bathing in Hamburg this weekend” – and the search finds matching profiles and dates.") },
    { icon: MapPin, t: copy("Echte Angebote mit Ort und Preis", "Real offers with place and price"), d: copy("Wir zeigen die Angaben der Anbieter und verlinken auf das Original. Gebucht wird beim Anbieter oder – wo angegeben – direkt über ORIVE.", "We show the providers' own details and link to the original. You book with the provider or – where stated – directly via ORIVE.") },
    { icon: ShieldCheck, t: copy("Transparent für Facilitators", "Transparent for facilitators"), d: copy("Facilitators können ihr Profil übernehmen, korrigieren oder jederzeit entfernen lassen.", "Facilitators can claim, correct or remove their profile at any time.") },
  ];
  return <Layout>
      <div className="relative w-full overflow-hidden border-b border-slate-200/90 bg-gradient-to-b from-[#EBF7F5] via-[#F3FAF8] to-[#F8FAFC] dark:border-white/10 dark:from-[#02182E] dark:via-[#01223F] dark:to-[#011B33] -mt-16 pt-16">
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-[#01223F] dark:text-white sm:text-5xl">
            {copy("Über ", "About ")}<span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">ORIVE</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-600 dark:text-white/70">
            {copy("Wir machen es einfach, die passende Begleitung für Körper, Atem und Geist zu finden – in deiner Stadt oder auf Reisen.", "We make it easy to find the right guidance for body, breath and mind – in your city or while travelling.")}
          </p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] py-16 dark:bg-[#011B33] sm:py-20">
        <div className="mx-auto max-w-3xl space-y-5 px-6 text-base leading-relaxed text-slate-600 dark:text-white/70 lg:px-8">
          <h2 className="text-xl font-semibold text-[#01223F] dark:text-white">{copy("Warum es ORIVE gibt", "Why ORIVE exists")}</h2>
          <p>{copy(
            "Immer mehr Menschen suchen Wege, mit Stress, Schlaf und Gesundheit bewusster umzugehen: Atemarbeit, Meditation, Kälte, Klang, Bewegung. Die Angebote dafür sind verstreut – auf unzähligen Websites, Instagram-Profilen und Ticketportalen.",
            "More and more people look for conscious ways to deal with stress, sleep and health: breathwork, meditation, cold, sound, movement. The offers are scattered across countless websites, Instagram profiles and ticket platforms."
          )}</p>
          <p>{copy(
            "ORIVE bündelt sie: ein europäisches Verzeichnis von Facilitators und ihren Sessions, Workshops und Retreats – durchsuchbar nach Ort, Praxis und Termin.",
            "ORIVE brings them together: a European directory of facilitators and their sessions, workshops and retreats – searchable by place, practice and date."
          )}</p>
        </div>

        <div className="mx-auto mt-14 max-w-7xl border-t border-slate-200/80 px-6 pt-12 dark:border-white/10 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">{copy("Für Suchende", "For seekers")}</p>
              <h2 className="mb-8 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#01223F] dark:text-white lg:text-4xl">
                {copy("So findest du die passende Begleitung", "How to find the right guidance")}
              </h2>
              <div className="space-y-6">
                {points.map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#00CDAC]/25 bg-[#00CDAC]/10">
                      <Icon className="h-4 w-4 text-[#00A88E]" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-[#01223F] dark:text-white">{t}</h3>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-8 rounded-full bg-[#00CDAC] text-white hover:bg-[#02AAB0]" asChild>
                <Link href="/facilitators">
                  {copy("Facilitators entdecken", "Discover facilitators")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="-mx-2 sm:mx-0 lg:col-span-8">
              <EuropeFacilitatorMap />
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default About;
