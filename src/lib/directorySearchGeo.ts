// Offline gazetteer (GeoNames cities1000, EU, CC-BY 4.0) for geocoding profile cities and query places. Server only.
import { readFileSync } from "fs";
import path from "path";

export type Place = { name: string; cc: string; admin: string; lat: number; lng: number; pop: number; profiles: number };
type Gaz = { places: Place[]; names: Map<string, number[]>; fuzzy: string[] };
let gaz: Gaz | null = null;

export function norm(s: string | null | undefined): string {
  return String(s || "").toLowerCase().replace(/ß/g, "ss").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function load(): Gaz {
  if (gaz) return gaz;
  try {
    const raw = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/places-eu.json"), "utf8")) as { p: [string, string, string, number, number, number, number][]; n: Record<string, number[]> };
    const places = raw.p.map(([name, cc, admin, lat, lng, pop, profiles]) => ({ name, cc, admin, lat, lng, pop, profiles }));
    const names = new Map(Object.entries(raw.n));
    // Names eligible for typo-tolerant matching: places that have profiles or are large.
    const fuzzy = [...names.keys()].filter((n) => n.length >= 4 && names.get(n)!.some((i) => places[i].profiles > 0 || places[i].pop >= 50000));
    gaz = { places, names, fuzzy };
  } catch (e) {
    console.error("[directory-search] gazetteer missing", String((e as Error)?.message || e));
    gaz = { places: [], names: new Map(), fuzzy: [] };
  }
  return gaz;
}

function best(ids: number[], cc?: string | null): Place | null {
  const g = load();
  let list = ids.map((i) => g.places[i]);
  if (cc) list = list.filter((p) => p.cc === cc);
  if (!list.length) return null;
  return list.sort((a, b) => (b.profiles > 0 ? 1 : 0) - (a.profiles > 0 ? 1 : 0) || b.pop - a.pop)[0];
}

/** Geocode a profile city (exact name, then comma/dash parts). */
export function geocodeCity(city: string, cc: string): Place | null {
  const g = load();
  const n = norm(city);
  if (!n) return null;
  const direct = g.names.get(n);
  if (direct) { const p = best(direct, cc); if (p) return p; }
  for (const part of String(city).split(/[,/()\-–]| - /)) {
    const ids = g.names.get(norm(part));
    if (ids) { const p = best(ids, cc); if (p) return p; }
  }
  return null;
}

export function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
      cur[j] = v; if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    pp = prev; prev = cur;
  }
  return prev[b.length];
}

export type PlaceHit = { place: Place; phrase: string; fuzzy: boolean; strong: boolean };
/** Look up a normalized phrase. strong = has profiles or pop >= 20k (safe without a preposition). */
export function lookupPlace(phrase: string, opts: { cc?: string | null; allowFuzzy?: boolean } = {}): PlaceHit | null {
  const g = load();
  const ids = g.names.get(phrase);
  if (ids) {
    const p = best(ids, opts.cc) || best(ids);
    if (p) return { place: p, phrase, fuzzy: false, strong: p.profiles > 0 || p.pop >= 20000 };
  }
  if (opts.allowFuzzy && phrase.length >= 5) {
    const max = phrase.length >= 9 ? 2 : 1;
    let hit: { n: string; d: number; p: Place } | null = null;
    for (const n of g.fuzzy) {
      if (Math.abs(n.length - phrase.length) > max || n[0] !== phrase[0]) continue;
      const d = lev(phrase, n, max);
      if (d <= max) {
        const p = best(g.names.get(n)!, opts.cc) || best(g.names.get(n)!);
        if (p && (!hit || d < hit.d || (d === hit.d && p.profiles + p.pop / 1e5 > hit.p.profiles + hit.p.pop / 1e5))) hit = { n, d, p };
      }
    }
    if (hit) return { place: hit.p, phrase: hit.n, fuzzy: true, strong: true };
  }
  return null;
}

// German exonyms for gazetteer (English) place names in German UI text.
const DE_NAMES: Record<string, string> = { Munich: "München", Vienna: "Wien", Cologne: "Köln", Zurich: "Zürich", Geneva: "Genf", Copenhagen: "Kopenhagen", Lisbon: "Lissabon", Prague: "Prag", Rome: "Rom", Milan: "Mailand", Brussels: "Brüssel", Warsaw: "Warschau", Nuremberg: "Nürnberg", Hanover: "Hannover", Athens: "Athen", Venice: "Venedig", Florence: "Florenz", Naples: "Neapel", Gothenburg: "Göteborg", Lucerne: "Luzern", Basle: "Basel", Antwerp: "Antwerpen", "The Hague": "Den Haag", Belgrade: "Belgrad", Bucharest: "Bukarest", Krakow: "Krakau", Turin: "Turin", Seville: "Sevilla", Thessaloniki: "Thessaloniki" };
export function displayPlace(name: string, lang: string) { return lang === "de" ? DE_NAMES[name] || name : name; }
