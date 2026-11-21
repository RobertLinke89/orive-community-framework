// Homepage infinite offer feed (server only). Flattens the offers of all visible directory profiles
// (removed/hidden profiles excluded, junk offer titles already filtered by directorySample) into one
// deterministic order per seed, so paging by offset never repeats an offer within a session.
// Mixing: brands are shuffled by seed (slight preference for priced offers and DACH for German UI),
// then one card per brand (see Dedupe below): no facilitator walls, no Termine repeats, no chain branches.
// Image feed (2026-11-10): only offers with their own checked image (see offerImages.ts). No ratings, no contact data,
// no facilitator portraits: title, type, price/duration/date as published, name, place and the offer image.
import { allDirectoryProfiles, type DirectoryProfile } from "@/lib/directorySample";
import { CATEGORIES, CAT_LABEL, CAT_SYNONYMS } from "@/lib/directorySearchVocab";
import { claimedAvatar, countryName, elementFor } from "@/lib/directoryAvatar";
import { displayPlace } from "@/lib/directorySearchGeo";
import type { ElementKey } from "@/components/directory/elements";
import { offerImageIndex, type OfferImage } from "@/lib/offerImages";
import { assignTopicImages } from "@/lib/topicImages";
import { imageVersion, warmThumbnails } from "@/lib/offerImageCache";

export type FeedItem = {
  key: string; title: string; type: string; price: number | null; currency: string | null; duration: string | null;
  href: string; name: string; city: string | null; country: string | null; category: string;
  element: ElementKey; avatar: string | null;
  /** the offer's own crawled image (checked: loads, card-sized, used by this one offer only) */
  image: string; startAt: string | null;
  /** fast cached WebP thumbnail base (/api/offer-image/<id>?v=..), the client adds &w= */
  thumb: string;
};
export type FeedPage = { items: FeedItem[]; total: number; nextOffset: number | null };

const ISO2: Record<string, string> = { UK: "GB" };
const cc2 = (p: DirectoryProfile) => (ISO2[p.countryCode] || p.countryCode || "").toUpperCase();
const HOME_DE = new Set(["DE", "AT", "CH"]);
const catLabel = (c: string, lang: "de" | "en") => (CAT_LABEL[lang] as Record<string, string>)[c] || c;

function hash(s: string) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
const rnd = (seed: number, s: string) => hash(`${seed}:${s}`) / 4294967296;

