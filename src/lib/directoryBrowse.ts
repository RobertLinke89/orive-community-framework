// /facilitators listing + category blocks + "similar" links. Server only. Reads the same live profile list the
// [username] route serves (removed + hidden profiles excluded). Free-text queries go through the AI search.
import { allDirectoryProfiles, type DirectoryProfile } from "@/lib/directorySample";
import { searchDirectory, type SearchCard } from "@/lib/directorySearch";
import { CATEGORIES, CAT_LABEL, type Category } from "@/lib/directorySearchVocab";
import { geocodeCity, lookupPlace, norm, displayPlace, type Place } from "@/lib/directorySearchGeo";
import { claimedAvatar, countryName, elementFor } from "@/lib/directoryAvatar";
import { fromPrice } from "@/lib/directoryPrice";

export type BrowseCard = SearchCard;
export type BrowseFilters = { q?: string; cat?: string; city?: string; radius?: number; cc?: string; offers?: boolean; page?: number; per?: number; lang?: "de" | "en" };
export type BrowseResult = {
  cards: BrowseCard[]; total: number; page: number; pages: number; per: number;
  mode: "list" | "search"; place: { name: string; cc: string } | null; unknownCity: boolean; searchText: string | null;
};

export const DIR_CATEGORIES = CATEGORIES as readonly Category[];
export function catLabel(c: string, lang: "de" | "en" = "de") { return (CAT_LABEL[lang] as Record<string, string>)[c] || c; }
const ISO2: Record<string, string> = { UK: "GB" };
const cc2 = (p: DirectoryProfile) => (ISO2[p.countryCode] || p.countryCode || "").toUpperCase();

type Geo = { lat: number; lng: number } | null;
const geoCache = new Map<string, Geo>();
function geoOf(p: DirectoryProfile): Geo {
  const k = `${p.city}|${cc2(p)}`;
  if (geoCache.has(k)) return geoCache.get(k)!;
  const g = p.city ? geocodeCity(p.city, cc2(p)) : null;
  const v = g ? { lat: g.lat, lng: g.lng } : null;
  geoCache.set(k, v);
  return v;
}
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function rank(p: DirectoryProfile) {
  const priced = p.offers.some((o) => typeof o.price === "number" && o.price > 0);
  return (p.offers.length ? 4 : 0) + (priced ? 2 : 0) + (p.city ? 1 : 0) + Math.min(p.offers.length, 8) / 10;
}
const HOME: Record<"de" | "en", Set<string>> = { de: new Set(["DE", "AT", "CH"]), en: new Set() };
// Deterministic shuffle key (stable order across pages, but no alphabetical "A…" wall and no fixed big-studio block).
function hash(s: string) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function firstOffer(p: DirectoryProfile) {
  if (!p.offers.length) return null;
  const o = p.offers.find((x) => typeof x.price === "number" && x.price > 0) || p.offers[0];
  return { title: o.title, price: o.price ?? null, currency: o.currency ?? null, date: null };
}
export function toCard(p: DirectoryProfile, lang: "de" | "en", shownCat?: string | null, distanceKm: number | null = null): BrowseCard {
  const shown = (shownCat && p.categories.includes(shownCat) ? shownCat : p.primary || p.categories[0] || "") as string;
  return {
    slug: p.slug, href: `/${p.slug}`, name: p.name, city: p.city ? displayPlace(p.city, lang) : null, country: countryName(cc2(p), p.country, lang),
    category: catLabel(shown, lang), categories: p.categories.map((c) => catLabel(c, lang)), offer: firstOffer(p),
    offerCount: p.offers.length, distanceKm: distanceKm != null ? Math.round(distanceKm) : null, reason: null,
    element: elementFor(p), avatar: claimedAvatar(p.slug), fromPrice: fromPrice(p.offers),
  };
}

export async function directoryCount() { return (await allDirectoryProfiles()).length; }

/** Countries (ISO2) and categories with counts, for the filter selects. */
export async function facets() {
  const list = await allDirectoryProfiles();
  const countries = new Map<string, { code: string; name: string; n: number }>();
  const cats = new Map<string, number>();
  for (const p of list) {
    const c = cc2(p);
    if (c) { const e = countries.get(c) || { code: c, name: p.country || c, n: 0 }; e.n++; countries.set(c, e); }
    for (const k of p.categories) cats.set(k, (cats.get(k) || 0) + 1);
  }
  return {
    total: list.length,
    countries: [...countries.values()].sort((a, b) => b.n - a.n),
    categories: DIR_CATEGORIES.map((c) => ({ id: c, n: cats.get(c) || 0 })).filter((c) => c.n > 0),
  };
}

function resolvePlace(city: string, cc?: string): Place | null {
  const hit = lookupPlace(city, { cc: cc || null, allowFuzzy: true });
  return hit?.place || null;
}

