"use client";

import Link from 'next/link';
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { setMetaDescription, setPageTitle } from "@/lib/branding";
import { 
  ArrowRight, 
  ArrowDown,
  CheckCircle2,
  Heart,
  Target,
  Globe,
  Sparkles,
  Building2,
  FileCheck,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ForFacilitators() {
  const { language, copy } = useLanguage();
  const isDe = language === 'de';

  useEffect(() => {
    setPageTitle(copy("Für Facilitators", "For facilitators"));
    setMetaDescription(
      copy("Angebote, Termine und Zahlung an einem Ort. Keine monatliche Gebühr. Bei ORIVE-Buchungen zahlt der Gast über Stripe.", "List sessions, events and retreats on ORIVE. No monthly fee. Guests pay through Stripe when a listing is booked on ORIVE.")
    );
  }, [isDe]);

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-[#00CDAC]/20">
        
        {/* ========================================================================= */}
        {/* 1. HERO / STORY HOOK                                                      */}
        {/* ========================================================================= */}
        <section className="relative pt-24 pb-32 sm:pt-36 sm:pb-48 overflow-hidden border-b border-slate-200/80 dark:border-white/10">
          <img
            src="/for-facilitators-hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/78 to-background pointer-events-none dark:from-[#01223F]/88 dark:via-[#01223F]/92 dark:to-background" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#01223F] dark:text-white leading-[1.08] mb-8 max-w-4xl [filter:drop-shadow(0_0_12px_rgba(255,255,255,0.95))_drop-shadow(0_0_3px_white)] dark:[filter:none]">
              {isDe ? (
                <>
                  Europa{" "}
                  <span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">
                    wandelt
                  </span>{" "}
                  sich.
                  <span className="block mt-2">Werde Teil der Facilitator-Bewegung.</span>
                </>
              ) : (
                <>
                  Europe is{" "}
                  <span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">
                    shifting.
                  </span>
                  <span className="block mt-2">Join the facilitator movement.</span>
                </>
              )}
            </h1>

            {/* Subheadline: Market Change / Tech Progress context */}
            <p className="text-base sm:text-lg text-slate-700 dark:text-white/70 font-normal leading-relaxed max-w-2xl mx-auto mb-10 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.95))] dark:[filter:none]">
              {copy("Künstliche Intelligenz, Hyper-Digitalisierung und ständige Reizüberflutung verändern die menschliche Psyche fundamental. Menschen sehnen sich nicht nach noch mehr Technologie — sie suchen nach echter somatischer Erdung, Atem, Klang und menschlichem Frieden.", "Artificial intelligence, hyper-digitalization, and perpetual sensory overload are fundamentally transforming human needs. People don't yearn for more screens — they seek somatic grounding, breath, sound, and true human peace.")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth?mode=facilitator"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold tracking-normal shadow-sm shadow-[#00CDAC]/25 transition-colors"
              >
                {copy("Kostenlos starten", "Get started free")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#story"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white border border-slate-200 text-[#01223F] text-sm font-semibold tracking-normal hover:bg-slate-50 transition-colors dark:bg-white/10 dark:border-white/15 dark:text-white dark:hover:bg-white/15"
              >
                {copy("Mehr erfahren", "Learn more")}
                <ArrowDown className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full rounded-2xl bg-white/85 dark:bg-[#01223F]/80 backdrop-blur-md border border-white/70 dark:border-white/10 px-4 py-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#01223F] dark:text-white">0 €</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{copy("Monatliche Fixgebühr", "Monthly fixed fee")}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#00CDAC]">Stripe</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{copy("Zahlung bei ORIVE-Buchungen", "Payment on ORIVE bookings")}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#01223F] dark:text-white">{copy("Ohne Karte", "No card")}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{copy("für die Registrierung", "to create an account")}</div>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 1b. WHAT IS A FACILITATOR                                                 */}
        {/* ========================================================================= */}
        <section id="what" className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
                  {copy("Facilitators", "Facilitators")}
                </p>
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
                  {copy("Was ist ein Facilitator?", "What is a Facilitator?")}
                </h2>
                <div className="mt-6 space-y-4 text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
                  <p>
                    {copy(
                      "Ein Facilitator ist ein Guide, der transformative Erfahrungen für Einzelne und Gruppen schafft — mit Modalitäten wie Breathwork, Meditation, Bewegung, Wellness und persönlicher Entwicklung.",
                      "A facilitator is a guide who creates transformative experiences for individuals and groups. They specialize in various modalities including breathwork, meditation, movement, wellness practices, and personal development."
                    )}
                  </p>
                  <p>
                    {copy(
                      "Anders als klassische Trainer halten Facilitators den Raum, damit Teilnehmende eigene Erkenntnisse und Heilung finden. Sie schaffen sichere Umfelder, in denen Wachstum natürlich entfaltet.",
                      "Unlike traditional instructors, facilitators hold space for participants to discover their own insights and healing. They create safe, supportive environments where growth and transformation can naturally unfold."
                    )}
                  </p>
                  <p>
                    {copy(
                      "Ob Workshop, Retreat oder 1:1-Session — Facilitators sind Katalysatoren für Veränderung und helfen Menschen, wieder bei sich und ihrem Zweck anzukommen.",
                      "Whether leading workshops, retreats, or one-on-one sessions, facilitators serve as catalysts for change, helping people reconnect with themselves and their purpose."
                    )}
                  </p>
                </div>
              </div>

              <ol className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
                {[
                  {
                    n: "01",
                    icon: Heart,
                    title: copy("Wellness", "Wellness"),
                    body: copy(
                      "Breathwork, Meditation, Yoga und ganzheitliche Praktiken",
                      "Breathwork, meditation, yoga, and holistic practices"
                    ),
                  },
                  {
                    n: "02",
                    icon: Target,
                    title: copy("Wachstum", "Growth"),
                    body: copy(
                      "Persönliche Entwicklung und Transformation",
                      "Personal development and transformation"
                    ),
                  },
                  {
                    n: "03",
                    icon: Globe,
                    title: copy("Verbindung", "Connection"),
                    body: copy(
                      "Community und bedeutsame Beziehungen aufbauen",
                      "Building community and meaningful relationships"
                    ),
                  },
                  {
                    n: "04",
                    icon: Sparkles,
                    title: copy("Erfahrung", "Experience"),
                    body: copy(
                      "Retreats, Workshops und immersive Sessions",
                      "Retreats, workshops, and immersive sessions"
                    ),
                  },
                ].map((item) => (
                  <li
                    key={item.n}
                    className="group bg-background p-6 sm:p-8 transition-colors hover:bg-[#F7F7F7] dark:hover:bg-[#02182B]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#017F80] dark:text-[#00CDAC]">
                        {item.n}
                      </span>
                      <item.icon
                        className="w-5 h-5 text-[#01223F]/45 dark:text-white/45 group-hover:text-[#00CDAC] transition-colors"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. STORYLINE CHAPTER 1: THE MARKET SHIFT                                  */}
        {/* ========================================================================= */}
        <section id="story" className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              <div className="md:col-span-4 space-y-2">
                <span className="text-xs font-mono font-bold text-[#00CDAC] uppercase tracking-widest">
                  {copy("KAPITEL 01", "CHAPTER 01")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {copy("Der größte Wandel im Wohlbefinden seit Jahrzehnten.", "The greatest shift in human wellbeing in decades.")}
                </h2>
              </div>

              <div className="md:col-span-8 space-y-6 text-slate-600 dark:text-slate-300 font-light leading-relaxed sm:text-lg">
                <p>
                  {copy("Früher war ganzheitliche Gesundheit eine Nische für wenige. Heute ist sie das Lebenselixier einer gesamten Generation, die durch ununterbrochene digitale Reize erschöpft ist. Atemarbeit, somatische Regulation, Eisbäder, Klangschalen und achtsame Bewegung sind keine Trends — sie sind die biologische Notbremse einer überhitzten Gesellschaft.", "Holistic health used to be a niche for few. Today, it is the lifeline for an entire generation exhausted by non-stop digital stimuli. Breathwork, somatic regulation, ice baths, sound healing, and mindful movement are not trends — they are the biological necessity of a hyper-connected world.")}
                </p>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {copy("Die meisten Facilitators organisieren das noch allein: Nachrichten, Überweisungen, Absagen, ein Kalender an einem anderen Ort. ORIVE bündelt Angebot, Termin und Zahlung.", "Most facilitators still run this alone: messages, transfers, cancellations, a calendar somewhere else. ORIVE keeps the listing, the date and the payment in one place.")}
                </p>
              </div>

            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { src: "/facilitators/motif-cold.jpg", alt: "Cold water at a stone basin" },
                { src: "/facilitators/motif-sound.jpg", alt: "A singing bowl on linen" },
                { src: "/facilitators/motif-still.jpg", alt: "Sitting by a window" },
                { src: "/facilitators/motif-forest.jpg", alt: "A hand on a beech trunk" },
              ].map((img) => (
                <figure key={img.src} className="overflow-hidden rounded-xl bg-slate-100 aspect-[4/3]">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </figure>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. STORYLINE CHAPTER 2: DEIN DIGITALER FOOTPRINT IN EUROPA               */}
        {/* ========================================================================= */}
        <section id="manifesto" className="py-20 sm:py-28 bg-slate-50/70 dark:bg-[#02182B]/60 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              <div className="md:col-span-4 md:order-2 space-y-2 md:text-right">
                <span className="text-xs font-mono font-bold text-[#00CDAC] uppercase tracking-widest">
                  {copy("KAPITEL 02", "CHAPTER 02")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {copy("Hinterlasse Spuren. Nicht im Algorithmus, sondern im Menschen.", "Leave your mark. Not in algorithms, but in people.")}
                </h2>
              </div>

              <div className="md:col-span-8 md:order-1 space-y-6 text-slate-600 dark:text-slate-300 font-light leading-relaxed sm:text-lg">
                <p>
                  {copy("ORIVE wurde nicht gebaut, um dich an Social-Media-Feeds zu fesseln. Wir glauben an echte Begegnungen — ob im stillen Raum einer 1:1 Einzelsession oder in der transformativen Kraft einer 50-Personen-Zeremonie. Die Vision einer friedvolleren Gesellschaft: Wenn ein Mensch seinen Körper beruhigt, merkt das oft das Umfeld. Dein Angebot ist ein konkreter Termin, kein Versprechen an einen ganzen Kontinent.", "ORIVE wasn't engineered to lock you into social media dopamine loops. We believe in genuine human encounters — whether in the stillness of a private 1:1 session or the collective energy of a 50-person sound ceremony. The vision of a more peaceful society: when a person settles their body, the people around them often feel it. Your listing is a real appointment, not a promise to a continent.")}
                </p>
              </div>

            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { src: "/facilitators/motif-circle.jpg", alt: "Four people seated together" },
                { src: "/facilitators/motif-cacao.jpg", alt: "Hands around a cup of cacao" },
                { src: "/facilitators/motif-breath.jpg", alt: "Two people breathing together" },
                { src: "/facilitators/motif-morning.jpg", alt: "A stretch by an open window" },
              ].map((img) => (
                <figure key={img.src} className="overflow-hidden rounded-xl bg-slate-100 aspect-[4/3]">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </figure>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. STORYLINE CHAPTER 3: DAS WERKZEUG (ORIVE DEZK)                        */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5">
                <div className="relative min-h-[380px] lg:min-h-[560px] rounded-2xl overflow-hidden bg-[#01223F] flex flex-col justify-between p-8 sm:p-12">
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,205,172,0.16),transparent_42%)]" />
                  <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00CDAC]">ORIVE dezk</p>
                  <div className="relative">
                    <ul className="space-y-0">
                      {(isDe
                        ? [
                            "Heute.",
                            "Workspace.",
                            "Angebote.",
                            "Termine.",
                            "Kalender.",
                            "Suchende.",
                            "Intake.",
                            "Zahlungen.",
                            "Stripe.",
                            "Kapazität.",
                            "Storno.",
                            "Profil.",
                          ]
                        : [
                            "Today.",
                            "Workspace.",
                            "Offerings.",
                            "Dates.",
                            "Calendar.",
                            "Seekers.",
                            "Intake.",
                            "Payments.",
                            "Stripe.",
                            "Capacity.",
                            "Cancel.",
                            "Profile.",
                          ]
                      ).map((feature, index) => (
                        <li
                          key={feature}
                          className={
                            index % 2 === 0
                              ? "text-[1.55rem] sm:text-[1.85rem] font-semibold text-white tracking-tight leading-[1.12]"
                              : "text-[1.55rem] sm:text-[1.85rem] font-semibold text-white/50 tracking-tight leading-[1.12]"
                          }
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm text-white/60 max-w-[20rem] leading-relaxed">
                      {copy("Alles im dezk: Workspace planen, Angebot anlegen, Termine führen, Gäste und Intake sehen, Auszahlung über Stripe.", "Everything in dezk: plan in Workspace, list offerings, run dates, see guests and intake, get paid through Stripe.")}
                    </p>
                  </div>
                </div>

                <div className="relative min-h-[380px] lg:min-h-[560px] flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-[#F7F4EF] dark:bg-[#02182B]">
                  <div className="relative min-h-[240px] flex-1 flex items-center justify-center overflow-hidden bg-[#E8EEF2] dark:bg-[#0a1a2c]">
                    <div className="relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center">
                      <span
                        aria-hidden
                        className="orive-sonar-ring absolute inset-0 rounded-full border border-[#00CDAC]/45 animate-[orive-sonar_2.8s_ease-out_infinite]"
                      />
                      <span
                        aria-hidden
                        className="orive-sonar-ring absolute inset-0 rounded-full border border-[#00CDAC]/35 animate-[orive-sonar_2.8s_ease-out_infinite] [animation-delay:0.9s]"
                      />
                      <span
                        aria-hidden
                        className="orive-sonar-ring absolute inset-0 rounded-full border border-[#00CDAC]/25 animate-[orive-sonar_2.8s_ease-out_infinite] [animation-delay:1.8s]"
                      />
                      <div className="relative z-10 h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-white/80 dark:border-white/20 shadow-[0_0_0_6px_rgba(0,205,172,0.12)]">
                        <img
                          src="/facilitators/facilitator-1.jpg"
                          alt=""
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 p-8 sm:p-12">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80] dark:text-[#00CDAC] mb-4">
                      {copy("Marktplatz-Power", "Marketplace power")}
                    </p>
                    <h2 className="text-[1.65rem] sm:text-[2rem] font-semibold text-[#01223F] dark:text-white tracking-tight leading-[1.15] max-w-sm">
                      {copy(
                        "Digitale Marktplätze verkaufen Reichweite — nicht nur Angebote.",
                        "Digital marketplaces sell reach — not just listings."
                      )}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
                      {copy(
                        "ORIVE bringt dein Facilitator-Business vor Suchende in ganz Europa. Ein Profil, klare Termine, Stripe-Zahlung — und Nachfrage, die über Direktnachrichten nie entsteht.",
                        "ORIVE puts your facilitator practice in front of seekers across Europe. One profile, clear dates, Stripe payment — and demand that direct messages never create."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-2.5">
                {([
                  {
                    src: "/facilitators/motif-format-private.jpg",
                    alt: copy("Einzelsession mit Facilitator und Suchender", "Private session with facilitator and seeker"),
                    kicker: copy("F¹ · Einzelsession", "F¹ · Private session"),
                    title: copy("Die Stunde gehört einer Person.", "The hour belongs to one person."),
                    body: copy("1:1 liegt im selben Kalender wie Gruppe, Event und Retreat.", "1:1 sits in the same calendar as group, event and retreat."),
                  },
                  {
                    src: "/facilitators/motif-format-group.jpg",
                    alt: copy("Kleine Gruppenrunde im Studio", "Small group circle in a studio"),
                    kicker: copy("F² · Gruppe", "F² · Group"),
                    title: copy("Der Raum ist vorbereitet. Der Termin stand fest.", "The room is ready. The time was already set."),
                    body: copy("Buchungen landen im Kalender. Du bereitest den Raum vor, nicht den Chat.", "Bookings land in the calendar. You prepare the room, not the inbox."),
                  },
                  {
                    src: "/facilitators/motif-format-event.jpg",
                    alt: copy("Abend-Event mit Klangschalen und vielen Gästen", "Evening event with singing bowls and many guests"),
                    kicker: copy("F³ · Event", "F³ · Event"),
                    title: copy("Ein Termin. Viele Plätze.", "One date. Many seats."),
                    body: copy("Kapazität, Warteliste und Zahlung laufen über denselben Slot.", "Capacity, waitlist and payment run through the same slot."),
                  },
                  {
                    src: "/facilitators/motif-format-retreat.jpg",
                    alt: copy("Retreat-Gruppe im Freien am See", "Retreat group outdoors by a lake"),
                    kicker: copy("F⁴ · Retreat", "F⁴ · Retreat"),
                    title: copy("Mehrere Tage. Ein Angebot.", "Several days. One offering."),
                    body: copy("Mehrtägige Formate mit Datum, Ort und Stripe-Auszahlung.", "Multi-day formats with date, place and Stripe payout."),
                  },
                ] as const).map((card) => (
                  <article
                    key={card.src}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-[#F7F4EF] dark:bg-[#02182B]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-white/10">
                      <img
                        src={card.src}
                        alt={card.alt}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">
                        {card.kicker}
                      </p>
                      <h3 className="mt-3 text-[1.15rem] font-semibold tracking-tight leading-snug text-[#01223F] dark:text-white">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {card.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/auth?mode=facilitator"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#01223F] dark:text-white hover:opacity-70 transition-opacity"
              >
                {copy("Kostenlos registrieren", "Sign up free")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4b. EUROPEAN COMPANY FORMATION                                            */}
        {/* ========================================================================= */}
        <section id="formation" className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-[#02182B]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Formation", "Formation")}
            </p>
            <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy("Europäische Firmengründung", "European Company Formation")}
            </h2>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {copy(
                "Professionelle Unternehmensgründung in Europas führenden Rechtsräumen — damit dein Angebot von Tag eins rechtlich steht.",
                "Professional business setup across Europe's leading jurisdictions — so your practice is structured for success from day one."
              )}
            </p>

            <p className="mt-8 max-w-[46rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {copy(
                "Eine legale Struktur ist die Grundlage deiner unternehmerischen Reise. Wir begleiten die Gründung in zentralen europäischen Märkten — von der Rechtsform bis zur laufenden Compliance.",
                "Establishing a legal entity is the foundation of your entrepreneurial journey. We provide comprehensive company formation across key European markets, ensuring your business is structured for success from day one."
              )}
            </p>

            <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
              {[
                {
                  n: "01",
                  icon: Building2,
                  title: copy("Multi-Jurisdiktion", "Multi-Jurisdiction"),
                  body: copy(
                    "Firmengründung in Deutschland, Österreich, Spanien, Portugal, den Niederlanden und weiteren Ländern.",
                    "Company formation in Germany, Austria, Spain, Portugal, Netherlands, and more."
                  ),
                },
                {
                  n: "02",
                  icon: FileCheck,
                  title: copy("Vollständige Dokumentation", "Full Documentation"),
                  body: copy(
                    "Komplette Rechtsdokumente, Satzung und Registrierungsunterstützung.",
                    "Complete legal documentation, articles of association, and registration support."
                  ),
                },
                {
                  n: "03",
                  icon: Shield,
                  title: copy("Compliance-ready", "Compliance Ready"),
                  body: copy(
                    "Steuerliche Strukturierung, regulatorische Compliance und laufende rechtliche Begleitung.",
                    "Tax optimization, regulatory compliance, and ongoing legal support."
                  ),
                },
              ].map((item) => (
                <li
                  key={item.n}
                  className="group bg-background p-6 sm:p-8 transition-colors hover:bg-[#F7F7F7] dark:hover:bg-[#02182B]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#017F80] dark:text-[#00CDAC]">
                      {item.n}
                    </span>
                    <item.icon
                      className="w-5 h-5 text-[#01223F]/45 dark:text-white/45 group-hover:text-[#00CDAC] transition-colors"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[46rem] text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {copy(
                "Unser Prozess verbindet rechtliche Expertise mit digitaler Abwicklung — von Einzelunternehmen bis GmbH. Du baust dein Angebot; wir kümmern uns um die Komplexität.",
                "Our streamlined process combines legal expertise with modern technology. From sole proprietorships to GmbH structures, we handle the complexities while you focus on building your vision."
              )}
            </p>

            <div className="mt-10">
              <Link
                href="/formation"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#01223F] dark:bg-white text-white dark:text-[#01223F] text-sm font-semibold hover:bg-[#017F80] dark:hover:bg-[#00CDAC] transition-colors"
              >
                {copy("Firmengründung starten", "Start Your Formation")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. STORYLINE CHAPTER 4: DIE EINLADUNG / FINAL CALL TO ACTION             */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-slate-900 text-white">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,205,172,0.15),transparent_60%)] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
            
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 max-w-4xl">
              {copy("Bereit, dein erstes Angebot zu listen?", "Ready to list your first offering?")}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-light max-w-xl mx-auto mb-10 leading-relaxed">
              {copy("Lege dein Profil an und liste dein erstes Angebot. Keine monatliche Gebühr, keine Kreditkarte.", "Create your profile and list your first offering. No monthly fee, no credit card.")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth?mode=facilitator"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold tracking-normal transition-colors"
              >
                {copy("Kostenlos registrieren", "Register free")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white text-[#01223F] text-sm font-semibold tracking-normal hover:bg-slate-100 transition-colors"
              >
                {copy("Marketplace ansehen", "Explore marketplace")}
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-12 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00CDAC]" />
                <span>{copy("Keine Kreditkarte erforderlich", "No credit card required")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00CDAC]" />
                <span>{copy("Keine monatliche Gebühr", "No monthly fee")}</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}