/** Crawled titles sometimes keep HTML entities ("YIN &amp; SLEEP"); decode the common ones for display. */
function decodeEntities(t: string): string {
  // UTF-8 read as Latin-1 ("AyurvÃ©dica" -> "Ayurvédica"), only when the whole title is Latin-1 and decodes cleanly
  if (/Ã[\u0080-\u00BF]/.test(t) && ![...t].some((c) => c.charCodeAt(0) > 255)) {
    const u = Buffer.from(t, "latin1").toString("utf8");
    if (!u.includes("\uFFFD")) t = u;
  }
  return t.replace(/&(amp|quot|apos|#39|lt|gt|nbsp);/g, (_, e) => ({ amp: "&", quot: '"', apos: "'", "#39": "'", lt: "<", gt: ">", nbsp: " " } as Record<string, string>)[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Feed-only title rules on top of isJunkOfferTitle (display time, nothing is written): the homepage shows
// offers to strangers, so FAQ questions, price-table fragments, navigation text and bare generic words are skipped.
const GENERIC = new Set("wien basis material lektion premium anreise adults entrée entree kort werl opgave thursdays treatments pakketten investimento dienstleistungen kacheln coaching yoga cijene dettagli ateliers drop-in dropin header special einzel session sessions".split(" "));
const NAV = /\b(log ?out|log ?in|filtern nach|filtrer par|header note|snelle weergave|bankverbindung|domain|kampagne|platz sichern|reserve your place|infos? & anmeldung|envia-me|bleiben wir in verbindung|organisatorisch|allgemeine infos|um die anmeldung|melde dich|das erwartet dich|deine möglichkeiten|werde teil|stimmen aus|veranstaltungseintr|kündigungsfrist|verlängerungsoption|versäumen|honorar|beträgt|facturée|au lieu de|beinhalten|inklusive|kostet|kosten\b|wat kost|hoeveel kost|how much|price list|preisliste|tarieven|hinnat|admin|newsletter|gutschein|voucher|dovanų|t\.w\.v|vergangene|häufige fragen|ablauf|details\b|kurs ?infos?\b|aktuelle kurse|who will|we support|welcome to|\bgilt\b|article \d|variante \d|t-shirt|teilnehmerin\b|course details)/i;
export function feedTitleOk(raw: string): boolean {
  const t = String(raw || "").trim();
  if (!t || t.includes("?")) return false;
  if (/^[\p{Ll}]/u.test(t)) return false; // lower-case start = sentence fragment
  if (/[·:,;|\-–(]\s*$/.test(t) || /,-|\.--|€\s*,/.test(t)) return false; // dangling separators / price-table bits
  if (/\d{4}-\d{2}-\d{2}T/.test(t)) return false;
  if ((t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length || /[—]\s*$/.test(t)) return false; // cut-off titles
  const letters = t.replace(/[^\p{L}]/gu, "");
  if (letters.length > 4 && letters === letters.toUpperCase()) return false; // ALL CAPS headings
  if (NAV.test(t)) return false;
  if (/^(prix|tarifs?|price|preis|preise|tuition fee|fee|à partir de|a partir de|ab|energieaustausch)\b/i.test(t) || /:\s*\//.test(t)) return false; // price-row leftovers
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length === 1 && (letters.length < 9 || GENERIC.has(t.toLowerCase()))) return false;
  return true;
}
function offerScore(o: DirectoryProfile["offers"][number]) {
  const w = o.title.split(/\s+/).length;
  return (typeof o.price === "number" && o.price > 0 ? 2 : 0) + (o.duration ? 1 : 0) + (w >= 2 && w <= 8 ? 1 : 0);
}
const yearLike = (n: number | null) => n != null && n >= 2020 && n <= 2035;

// Dedupe (2026-11-10): every offer once, every provider once.
// - brand: facilitator profiles are joined when their offer images come from the same own website (e.g. the
//   Thai Mai branches wroclaw./gdansk./krakow.thaimai.pl share one menu and one photo set); shared hosting/CDN
//   hosts never join anything. One card per brand keeps the feed mixed.
// - family: brand + title with dates/months/years/numbers removed, so monthly Termine of one offer
//   ("Méditation active d'OSHO® Novembre 2026", "… Décembre 2026") count as one offer; the card shows the next date.
const SHARED_HOST = /(wixstatic|wix|squarespace|squarespace-cdn|sqspcdn|cloudfront|amazonaws|googleusercontent|ggpht|ctfassets|shopify|shopifycdn|myshopify|cdninstagram|fbcdn|imgix|wp\.com|wordpress\.com|jimdo|jimcdn|website-files|webflow|cloudinary|unsplash|pexels|eventbrite|evbuc|ticketmaster|eventim|kajabi|kajabi-cdn|teachable|thinkific|hubspot|hubspotusercontent|mailchimp|mcusercontent|ytimg|vimeocdn|cdn\.|cargocollective|weebly|strikingly|godaddy|img1\.wsimg|ionos|one\.com|site123|webnode|mystrikingly|tilda|tildacdn|framerusercontent|notion|canva|gstatic|bunnycdn|b-cdn|akamai|fastly|cdn77|imagekit|sanity|prismic|storyblok|contentful|ghost\.io|substack|medium|blogger|blogspot|bookinglayer|fresha|treatwell|booksy|setmore|calendly|simplybook|momence|mindbodyonline|eversports|urban-?sports|retreat\.guru|bookretreats|bookyogaretreats|tripaneer)/i;
function siteOf(url: string): string | null {
  let host = "";
  try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
  if (!host || SHARED_HOST.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
  const parts = host.split(".");
  const n = parts.length >= 3 && parts[parts.length - 1].length === 2 && /^(co|com|org|net|gov|ac|edu|or|ne)$/.test(parts[parts.length - 2]) ? 3 : 2;
  return parts.slice(-n).join(".");
}
const MONTHS = "january february march april may june july august september october november december jan feb mar apr jun jul aug sep sept oct nov dec januar februar marz maerz mai juni juli oktober dezember janvier fevrier mars avril juin juillet aout septembre octobre novembre decembre enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre gennaio febbraio aprile maggio giugno luglio settembre ottobre dicembre januari februari maart mei augustus styczen styczna luty lutego marzec marca kwiecien kwietnia maj maja czerwiec czerwca lipiec lipca sierpien sierpnia wrzesien wrzesnia pazdziernik pazdziernika listopad listopada grudzien grudnia montag dienstag mittwoch donnerstag freitag samstag sonntag lundi mardi mercredi jeudi vendredi samedi dimanche monday tuesday wednesday thursday friday saturday sunday termin termine date dates session edition".split(" ");
const MONTH_RE = new RegExp(`\\b(${MONTHS.join("|")})\\b`, "g");
export function titleFamily(title: string): string {
  return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/ł/g, "l").replace(/[®™©*]/g, " ").replace(MONTH_RE, " ")
    .replace(/\d+(st|nd|rd|th|er|e|\.)?/g, " ").replace(/[^\p{L}]+/gu, " ").trim().replace(/\s+/g, " ");
}
function brandKeys(profs: DirectoryProfile[], imgs: Map<string, OfferImage>): Map<string, string> {
  const parent = new Map<string, string>();
  const find = (x: string): string => { let r = x; while (parent.get(r) && parent.get(r) !== r) r = parent.get(r)!; parent.set(x, r); return r; };
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(rb, ra); };
  for (const p of profs) {
    parent.set(`p:${p.slug}`, parent.get(`p:${p.slug}`) || `p:${p.slug}`);
    for (const o of p.offers) {
      const site = o.id ? siteOf(imgs.get(o.id)?.url || "") : null;
      if (!site) continue;
      if (!parent.has(`s:${site}`)) parent.set(`s:${site}`, `s:${site}`);
      union(`s:${site}`, `p:${p.slug}`);
    }
  }
  return new Map(profs.map((p) => [p.slug, find(`p:${p.slug}`)]));
}

type Ref = { p: DirectoryProfile; i: number };
const cache = new Map<string, { at: number; refs: Ref[] }>();
const TTL = 10 * 60 * 1000;

function catTextHit(text: string, cats: string[]): boolean {
  if (!cats.length) return false;
  const t = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return cats.some((c) => ((CAT_SYNONYMS as Record<string, string[]>)[c] || [c]).some((s) => t.includes(s)));
}

function order(list: DirectoryProfile[], seed: number, cats: string[], lang: "de" | "en", imgs: Map<string, OfferImage>): Ref[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // image feed: only offers with their own checked image; dated offers only while upcoming
  const hasImage = (o: DirectoryProfile["offers"][number]) => {
    const im = o.id ? imgs.get(o.id) : undefined;
    if (!im) return false;
    if (im.startsAt) { const t = new Date(im.startsAt).getTime(); if (Number.isFinite(t) && t < today.getTime()) return false; }
    return true;
  };
  const notPast = (o: DirectoryProfile["offers"][number]) => {
    const im = o.id ? imgs.get(o.id) : undefined;
    if (im?.startsAt) { const t = new Date(im.startsAt).getTime(); if (Number.isFinite(t) && t < today.getTime()) return false; }
    return true;
  };
  const catScore = (p: DirectoryProfile, o: DirectoryProfile["offers"][number]) => {
    if (!cats.length) return 0;
    const titleHit = catTextHit(`${o.title} ${o.description || ""}`, cats);
    const nameHit = catTextHit(p.name, cats);
    return (titleHit ? 4 : 0) + (nameHit ? 1 : 0) + (hasImage(o) ? 2 : 0);
  };
  // Default (no category): image-only homepage mix.
  // With a category: also include real directory offers without a unique checked image
  // (SafeImage placeholder on the card), and offers whose title matches the category even
  // if the facilitator is tagged under a neighbouring practice (e.g. Wim Hof under Breathwork).
  const profs = list
    .map((p) => {
      const inCat = !cats.length || p.categories.some((c) => cats.includes(c));
      const offers = p.offers.filter((o) => {
        if (!feedTitleOk(o.title) || !notPast(o)) return false;
        if (!cats.length) return hasImage(o);
        const titleHit = catTextHit(`${o.title} ${o.description || ""} ${p.name}`, cats);
        return inCat || titleHit;
      }).sort((a, b) => (catScore(p, b) + offerScore(b)) - (catScore(p, a) + offerScore(a)));
      return { ...p, offers };
    })
    .filter((p) => p.offers.length);
  // one card per brand: group its offers into families (Termine of one offer), take the next date per family,
  // then the best family (priced + duration + sensible title; seed breaks ties so visits vary)
  const brandOf = brandKeys(profs, imgs);
  const time = (o: DirectoryProfile["offers"][number]) => { const t = o.id ? Date.parse(imgs.get(o.id)?.startsAt || "") : NaN; return Number.isFinite(t) ? t : Infinity; };
  const brands = new Map<string, { fam: Map<string, Ref>; profs: Set<DirectoryProfile> }>();
  for (const p of profs) {
    const b = brandOf.get(p.slug) || `p:${p.slug}`;
    let g = brands.get(b); if (!g) { g = { fam: new Map(), profs: new Set() }; brands.set(b, g); }
    g.profs.add(p);
    p.offers.forEach((o, i) => {
      const f = titleFamily(o.title) || o.title.toLowerCase();
      const cur = g!.fam.get(f);
      if (!cur) { g!.fam.set(f, { p, i }); return; }
      const co = cur.p.offers[cur.i];
      const better = time(o) !== time(co) ? time(o) < time(co) : offerScore(o) > offerScore(co);
      if (better) g!.fam.set(f, { p, i });
    });
  }
  const picks: { ref: Ref; k: number }[] = [];
  for (const [b, g] of brands) {
    const reps = [...g.fam.values()].sort((x, y) => {
      const d = (catScore(y.p, y.p.offers[y.i]) + offerScore(y.p.offers[y.i])) - (catScore(x.p, x.p.offers[x.i]) + offerScore(x.p.offers[x.i]));
      return d || rnd(seed, String(x.p.offers[x.i].id || x.p.slug + x.i)) - rnd(seed, String(y.p.offers[y.i].id || y.p.slug + y.i));
    });
    const ref = reps[0];
    const o = ref.p.offers[ref.i];
    const priced = typeof o.price === "number" && o.price > 0;
    const home = lang === "de" && [...g.profs].some((p) => HOME_DE.has(cc2(p)));
    picks.push({ ref, k: rnd(seed, b) - (priced ? 0.15 : 0) - (home ? 0.2 : 0) });
  }
  picks.sort((a, b) => a.k - b.k);
  return picks.map((x) => x.ref);
}

function toItem({ p, i }: Ref, lang: "de" | "en", cats: string[], imgs: Map<string, OfferImage>, topicSrc?: string): FeedItem {
  const o = p.offers[i];
  const im = o.id ? imgs.get(o.id) : undefined;
  const shown = (cats.find((c) => p.categories.includes(c)) || p.primary || p.categories[0] || "") as string;
  const image = im?.url || topicSrc || "";
  return {
    key: `${p.slug}~${o.id || i}`, title: decodeEntities(o.title), type: String(o.type || "service").toLowerCase().trim(),
    price: typeof o.price === "number" && o.price > 0 && !yearLike(o.price) ? o.price : null,
    currency: typeof o.price === "number" && o.price > 0 && !yearLike(o.price) ? o.currency : null,
    duration: o.duration && /^[1-9]/.test(o.duration) ? o.duration : null, href: `/${p.slug}`, name: p.name,
    city: p.city ? displayPlace(p.city, lang) : null, country: countryName(cc2(p), p.country, lang),
    category: catLabel(shown, lang), element: elementFor(p), avatar: claimedAvatar(p.slug),
    image, startAt: im?.startsAt || null,
    thumb: im?.url && o.id ? `/api/offer-image/${o.id}?v=${imageVersion(im.url)}` : (topicSrc || ""),
  };
}

export function parseFeedCats(raw: string | null | undefined): string[] {
  const valid = CATEGORIES as readonly string[];
  return String(raw || "").split(",").map((s) => s.trim()).filter((c) => valid.includes(c)).slice(0, 4);
}

export async function offerFeedPage(opts: { seed: number; offset: number; per: number; lang: "de" | "en"; cats: string[] }): Promise<FeedPage> {
  const seed = Math.abs(Math.floor(opts.seed)) % 2147483647 || 1;
  const per = Math.min(Math.max(Math.floor(opts.per) || 24, 1), 48);
  const offset = Math.max(0, Math.floor(opts.offset) || 0);
  const k = `${seed}|${opts.lang}|${opts.cats.join(",")}`;
  const imgs = await offerImageIndex();
  let hit = cache.get(k);
  if (!hit || Date.now() - hit.at > TTL) {
    hit = { at: Date.now(), refs: order(await allDirectoryProfiles(), seed, opts.cats, opts.lang, imgs) };
    cache.set(k, hit);
    warmThumbnails(hit.refs.map(({ p, i }) => { const id = p.offers[i]?.id; return (id && imgs.get(id)?.url) || ""; }));
    if (cache.size > 40) { const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0]; if (oldest) cache.delete(oldest[0]); }
  }
  const topicSrc = assignTopicImages(hit.refs.map(({ p, i }) => {
    const o = p.offers[i];
    return {
      id: String(o.id || `${p.slug}-${i}`),
      text: `${o.title || ""} ${o.description || ""} ${p.name} ${(p.categories || []).join(" ")} ${p.primary || ""}`,
    };
  })).map((img) => img.src);
  const slice = hit.refs.slice(offset, offset + per);
  const next = offset + slice.length;
  const items = slice.map((r, n) => {
    const im = r.p.offers[r.i].id ? imgs.get(r.p.offers[r.i].id!) : undefined;
    const fallback = topicSrc[offset + n];
    return toItem(r, opts.lang, opts.cats, imgs, im?.url ? undefined : fallback);
  }).filter((it) => it.image || opts.cats.length);
  return { items, total: hit.refs.length, nextOffset: next < hit.refs.length ? next : null };
}
