// Pure builder: tier-A facilitators + crawled offers -> public directory profiles. No email/phone ever leaves this module.
// Cleaning rules ported from the 31-profile sample export (sel31.py/build31.py) and extended. Never invents prices or dates.
export type DirectoryOffer = { id?: string | null; title: string; type: string; price: number | null; currency: string | null; duration: string | null; url: string; description?: string | null };
export type DirectoryProfile = {
  slug: string; id: string; name: string; primary?: string; categories: string[]; kambo: boolean; city: string; country: string;
  countryCode: string; lang: "de" | "en" | "fr" | "nl"; website: string; instagram: string | null;
  source: string; sourceUrl: string | null; sourceDate: string; offers: DirectoryOffer[]; description: string;
};
export type FacRow = { id: string; name: string; categories: string[] | null; kambo_flag: boolean | null; city: string | null; country: string | null; website: string | null; instagram: string | null; source: string | null; source_url: string | null; created_at: string | null };
export type OfferRow = { id: string; facilitator_id: string; type: string | null; title: string | null; description?: string | null; price: number | string | null; currency: string | null; duration: string | null; url: string | null };

export const ROUTES = new Set("about admin affiliate agb api app auth blog booking categories chat checkout claim datenschutz dezk event experience f facilitator features for-facilitators formation health impressum invest marketplace not-found onboarding orive-dezk partner-terms pay product profil profiles protection reset-password robots services session shop sitemap waitlist whatsapp-assistant directory angebote breathwork yoga sauna ice kambo sound meditation mindfulness bodywork spiritual coaching personal lovable-uploads sessions facilitators favicon".split(" "));

export const ISO: Record<string, string> = { Germany: "DE", Austria: "AT", Switzerland: "CH", Netherlands: "NL", France: "FR", "United Kingdom": "UK", Ireland: "IE", Spain: "ES", Portugal: "PT", Italy: "IT", Belgium: "BE", Finland: "FI", Denmark: "DK", Norway: "NO", Sweden: "SE", Slovakia: "SK", Greece: "GR", Poland: "PL", Slovenia: "SI", Estonia: "EE", Lithuania: "LT", Romania: "RO", Latvia: "LV", Czechia: "CZ", Croatia: "HR", Luxembourg: "LU", Cyprus: "CY", Bulgaria: "BG", Hungary: "HU", Malta: "MT", Serbia: "RS", Iceland: "IS" };
const CUR: Record<string, string> = { "United Kingdom": "GBP", Switzerland: "CHF", Denmark: "DKK", Norway: "NOK", Sweden: "SEK", Poland: "PLN", Czechia: "CZK", Hungary: "HUF", Romania: "RON", Bulgaria: "BGN", Iceland: "ISK", Serbia: "RSD" };