export async function browse(f: BrowseFilters): Promise<BrowseResult> {
  const lang = f.lang === "en" ? "en" : "de";
  const per = Math.min(Math.max(f.per || 24, 1), 60);
  const page = Math.max(1, Math.floor(f.page || 1));
  const cat = f.cat && (DIR_CATEGORIES as readonly string[]).includes(f.cat) ? f.cat : "";
  const cc = (f.cc || "").toUpperCase().slice(0, 2);
  const city = (f.city || "").trim().slice(0, 80);
  const radius = [0, 10, 25, 50, 100].includes(Number(f.radius)) ? Number(f.radius) : 25;
  const q = (f.q || "").trim().slice(0, 200);
  const list = await allDirectoryProfiles();
  const bySlug = new Map(list.map((p) => [p.slug, p]));

  const place = city ? resolvePlace(city, cc) : null;
  const passFilters = (p: DirectoryProfile, dist: number | null) => {
    if (cat && !p.categories.includes(cat)) return false;
    if (cc && cc2(p) !== cc) return false;
    if (f.offers && !p.offers.length) return false;
    if (city) {
      if (norm(p.city) === norm(city) || (place && norm(p.city) === norm(place.name))) return true;
      if (place && radius > 0 && dist != null && dist <= radius) return true;
      return false;
    }
    return true;
  };
  const distOf = (p: DirectoryProfile) => { if (!place) return null; const g = geoOf(p); return g ? km(place, g) : null; };

  if (q) {
    // Free text: the hero AI search (rules first, free LLM tiers only when needed), UI filters applied on top.
    const composed = [q, cat && !norm(q).includes(norm(catLabel(cat, "de"))) ? catLabel(cat, lang) : "", city && !norm(q).includes(norm(city)) ? city : ""].filter(Boolean).join(" ");
    const r = await searchDirectory(composed, { llm: true, rerank: false, languageHint: lang }).catch(() => null);
    const seen = new Set<string>();
    const cards: BrowseCard[] = [];
    for (const c of [...(r?.cards || []), ...(r?.alternatives || []).flatMap((a) => a.cards)]) {
      if (seen.has(c.slug)) continue; seen.add(c.slug);
      const p = bySlug.get(c.slug); if (!p) continue;
      if (cat && !p.categories.includes(cat)) continue;
      if (cc && cc2(p) !== cc) continue;
      if (f.offers && !p.offers.length) continue;
      cards.push(c);
    }
    const pages = Math.max(1, Math.ceil(cards.length / per));
    return { cards: cards.slice((page - 1) * per, page * per), total: cards.length, page, pages, per, mode: "search", place: place ? { name: displayPlace(place.name, lang), cc: place.cc } : null, unknownCity: Boolean(city && !place), searchText: r?.text || null };
  }

  const rows: { p: DirectoryProfile; d: number | null }[] = [];
  for (const p of list) { const d = city ? distOf(p) : null; if (passFilters(p, d)) rows.push({ p, d }); }
  const home = HOME[lang];
  const score = (p: DirectoryProfile) => Math.floor(rank(p)) + (home.has(cc2(p)) ? 3 : 0);
  rows.sort((a, b) => (city ? (a.d ?? 1e6) - (b.d ?? 1e6) : 0) || score(b.p) - score(a.p) || hash(a.p.slug) - hash(b.p.slug));
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const slice = rows.slice((page - 1) * per, page * per);
  return {
    cards: slice.map(({ p, d }) => toCard(p, lang, cat || null, d)), total: rows.length, page: Math.min(page, pages), pages, per,
    mode: "list", place: place ? { name: displayPlace(place.name, lang), cc: place.cc } : null, unknownCity: Boolean(city && !place), searchText: null,
  };
}

/** Top profiles of one category (with offers first), optionally near a city. */
export async function topInCategory(cats: string[], lang: "de" | "en", limit = 8, city?: string) {
  const list = await allDirectoryProfiles();
  const valid = cats.filter((c) => (DIR_CATEGORIES as readonly string[]).includes(c));
  const place = city ? resolvePlace(city) : null;
  const rows = list.filter((p) => !valid.length || p.categories.some((c) => valid.includes(c)))
    .map((p) => { const g = place ? geoOf(p) : null; return { p, d: place && g ? km(place, g) : null }; })
    .filter((x) => !place || (x.d != null && x.d <= 100));
  // Stable but varied: rank, then a slug hash so the same few big studios don't always lead.
  const home = HOME[lang];
  const score = (p: DirectoryProfile) => Math.floor(rank(p)) + (home.has(cc2(p)) ? 3 : 0);
  rows.sort((a, b) => (place ? (a.d ?? 1e6) - (b.d ?? 1e6) : 0) || score(b.p) - score(a.p) || hash(a.p.slug) - hash(b.p.slug));
  const total = place ? rows.length : list.filter((p) => !valid.length || p.categories.some((c) => valid.includes(c))).length;
  return { cards: rows.slice(0, limit).map(({ p, d }) => toCard(p, lang, valid[0] || null, d)), total, place: place ? displayPlace(place.name, lang) : null };
}

/** Similar facilitators for a profile page: same city (same category first), then nearby, then same category in the country. */
export async function similarTo(p: DirectoryProfile, limit = 6, uiLang?: "de" | "en") {
  const lang: "de" | "en" = uiLang ?? (p.lang === "de" ? "de" : "en");
  const list = (await allDirectoryProfiles()).filter((x) => x.slug !== p.slug);
  const me = geoOf(p);
  const primary = p.primary || p.categories[0];
  const scored = list.map((x) => {
    const sameCity = Boolean(p.city) && norm(x.city) === norm(p.city);
    const g = me ? geoOf(x) : null; const d = me && g ? km(me, g) : null;
    const sameCat = x.categories.includes(primary);
    const overlap = x.categories.filter((c) => p.categories.includes(c)).length;
    const near = d != null && d <= 50;
    // same category in the same city > same category nearby > same city > nearby > same category in the country
    let s: number;
    if (sameCat && sameCity) s = 300; else if (sameCat && near) s = 250 - d!; else if (sameCity) s = 150; else if (near) s = 100 - d!; else if (sameCat && cc2(x) === cc2(p)) s = 20; else return null;
    s += overlap * 5 + rank(x);
    return { x, s, d };
  }).filter(Boolean) as { x: DirectoryProfile; s: number; d: number | null }[];
  scored.sort((a, b) => b.s - a.s || a.x.name.localeCompare(b.x.name));
  return scored.slice(0, limit).map(({ x, d }) => toCard(x, lang, primary, d));
}
