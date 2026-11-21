// Directory profile in the regular Orive design (same tokens as /facilitators, homepage and marketplace):
// light #F8FAFC/white surfaces, navy #01223F text, teal #00CDAC actions, rounded-2xl cards, site-wide dark mode via `.dark`.
// No ratings or invented numbers, no email/phone, element emblem as avatar (element never named), own photo only via avatars.json.
import { ArrowUpRight, Globe, Instagram, MapPin } from "lucide-react";
import Link from "next/link";
import { fromPrice, fmtMoney } from "@/lib/directoryPrice";
import type { DirectoryProfile } from "@/lib/directorySample";
import { VIEW_THRESHOLD } from "@/lib/directorySample";
import { describe, stripSourceNote } from "@/lib/directoryBuild";
import { CAT_LABEL } from "@/lib/directorySearchVocab";
import { countryName } from "@/lib/countryName";
import { displayPlace } from "@/lib/directorySearchGeo";
import { ELEMENT_OF, ELEMENT_COLORS, ELEMENT_CSS, particlesHtml, type ElementKey } from "./elements";
import { ElementAvatar } from "./ElementAvatar";

export type UiLang = "de" | "en";

const T = {
  de: { general: "Angebote auf Anfrage", generalTxt: "Konkrete Angebote, Preise und Termine sind hier noch nicht hinterlegt. Sende eine unverbindliche Anfrage.", source: "Quelle", as_of: "Stand", website: "Website besuchen", websiteLbl: "Website", offers: "Angebote", orig: "Original ansehen", isMe: "Das bin ich – Profil übernehmen", remove: "Profil entfernen", newOn: "Neu auf Orive", views: "Aufrufe", about: "Über", priceOnRequest: "Preis auf Anfrage", inquire: "Anfrage senden", fName: "Name", fEmail: "E-Mail", fMsg: "Nachricht", fDate: "Wunschtermin (optional)", fConsentA: "Ich bin einverstanden, dass Orive meine Angaben speichert und die Anfrage bei Bedarf an den Anbieter weiterleitet. Details in der ", fConsentL: "Datenschutzerklärung", fSend: "Anfrage absenden", ok: "Danke! Deine Anfrage ist bei ORIVE eingegangen — wir kümmern uns.", okRouted: "Danke! Deine Anfrage wurde an den Anbieter weitergeleitet.", err: "Die Anfrage konnte nicht gespeichert werden. Bitte prüfe deine Angaben und versuche es erneut.", rate: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es später erneut.", fFor: "Anfrage zu", links: "Links", claimTxt: "Ist das dein Angebot? Übernimm das Profil, um Angaben zu korrigieren und Anfragen zu erhalten.", unclaimed: "Noch nicht von der Anbieterin/dem Anbieter übernommen", toWeb: "Zur Website", ask: "Anfragen", aboutProfile: "Über dieses Profil", statOffers: "Angebote", statOffer: "Angebot", statFrom: "ab", statLoc: "Standort", onReq: "auf Anfrage", more: "weitere Angebote", moreRead: "Mehr lesen", lessRead: "Weniger" },
  en: { general: "Offers on request", generalTxt: "Specific offers, prices and dates are not listed here yet. Send a no-obligation enquiry.", source: "Source", as_of: "as of", website: "Visit website", websiteLbl: "Website", offers: "Offers", orig: "View original", isMe: "This is me – claim profile", remove: "Remove profile", newOn: "New on Orive", views: "views", about: "About", priceOnRequest: "Price on request", inquire: "Send enquiry", fName: "Name", fEmail: "Email", fMsg: "Message", fDate: "Preferred date (optional)", fConsentA: "I agree that Orive stores my details and may forward this enquiry to the provider. See the ", fConsentL: "privacy policy", fSend: "Send enquiry", ok: "Thank you! Your enquiry reached ORIVE — we'll take care of it.", okRouted: "Thank you! Your enquiry was forwarded to the provider.", err: "Your enquiry could not be saved. Please check your details and try again.", rate: "Too many enquiries in a short time. Please try again later.", fFor: "Enquiry about", links: "Links", claimTxt: "Is this your practice? Claim the profile to correct details and receive enquiries.", unclaimed: "Not yet claimed by the provider", toWeb: "Website", ask: "Enquire", aboutProfile: "About this profile", statOffers: "Offers", statOffer: "Offer", statFrom: "from", statLoc: "Location", onReq: "on request", more: "more offers", moreRead: "Read more", lessRead: "Show less" },
} as const;

// Raw crawler offer types -> readable labels (never show "service"/"product" verbatim).
const TYPE_LABEL: Record<UiLang, Record<string, string>> = {
  de: { service: "Angebot", event: "Veranstaltung", product: "Produkt", course: "Kurs", freebie: "Kostenlos", session: "Session", retreat: "Retreat", workshop: "Workshop" },
  en: { service: "Service", event: "Event", product: "Product", course: "Course", freebie: "Free", session: "Session", retreat: "Retreat", workshop: "Workshop" },
};
const KAMBO_NOTICE: Record<UiLang, string> = {
  de: "Hinweis: Kambo ist eine nicht medizinisch anerkannte Praxis, deren Anwendung erhebliche gesundheitliche Risiken bergen kann. Die rechtliche Lage unterscheidet sich je nach Land. Orive gibt keine Empfehlung ab; bitte vorab ärztlichen Rat einholen.",
  en: "Notice: Kambo is not a medically recognised practice and can carry significant health risks. Its legal status varies by country. Orive makes no recommendation; please seek medical advice beforehand.",
};
// licensed category covers in /public/directory/covers (see CREDITS.md)
const PROFILE_CSS = `
.odp-field{background:radial-gradient(90% 80% at 50% 105%,color-mix(in srgb,var(--e1) 26%,transparent),transparent 70%),linear-gradient(155deg,color-mix(in srgb,var(--e2) 24%,#fff),color-mix(in srgb,var(--e1) 14%,#F8FAFC))}
.dark .odp-field{background:radial-gradient(90% 80% at 50% 105%,color-mix(in srgb,var(--e1) 38%,transparent),transparent 70%),linear-gradient(155deg,color-mix(in srgb,var(--e1) 24%,#01223F),#011B33)}
.odp-emb .oav{width:clamp(150px,20vw,224px)!important;height:clamp(150px,20vw,224px)!important;box-shadow:0 0 0 6px rgba(255,255,255,.7),0 0 40px 6px color-mix(in srgb,var(--e1) 35%,transparent)}
.dark .odp-emb .oav{box-shadow:0 0 0 6px rgba(255,255,255,.08),0 0 44px 8px color-mix(in srgb,var(--e1) 45%,transparent)}
`;
const COVER: Record<string, string> = {
  Kambo: "kambo", "Ice Bathing": "ice", "Sauna & Heat": "sauna", "Personal Coaching": "coaching", Yoga: "yoga", BodyWork: "bodywork",
  Breathwork: "breath", "Sound Healing": "sound", "Life Coaching": "coaching", Meditation: "meditation", Mindfulness: "mindfulness", "Spiritual Growth": "spiritual",
};

const catL = (c: string, lang: UiLang) => (CAT_LABEL[lang] as Record<string, string>)[c] ?? c;
const href = (u: string | null | undefined) => (u && /^https?:\/\//i.test(u) ? u : null);
function hostLabel(u: string | null) { if (!u) return null; try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + (x.pathname.length > 1 ? x.pathname.replace(/\/$/, "") : "")).slice(0, 48); } catch { return null; } }
function fmtPrice(o: { price: number | null; currency: string | null }, lang: UiLang) {
  if (o.price == null) return null;
  try { return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", { style: "currency", currency: o.currency || "EUR", maximumFractionDigits: 2 }).format(o.price); }
  catch { return `${o.price} ${o.currency ?? ""}`.trim(); }
}

const card = "rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/5";
const btnSmall = "inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-[13px] font-semibold text-[#01223F] transition hover:border-[#00CDAC] hover:text-[#017F80] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CDAC]/40 group-open:border-[#00CDAC] group-open:text-[#017F80] dark:border-white/20 dark:bg-transparent dark:text-white";
const btnPrimary = "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#00CDAC] px-5 text-sm font-bold text-white transition hover:bg-[#02AAB0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CDAC]/40";
const btnOutline = "inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-[#01223F] transition hover:border-[#00CDAC] hover:text-[#017F80] dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-[#00CDAC]";
const input = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#00CDAC] focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white";
const label = "mb-1 mt-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45";

function InquiryForm({ p, t, offer, title, fid, today, className = "mt-4", cta, ctaClass = btnPrimary }: { p: DirectoryProfile; t: (typeof T)[UiLang]; offer: string; title: string; fid: string; today: string; className?: string; cta?: string; ctaClass?: string }) {
  return (
    <details className={`group ${className} open:basis-full`}>
      <summary className={`${ctaClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>{cta ?? t.inquire}</summary>
      <form method="post" action="/api/directory/inquiry" className="mt-4 grid max-w-[520px] gap-1 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[.04]" aria-label={`${t.fFor} ${title}`}>
        <input type="hidden" name="slug" value={p.slug} />
        <input type="hidden" name="offer" value={offer} />
        <input type="hidden" name="ts" value={Date.now()} />
        <label htmlFor={`${fid}-n`} className={label}>{t.fName}</label>
        <input id={`${fid}-n`} name="name" required maxLength={120} autoComplete="name" className={input} />
        <label htmlFor={`${fid}-e`} className={label}>{t.fEmail}</label>
        <input id={`${fid}-e`} name="email" type="email" required maxLength={254} autoComplete="email" className={input} />
        <label htmlFor={`${fid}-m`} className={label}>{t.fMsg}</label>
        <textarea id={`${fid}-m`} name="message" required minLength={5} maxLength={4000} rows={4} className={`${input} h-auto py-2`} />
        <label htmlFor={`${fid}-d`} className={label}>{t.fDate}</label>
        <input id={`${fid}-d`} name="date" type="date" min={today} className={input} />
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="!absolute !-left-[9999px] h-px w-px opacity-0" />
        <label className="mt-3 flex items-start gap-2 text-sm leading-snug text-slate-600 dark:text-white/70">
          <input type="checkbox" name="consent" value="1" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#00CDAC]" />
          <span>{t.fConsentA}<a href="/datenschutz" target="_blank" className="underline underline-offset-2">{t.fConsentL}</a>.</span>
        </label>
        <button type="submit" className={`${btnPrimary} mt-3 justify-self-start`}>{t.fSend}</button>
      </form>
    </details>
  );
}

export default function DirectoryProfilePage({ p, views, jsonLd, inquiry = null, routed = null, lang = "de", avatar = null }: { p: DirectoryProfile; views: number; jsonLd: object; inquiry?: "ok" | "err" | "rate" | null; routed?: boolean | null; lang?: UiLang; avatar?: string | null }) {
  const t = T[lang];
  const primary = (p.primary ?? p.categories.find((c) => COVER[c]) ?? p.categories[0] ?? "") as string;
  const el: ElementKey = ELEMENT_OF[primary] ?? "aether";
  const [e1, e2] = ELEMENT_COLORS[el];
  const cover = COVER[primary] ?? "mindfulness";
  const cats = [primary, ...p.categories.filter((x) => x !== primary)].filter(Boolean);
  const city = p.city ? displayPlace(p.city, lang) : "";
  const loc = [city, countryName(p.countryCode, p.country, lang)].filter(Boolean).join(", ");
  const description = stripSourceNote(p.lang === lang ? p.description : describe(p.name, primary, p.categories, city, p.country, lang, p.offers));
  void views; void VIEW_THRESHOLD; void cover; // views are still counted; the approved header shows only offers, price and place
  const web = href(p.website), ig = href(p.instagram);
  const today = new Date().toISOString().slice(0, 10);
  const from = fromPrice(p.offers);
  const fromTxt = from ? fmtMoney(from, lang) : null;
  const n = p.offers.length;
  const notice = inquiry ? (
    <div role="status" id="anfrage-status" className={`mb-4 rounded-xl px-4 py-3 text-sm ${inquiry === "ok" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"}`}>
      {inquiry === "ok" ? (routed ? t.okRouted : t.ok) : inquiry === "rate" ? t.rate : t.err}
    </div>
  ) : null;
  const h2 = "text-xl font-semibold tracking-tight text-[#01223F] dark:text-white sm:text-2xl";
  const backHref = lang === "en" ? "/facilitators?lang=en" : "/facilitators";

  return (
    <div className="dir-profile w-full bg-[#F8FAFC] dark:bg-[#011B33]" lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <style dangerouslySetInnerHTML={{ __html: ELEMENT_CSS + PROFILE_CSS }} />
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        <nav className="text-xs text-slate-500 dark:text-white/55" aria-label="Breadcrumb">
          <Link href={backHref} className="hover:text-slate-800 dark:hover:text-white">Facilitators</Link> <span aria-hidden>/</span> <span className="text-[#01223F] dark:text-white/85">{p.name}</span>
        </nav>

        {/* split cover */}
        <section className="mt-4 grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[.04] md:grid-cols-[1.1fr_1fr]">
          <div className={`el-${el} odp-field odp-emb relative grid min-h-[230px] place-items-center overflow-hidden sm:min-h-[300px] md:min-h-[400px]`} style={{ ["--e1" as any]: e1, ["--e2" as any]: e2 }}>
            <div dangerouslySetInnerHTML={{ __html: particlesHtml(el) }} />
            <ElementAvatar element={el} avatar={avatar} size={200} />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            {primary ? <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#017F80] dark:text-[#5ee6cf]">{catL(primary, lang)}</p> : null}
            <h1 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] text-[#01223F] dark:text-white sm:text-[44px]">{p.name}</h1>
            {loc ? <p className="mt-3 flex items-center gap-1.5 text-[15px] text-slate-600 dark:text-white/65"><MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />{loc}</p> : null}
            {!avatar ? <p className="mt-2 text-xs text-slate-400 dark:text-white/40">{t.unclaimed}</p> : null}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href="#angebote" className={btnPrimary}>{t.inquire}</a>
              {web ? <a className={btnOutline} href={web} rel="nofollow noopener noreferrer" target="_blank">{t.toWeb}<ArrowUpRight className="h-4 w-4" aria-hidden /></a> : null}
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6 dark:border-white/10">
              <div><dt className="sr-only">{t.statOffers}</dt><dd className="text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">{n || "–"}</dd><dd className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{n === 1 ? t.statOffer : t.statOffers}</dd></div>
              <div><dt className="sr-only">{t.statFrom}</dt><dd className="truncate text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">{fromTxt ?? "–"}</dd><dd className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{fromTxt ? t.statFrom : t.onReq}</dd></div>
              <div className="min-w-0"><dt className="sr-only">{t.statLoc}</dt><dd className="truncate text-xl font-semibold tracking-tight text-[#01223F] dark:text-white">{city || countryName(p.countryCode, p.country, lang) || "–"}</dd><dd className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{t.statLoc}</dd></div>
            </dl>
          </div>
        </section>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1fr_1.35fr] md:gap-14">
          {/* about */}
          <section aria-labelledby="ueber-h">
            <h2 id="ueber-h" className={h2}>{t.aboutProfile}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-white/70">{description}</p>
            {cats.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={t.about}>
                {cats.map((c) => <li key={c} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">{catL(c, lang)}</li>)}
                {city ? <li className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">{city}</li> : null}
              </ul>
            ) : null}
            {p.kambo ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">{KAMBO_NOTICE[lang]}</div> : null}
            {web || ig ? (
              <div className="mt-5 flex flex-wrap gap-2" aria-label={t.links}>
                {web ? <a href={web} rel="nofollow noopener noreferrer" target="_blank" className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] text-slate-700 hover:border-[#00CDAC] dark:border-white/10 dark:bg-white/5 dark:text-white/75"><Globe className="h-4 w-4 shrink-0 text-[#00CDAC]" aria-hidden /><span className="truncate">{hostLabel(web)}</span></a> : null}
                {ig ? <a href={ig} rel="nofollow noopener noreferrer" target="_blank" className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] text-slate-700 hover:border-[#00CDAC] dark:border-white/10 dark:bg-white/5 dark:text-white/75"><Instagram className="h-4 w-4 shrink-0 text-[#00CDAC]" aria-hidden /><span className="truncate">{hostLabel(ig)}</span></a> : null}
              </div>
            ) : null}
          </section>

          {/* offers: booking-style list, same inquiry form/flow as before */}
          <section aria-labelledby="angebote-h" className="scroll-mt-24" id="angebote">
            <h2 id="angebote-h" className={h2}>{n ? t.offers : t.general}</h2>
            <div className="mt-3">{notice}</div>
            {n ? (
              <ul className="divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-white/10 dark:border-white/10">
                {p.offers.map((o, i) => {
                  const meta = [TYPE_LABEL[lang][String(o.type || "").toLowerCase().trim()], o.duration].filter(Boolean).join(" · ");
                  const price = fmtPrice(o, lang);
                  const u = href(o.url);
                  const about = String((o as { description?: string | null }).description || "").trim();
                  return (
                    <li key={i} className="flex flex-col gap-2 py-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="min-w-0 flex-1 basis-[55%]">
                        <h3 className="text-[15px] font-semibold leading-snug text-[#01223F] dark:text-white">{o.title}</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                          {meta}
                          {u ? <>{meta ? " · " : ""}<a href={u} rel="nofollow noopener noreferrer" target="_blank" className="underline-offset-2 hover:text-[#017F80] hover:underline">{t.orig}</a></> : null}
                        </p>
                      </div>
                      <p className={`shrink-0 text-right ${price ? "text-[15px] font-semibold text-[#01223F] dark:text-white" : "text-xs text-slate-500 dark:text-white/55"}`}>{price ?? t.priceOnRequest}</p>
                      <InquiryForm p={p} t={t} offer={String(i)} title={o.title} fid={`inq-${i}`} today={today} className="shrink-0" cta={t.ask} ctaClass={btnSmall} />
                      </div>
                      {about ? (
                        about.length <= 280 ? (
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70 whitespace-pre-line">{about}</p>
                        ) : (
                          <details className="group">
                            <summary className="cursor-pointer list-none text-sm font-medium text-[#017F80] marker:content-none [&::-webkit-details-marker]:hidden dark:text-[#00CDAC]">
                              <span className="block whitespace-pre-line font-normal text-slate-600 group-open:hidden dark:text-white/70">{about.slice(0, about.slice(0, 280).lastIndexOf(" ") > 160 ? about.slice(0, 280).lastIndexOf(" ") : 280).trim()} …</span>
                              <span className="mt-1 block group-open:hidden">{t.moreRead}</span>
                              <span className="hidden group-open:inline">{t.lessRead}</span>
                            </summary>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-white/70 whitespace-pre-line">{about}</p>
                          </details>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={card}>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">{t.generalTxt}</p>
                <InquiryForm p={p} t={t} offer="general" title={t.general} fid="inq-g" today={today} />
              </div>
            )}
          </section>
        </div>

        {/* claim / remove */}
        <section className="mt-12 rounded-2xl border border-dashed border-slate-300 px-5 py-4 dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-white/65">{t.claimTxt}</p>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={`/directory/claim/${p.slug}`} rel="nofollow" className="font-semibold text-[#017F80] hover:underline dark:text-[#00CDAC]">{t.isMe}</a>
            <a href={`/directory/remove/${p.slug}`} rel="nofollow" className="text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline dark:text-white/50 dark:hover:text-white">{t.remove}</a>
          </p>
        </section>
      </div>
    </div>
  );
}