const JUNK = /additional information|upcoming|information|no.?show|penalty|basket|cost around|kursdaten|gift|geschenk|cadeau|voucher|gutschein|locatie|prijs|kosten|ermäßigung|^\W|newton|wednesdays|tarif|price|preis|faq|contact|cookie|newsletter|^read more|^book|^shop|^home|cart|warenkorb|^\d|total|winkel|aanbieding|uitverkoop|inspiratie|hoodie|bathrobe|\bhats?\b|beanie|best seller|chiller|massage gun|producto|tarjeta|precio|inscripci|matr[íi]cula|inversi[óo]n|costi|dura[çc][ãa]o|dauer|pricing|hinnasto|welcome package|ticket|gut zu wissen|^kurse, seminare|^connect$|^continue$|first 50|wijzigen|class \d|poses \d|spray|candle|ice barrel|compression|productos|destacad|\d{2}\.\d{2}\.\d{4}|nationale|early bird|datum|uhrzeit|hinta|membre|choisissez|wie bezahlst|reserva a tua|mensalidade|te ayudamos|si te quedas|pilar usart|^incl|^syst$|retreat-leiter|bonuse|kommende|special offer|cream|\boil\b|perle|taske|presentkort|startpaket|provpaket|prezzi|pacchetti|^ice baths$|portable|\(2 people\)|pago|descuento|ted ai|op dit moment|geen les|location de linges|badstuehatt|poncho|^classes, workshop|i'?m a product|^filters?$|^italia$|^(january|february|march|april|may|june|july|august|september|october|november|december|januar|februar|märz|mai|juni|juli|oktober|dezember|janvier|février|mars|avril|juin|juillet|août|septembre|octobre|novembre|décembre)\b|financement|coût|investering|^participation$|^praktisch|^practical|praktische|^workshop$|^workshops$|^cours$|^courses?$|^services?$|^angebote?$|^offres?$|^events?$|^termine$|^agenda$|^calendar|^kalender|lorem ipsum|placeholder|sample product|^test\b|^product\b|^untitled|^default|^sold out|ausverkauft|^menu$|^login|^anmelden$|^register|^subscribe|^donat|spende|^sale\b|discount|rabatt|korting|^shipping|versand|^read|^learn more|^mehr erfahren|^en savoir plus|^(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b|\braum\b|\bm2\b|m²|karten|frequently asked|^from$|^ab$|^vanaf$|arrhes|acompte|informazioni|^importante|preços|membership|mitgliedschaft|abonnement|^explore|aktuellen|^beitrag|^la séance$|tarief|vergoeding|particulier|^adultes|^kinder|^enfants|^über (uns|mich)|^about|^team$|^location|^anfahrt|^impressum|^datenschutz|^privacy|^terms|^agb|^stornierung|cancellation|annulation|^bitte|^please|^hinweis|^note\b|^remarque|^wichtig|^opening|öffnungszeiten|^horaires|openingstijden|^address|adresse|^dates?\b|^termin(e)?:|^prices?\b|^rates?\b|^fees?\b|^cost|investition|vergoed|werkgever|^cena$|^online$|schenken|\bi\.v\.m\b|\*\*|^drafts?$|ausgebucht|volgeboekt|^complet\b|zuzahlung|\b\d{1,2}\.\d{1,2}\.\d{2}\b|\b\d{1,2}\.\d{1,2}\.?$/i;

const ENT: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", eacute: "é", egrave: "è", agrave: "à", uuml: "ü", ouml: "ö", auml: "ä", szlig: "ß", ccedil: "ç" };
export function unescapeHtml(s: string) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") { const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m; }
    return ENT[e.toLowerCase()] ?? m;
  });
}
export function slugify(s: string) {
  let x = s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");
  x = x.normalize("NFKD").replace(/[^\x00-\x7f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (x.length > 60) { x = x.slice(0, 60); const i = x.lastIndexOf("-"); if (i > 20) x = x.slice(0, i); }
  return x;
}
const FR_CH = /neuch[âa]tel|montreux|gen[èe]v|geneva|lausanne|fribourg|sion|vevey|nyon|yverdon|la chaux|morges|delémont|delemont|martigny|monthey|bulle/i;
function lang(country: string, city: string): DirectoryProfile["lang"] {
  if (country === "Germany" || country === "Austria") return "de";
  if (country === "Switzerland") return FR_CH.test(city) ? "fr" : "de";
  if (country === "France") return "fr";
  if (country === "Netherlands") return "nl";
  return "en";
}
const PRIORITY = ["Kambo", "Breathwork", "Ice Bathing", "Sound Healing", "Sauna & Heat", "Personal Coaching", "Mindfulness", "Meditation", "Yoga", "BodyWork", "Spiritual Growth", "Life Coaching"];
const CAT: Record<string, Record<string, string>> = {
  de: { Kambo: "Kambo", "Ice Bathing": "Eisbaden", "Sauna & Heat": "Sauna & Wärme", "Personal Coaching": "Personal Coaching", Yoga: "Yoga", BodyWork: "Körperarbeit", Mindfulness: "Achtsamkeit", Meditation: "Meditation", "Spiritual Growth": "Spirituelles Wachstum", Breathwork: "Breathwork", "Sound Healing": "Klangheilung", "Life Coaching": "Life Coaching" },
  fr: { Kambo: "kambo", "Ice Bathing": "bain de glace", "Sauna & Heat": "sauna", "Personal Coaching": "coaching personnel", Yoga: "yoga", BodyWork: "travail corporel", Mindfulness: "pleine conscience", Meditation: "méditation", "Spiritual Growth": "développement spirituel", Breathwork: "breathwork", "Sound Healing": "soin sonore", "Life Coaching": "coaching de vie" },
  nl: { Kambo: "kambo", "Ice Bathing": "ijsbaden", "Sauna & Heat": "sauna", "Personal Coaching": "personal coaching", Yoga: "yoga", BodyWork: "lichaamswerk", Mindfulness: "mindfulness", Meditation: "meditatie", "Spiritual Growth": "spirituele groei", Breathwork: "breathwork", "Sound Healing": "klankhealing", "Life Coaching": "life coaching" },
  en: { Kambo: "Kambo", "Ice Bathing": "ice bathing", "Sauna & Heat": "sauna & heat", "Personal Coaching": "personal coaching", Yoga: "yoga", BodyWork: "bodywork", Mindfulness: "mindfulness", Meditation: "meditation", "Spiritual Growth": "spiritual growth", Breathwork: "breathwork", "Sound Healing": "sound healing", "Life Coaching": "life coaching" },
};
const CTRY: Record<string, Record<string, string>> = {
  de: { Germany: "Deutschland", Austria: "Österreich", Switzerland: "Schweiz", Netherlands: "Niederlande", France: "Frankreich", "United Kingdom": "Vereinigtes Königreich", Italy: "Italien", Spain: "Spanien", Belgium: "Belgien", Denmark: "Dänemark", Sweden: "Schweden", Norway: "Norwegen", Finland: "Finnland", Poland: "Polen", Czechia: "Tschechien", Hungary: "Ungarn", Greece: "Griechenland", Ireland: "Irland", Slovakia: "Slowakei", Slovenia: "Slowenien", Portugal: "Portugal", Estonia: "Estland", Lithuania: "Litauen", Latvia: "Lettland", Romania: "Rumänien", Croatia: "Kroatien", Luxembourg: "Luxemburg", Cyprus: "Zypern", Bulgaria: "Bulgarien", Malta: "Malta", Serbia: "Serbien", Iceland: "Island" },
  fr: { France: "France", Switzerland: "Suisse", Belgium: "Belgique", Germany: "Allemagne", Luxembourg: "Luxembourg" },
  nl: { Netherlands: "Nederland", Belgium: "België", Germany: "Duitsland" },
  en: { "United Kingdom": "the United Kingdom", Netherlands: "the Netherlands", Czechia: "Czechia" },
};
const joinL = (l: string[], a: string) => (l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + ` ${a} ` + l[l.length - 1]);
export function describe(name: string, pick: string, cats: string[], city: string, country: string, L: DirectoryProfile["lang"], offers: DirectoryOffer[]) {
  const cs = [pick, ...cats.filter((x) => x !== pick)].map((c) => CAT[L][c] ?? c);
  const ct = country ? (CTRY[L][country] ?? country) : ""; const first = offers[0]?.title;
  const where = (pre: string, sep: string) => (city && ct ? `${pre}${city}${sep === "," ? ", " + ct : " (" + ct + ")"}` : city ? `${pre}${city}` : ct ? `${pre}${ct}` : "");
  if (L === "de") return `${name} ist im Bereich ${joinL(cs, "und")} tätig${where(", mit Sitz in ", "(")}.` + (first ? ` Auf der eigenen Website werden Angebote genannt, darunter „${first}“.` : " Angebote sind auf Anfrage erhältlich.");
  if (L === "fr") return `${name} propose une pratique de ${joinL(cs, "et")}${where(" à ", "(")}.` + (first ? ` Son site web présente des offres, dont « ${first} ».` : " Les offres sont disponibles sur demande.");
  if (L === "nl") return `${name} is actief in ${joinL(cs, "en")}${where(" in ", "(")}.` + (first ? ` Op de eigen website staat aanbod vermeld, waaronder ‘${first}’.` : " Aanbod is op aanvraag beschikbaar.");
  return `${name} offers ${joinL(cs, "and")}${where(" in ", ",")}.` + (first ? ` Their website lists offers including “${first}”.` : " Offers are available on request.");
}
const httpUrl = (u: string | null | undefined) => (u && /^https?:\/\/[^\s]+$/i.test(u.trim()) ? u.trim() : null);
export const MAX_OFFERS = 8;
/** Display-safe offer about text: strip markup, keep paragraph breaks, cap at the page limit. */
export function offerDescription(raw: string | null | undefined, max = 1400): string {
  let t = String(raw || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (t.length > max) {
    const cut = t.slice(0, max);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("\n"));
    t = (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "")).trim();
  }
  return t;
}

export function cleanOffers(rows: OfferRow[], country: string, website: string, shared: Set<string> = new Set()): DirectoryOffer[] {
  const out: DirectoryOffer[] = []; const seen = new Set<string>();
  const exp = CUR[country] ?? "EUR";
  for (const o of rows) {
    const ti = unescapeHtml(o.title || "").replace(/[\u200b\u00ad]/g, "").replace(/\s+/g, " ").trim();
    const key = ti.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (ti.length < 4 || ti.length > 70 || JUNK.test(ti) || !key || seen.has(key) || shared.has(key)) continue;
    seen.add(key);
    let p: number | null = o.price == null || o.price === "" ? null : Number(o.price);
    const cur = (o.currency || "").trim().toUpperCase() || null;
    // only trust a price in the country's own currency; drop year-like event "prices", zero/negative and absurd values
    if (p != null && (!Number.isFinite(p) || cur !== exp || (p >= 2000 && p <= 2100 && o.type === "event") || p <= 0 || p > 50000)) p = null;
    if (p != null) p = Math.round(p * 100) / 100;
    const dur = (o.duration || "").trim().replace(/\s+/g, " ");
    out.push({ id: o.id ?? null, title: ti, type: o.type || "service", price: p, currency: p != null ? cur : null, duration: dur && dur.length <= 30 ? dur : null, url: httpUrl(o.url) ?? website, description: offerDescription(o.description) || null });
    if (out.length >= MAX_OFFERS) break;
  }
  // one price repeated across many offers is a scrape artefact (page-level price) -> unknown, never guessed
  const priced = out.filter((o) => o.price != null);
  if (priced.length >= 3 && new Set(priced.map((o) => o.price)).size === 1) for (const o of out) { o.price = null; o.currency = null; }
  return out;
}
export type BuildStats = { tierA: number; staticOrSkipped: number; pass1: number; pass2: number; excluded: Record<string, number> };
const CATWORDS = new Set("yoga breathwork meditation mindfulness kambo sauna coaching bodywork massage reiki sound healing ice bathing eisbaden atemarbeit test name unknown n/a na none null facilitator mysite my-site homepage home website site welcome untitled index startseite accueil mbsr mbct roma".split(" "));
export function junkName(name: string): string | null {
  if (!/\p{L}/u.test(name)) return "no letters in name";
  if (/https?:|www\.|^[\w-]+(\.[\w-]+)*\.(com|de|nl|fr|ch|at|co|uk|org|net|io|eu|be|es|it|se|dk|no|fi|pl|pt|info|online|life|studio|space)(\/.*)?$/i.test(name)) return "domain/URL as name";
  if (name.replace(/[^\p{L}]/gu, "").length < 3) return "name too short";
  if (CATWORDS.has(name.toLowerCase().trim())) return "generic word as name";
  if (/@/.test(name)) return "email as name";
  if (/^(site ?name|(your )?site ?title|my ?site( \d+)?|my ?website|website ?name|business ?name|company ?name|your ?name|lorem ipsum.*)$/i.test(name.trim())) return "template placeholder as name";
  return null;
}
export function buildProfiles(facs: FacRow[], offersByFac: Map<string, OfferRow[]>, skipIds: Set<string>, staticProfiles: DirectoryProfile[], stats?: BuildStats): DirectoryProfile[] {
  const used = new Set<string>(staticProfiles.map((p) => p.slug));
  const staticIds = new Set(staticProfiles.map((p) => p.id));
  const freq = new Map<string, Set<string>>();
  for (const [fid, rows] of offersByFac) for (const o of rows) { const k = unescapeHtml(o.title || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); if (k.length > 12) { if (!freq.has(k)) freq.set(k, new Set()); freq.get(k)!.add(fid); } }
  const shared = new Set([...freq].filter(([, v]) => v.size >= 8).map(([k]) => k));
  const out: DirectoryProfile[] = [];
  const st: BuildStats = stats ?? { tierA: 0, staticOrSkipped: 0, pass1: 0, pass2: 0, excluded: {} };
  st.tierA = facs.length;
  const ex = (why: string) => { st.excluded[why] = (st.excluded[why] || 0) + 1; };
  const sorted = [...facs].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || a.id.localeCompare(b.id));
  const rest: FacRow[] = [];
  const mk = (r: FacRow, name: string, city: string, country: string, website: string, offers: DirectoryOffer[], cats: string[], strict = false) => {
    const kambo = !!r.kambo_flag || cats.includes("Kambo");
    const pick = (kambo ? "Kambo" : PRIORITY.find((c) => cats.includes(c))) ?? cats[0] ?? "Mindfulness";
    let s = slugify(name);
    if (!s) return null;
    if ((used.has(s) || ROUTES.has(s)) && (strict || (city && slugify(city)))) s = `${s}-${slugify(city)}`;
    let n = 2; const base = s; while (used.has(s) || ROUTES.has(s)) s = `${base}-${n++}`;
    used.add(s);
    const L = lang(country, city);
    return { primary: pick, slug: s, id: r.id, name, categories: cats.length ? cats : [pick], kambo, city, country, countryCode: ISO[country] ?? "", lang: L, website,
      instagram: httpUrl(r.instagram), source: r.source || "public website", sourceUrl: httpUrl(r.source_url), sourceDate: (r.created_at || "").slice(0, 10), offers,
      description: describe(name, pick, cats.length ? cats : [pick], city, country, L, offers) } as DirectoryProfile;
  };
  // pass 1: exactly the original rules and order -> existing slugs stay stable
  for (const r of sorted) {
    if (staticIds.has(r.id) || skipIds.has(r.id)) { st.staticOrSkipped++; continue; }
    const name = unescapeHtml(r.name || "").replace(/\s+/g, " ").trim();
    const city = (r.city || "").trim(); const country = (r.country || "").trim();
    const website = httpUrl(r.website);
    if (!name || name.length > 90 || !city || !ISO[country] || !website) { rest.push(r); continue; }
    const offers = cleanOffers(offersByFac.get(r.id) || [], country, website, shared);
    if (!offers.length) { rest.push(r); continue; }
    const p = mk(r, name, city, country, website, offers, (r.categories || []).filter(Boolean), true);
    if (!p) { rest.push(r); continue; }
    out.push(p); st.pass1++;
  }
  // pass 2: remaining tier-A profiles (name + category required; city/country/website optional, never invented)
  const demoji = (x: string) => { if (!/[âÃ][\u0080-\u00bf]/.test(x)) return x; try { const y = Buffer.from(x, "latin1").toString("utf8"); return y.includes("\ufffd") ? x : y; } catch { return x; } };
  for (const r of rest) {
    const name = demoji(unescapeHtml(r.name || "")).replace(/[\u200b\u00ad]/g, "").replace(/\s+/g, " ").trim();
    if (!name) { ex("no name"); continue; }
    if (name.length > 90) { ex("name longer than 90 chars"); continue; }
    const j = junkName(name); if (j) { ex(j); continue; }
    const cats = (r.categories || []).filter(Boolean);
    if (!cats.length) { ex("no category"); continue; }
    const city = (r.city || "").trim(); const country = (r.country || "").trim();
    const website = httpUrl(r.website) ?? "";
    const offers = cleanOffers(offersByFac.get(r.id) || [], country, website, shared).map((o) => ({ ...o, url: httpUrl(o.url) ?? "" }));
    const p = mk(r, name, city, country, website, offers, cats);
    if (!p) { ex("name gives empty slug"); continue; }
    out.push(p); st.pass2++;
  }
  return out;
}

/** Removes the old "data comes from public sources / not verified" sentence from stored profile descriptions (render-time only, no DB change). */
export function stripSourceNote(text: string | null | undefined): string {
  return String(text || "")
    .replace(/\s*(Alle Angaben stammen aus öffentlichen Quellen|All details come from public sources|Ces informations proviennent de sources publiques|Alle gegevens komen uit openbare bronnen)[^.]*\.?/g, "")
    .replace(/\s*(Profile sind aus öffentlichen (Quellen|Daten) erstellt und noch nicht verifiziert|Profiles are created from public sources and not yet verified)\.?/g, "")
    .trim();
}
