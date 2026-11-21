// Rule-based intent parser for the directory search (always available, no LLM needed).
import { CATEGORIES, CAT_SYNONYMS, PRACTICES, SOFT_PRACTICES, NEEDS, COUNTRIES, REGIONS, STOP, CAT_EXPAND, type Category } from "./directorySearchVocab";
import { norm, lookupPlace, lev, type Place } from "./directorySearchGeo";

export type Intent = {
  language: string;
  categories: Category[];          // hard filter (any of)
  explicitCats: boolean;           // user named a category/practice (vs. inferred from a need)
  requiredTerms: string[];         // must match profile text: one entry per practice, alternatives joined by '|'
  softTerms: string[];             // boost only
  keywords: string[];              // leftover words (names, free text)
  practices: string[];
  needs: boolean;
  place: { name: string; cc: string; admin: string; lat: number; lng: number; profiles: number; pop: number; fuzzy: boolean; weak?: boolean } | null;
  region: { cc: string; admin: string; label: string } | null;
  countryCode: string | null;
  unknownPlace: string | null;
  dateFrom: string | null; dateTo: string | null; dateLabel: string | null;
  maxPrice: number | null; cheap: boolean;
  source: "rules" | "rules+llm";
};

type Entry = { kind: "cat" | "practice" | "need" | "country" | "region"; key: string; words: number };
let dict: Map<string, Entry[]> | null = null;
let fuzzyWords: { w: string; e: Entry }[] | null = null;
function vocab() {
  if (dict) return dict;
  dict = new Map();
  const add = (phrase: string, e: Omit<Entry, "words">) => {
    const p = norm(phrase); if (!p) return;
    const arr = dict!.get(p) || []; arr.push({ ...e, words: p.split(" ").length }); dict!.set(p, arr);
  };
  for (const pr of PRACTICES) for (const m of pr.match) add(m, { kind: "practice", key: pr.id });
  for (const c of CATEGORIES) { add(c, { kind: "cat", key: c }); for (const s of CAT_SYNONYMS[c]) add(s, { kind: "cat", key: c }); }
  NEEDS.forEach((n, i) => n.match.forEach((m) => add(m, { kind: "need", key: String(i) })));
  for (const [cc, names] of Object.entries(COUNTRIES)) for (const n of names) add(n, { kind: "country", key: cc });
  for (const r of Object.keys(REGIONS)) add(r, { kind: "region", key: r });
  fuzzyWords = [];
  for (const [p, es] of dict) if (!p.includes(" ") && p.length >= 5) for (const e of es) fuzzyWords.push({ w: p, e });
  return dict;
}
const PRIO: Record<Entry["kind"], number> = { practice: 5, cat: 4, region: 3, country: 2, need: 1 };

const PREP = new Set(["in", "im", "bei", "near", "nahe", "um", "around", "a", "en", "nach", "aus", "rund", "nearby", "te", "op", "w", "i", "na"]);

export function detectLanguage(q: string): string {
  const n = " " + norm(q) + " ";
  const score = (re: RegExp) => (n.match(re) || []).length;
  const de = score(/ (ich|und|oder|suche|bitte|mit|fur|gegen|wochenende|am|im|eine?n?|nachste|heute|morgen|kurs|unter|bis|nahe|schweiz|eisbaden|deutschland|was|wo|gibt|es) /g) + (/[äöüß]/i.test(q) ? 2 : 0);
  const fr = score(/ (je|et|pour|avec|le|la|les|des|pres|cherche|ce|week end|suisse|seance) /g) + (/[éèêàç]/i.test(q) ? 1 : 0);
  const nl = score(/ (ik|en|voor|met|het|een|zoek|bij|dit|weekend|in de buurt) /g);
  const es = score(/ (yo|y|para|con|el|los|las|busco|cerca|fin de semana) /g) + (/[ñ¿¡]/i.test(q) ? 2 : 0);
  const it = score(/ (io|per|con|il|gli|cerco|vicino|fine settimana) /g);
  const en = score(/ (i|and|for|with|the|near|looking|this|weekend|under|in|against|cheap|best) /g);
  const best = Object.entries({ de, en, fr, nl, es, it }).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "de";
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const MONTHS: [RegExp, number][] = [[/\b(januar|january|janvier|januari|enero|gennaio|jan)\b/, 0], [/\b(februar|february|fevrier|februari|febrero|feb)\b/, 1], [/\b(marz|maerz|march|mars|maart|marzo)\b/, 2], [/\b(april|avril|abril|aprile)\b/, 3], [/\b(mai|may|mei|mayo|maggio)\b/, 4], [/\b(juni|june|juin|junio|giugno)\b/, 5], [/\b(juli|july|juillet|julio|luglio)\b/, 6], [/\b(august|aout|augustus|agosto)\b/, 7], [/\b(september|septembre|septiembre|settembre|sept)\b/, 8], [/\b(oktober|october|octobre|octubre|ottobre|okt)\b/, 9], [/\b(november|novembre|noviembre|nov)\b/, 10], [/\b(dezember|december|decembre|diciembre|dicembre|dez)\b/, 11]];

export function parseDate(n: string, now = new Date()): { from: Date; to: Date; label: string; consumed: RegExp } | null {
  const today = startOfDay(now);
  if (/\b(wochenende|weekend|week end|fin de semana|fine settimana|helg|weekendu)\b/.test(n)) {
    const dow = today.getDay(); // 0 Sun .. 6 Sat
    const sat = dow === 6 ? today : dow === 0 ? addDays(today, -1) : addDays(today, 6 - dow);
    const next = /\b(nachste|naechste|next|kommende|prochain|volgend)/.test(n) && dow !== 6 && dow !== 0 ? sat : sat;
    return { from: dow === 0 ? today : next, to: addDays(sat, 2), label: "weekend", consumed: /\b(am |this |dieses |diesem |ce |dit )?(nachste|naechste|next|kommende)?\s?(wochenende|weekend|week end|fin de semana|fine settimana)\b/g };
  }
  if (/\b(heute|today|tonight|aujourd hui|vandaag|hoy|oggi)\b/.test(n)) return { from: today, to: addDays(today, 1), label: "today", consumed: /\b(heute|today|tonight|aujourd hui|vandaag|hoy|oggi)( abend)?\b/g };
  if (/\b(morgen|tomorrow|demain|manana|domani)\b/.test(n) && !/\bmorgens\b/.test(n)) return { from: addDays(today, 1), to: addDays(today, 2), label: "tomorrow", consumed: /\b(morgen|tomorrow|demain|manana|domani)\b/g };
  if (/\b(nachste|naechste|next|kommende|prochaine|volgende) (woche|week|semaine)\b/.test(n)) { const mon = addDays(today, ((8 - today.getDay()) % 7) || 7); return { from: mon, to: addDays(mon, 7), label: "next week", consumed: /\b(nachste|naechste|next|kommende|prochaine|volgende) (woche|week|semaine)\b/g }; }
  if (/\b(diese|this|cette|deze) (woche|week|semaine)\b/.test(n)) { const mon = addDays(today, ((8 - today.getDay()) % 7) || 7); return { from: today, to: mon, label: "this week", consumed: /\b(diese|this|cette|deze) (woche|week|semaine)\b/g }; }
  const dm = n.match(/\b(\d{1,2}) (\d{1,2})(?: (\d{2,4}))?\b/);
  for (const [re, m] of MONTHS) if (re.test(n)) {
    let y = today.getFullYear(); if (m < today.getMonth()) y += 1;
    const from = new Date(y, m, 1); return { from: from < today ? today : from, to: new Date(y, m + 1, 1), label: "month", consumed: new RegExp(re.source, "g") };
  }
  if (dm && Number(dm[1]) <= 31 && Number(dm[2]) <= 12 && /\d{1,2}\.\d{1,2}/.test(n.replace(/ /g, "."))) {
    let y = dm[3] ? Number(dm[3].length === 2 ? "20" + dm[3] : dm[3]) : today.getFullYear();
    let from = new Date(y, Number(dm[2]) - 1, Number(dm[1])); if (!dm[3] && from < today) from = new Date(y + 1, Number(dm[2]) - 1, Number(dm[1]));
    return { from, to: addDays(from, 1), label: "date", consumed: /\b\d{1,2} \d{1,2}( \d{2,4})?\b/g };
  }
  return null;
}

export function parsePrice(raw: string): { max: number | null; cheap: boolean; consumed: RegExp[] } {
  const n = norm(raw.replace(/€/g, " eur ").replace(/£/g, " gbp ").replace(/\$/g, " usd "));
  const out = { max: null as number | null, cheap: false, consumed: [] as RegExp[] };
  const m = n.match(/\b(unter|bis|max|maximal|hochstens|hoechstens|under|below|less than|up to|max\.?|moins de|jusqu a|onder|tot|hasta|menos de|sotto|fino a)\s*(\d{1,5})\b/) || n.match(/\b(\d{1,5})\s*(eur|euro|euros|chf|gbp|franken|pfund|pounds?)\b/);
  if (m) { out.max = Number(m[2] && /^\d+$/.test(m[2]) ? m[2] : m[1]); out.consumed.push(/\b(unter|bis|max|maximal|hochstens|hoechstens|under|below|less than|up to|moins de|jusqu a|onder|tot|hasta|menos de|sotto|fino a)?\s*\d{1,5}\s*(eur|euro|euros|chf|gbp|franken|pfund|pounds?|usd)?\b/g); }
  if (/\b(kostenlos|gratis|free|umsonst|gratuit|gratuito|kosteloos)\b/.test(n)) { out.max = 0; out.consumed.push(/\b(kostenlos|gratis|free|umsonst|gratuit|gratuito|kosteloos)\b/g); }
  if (/\b(gunstig|guenstig|billig|cheap|affordable|preiswert|bon marche|goedkoop|barato|economico)\b/.test(n)) { out.cheap = true; out.consumed.push(/\b(gunstig|guenstig|billig|cheap|affordable|preiswert|goedkoop|barato|economico)e?n?\b/g); }
  return out;
}

export function parseRules(query: string, now = new Date()): Intent {
  const d = vocab();
  const language = detectLanguage(query);
  const price = parsePrice(query);
  let n = norm(query.replace(/€/g, " eur ").replace(/£/g, " gbp "));
  const date = parseDate(n, now);
  if (date) n = n.replace(date.consumed, " ");
  for (const re of price.consumed) n = n.replace(re, " ");
  const tokens = n.split(" ").filter(Boolean);
  const used = new Array(tokens.length).fill(false);
  const hits: { e: Entry; start: number; len: number; fuzzy?: boolean }[] = [];

  // 1) vocabulary n-grams, longest first
  for (let len = 4; len >= 1; len--) {
    for (let i = 0; i + len <= tokens.length; i++) {
      if (used.slice(i, i + len).some(Boolean)) continue;
      const es = d.get(tokens.slice(i, i + len).join(" "));
      if (!es) continue;
      const e = [...es].sort((a, b) => PRIO[b.kind] - PRIO[a.kind])[0];
      // single "in"-like tokens or stop words never match vocab
      hits.push({ e, start: i, len }); for (let k = i; k < i + len; k++) used[k] = true;
      // a practice phrase that is also a category synonym (e.g. "massage") counts as both
      for (const other of es) if (other !== e && other.kind === "cat") hits.push({ e: other, start: i, len });
    }
  }
  // 2) places (exact) on remaining n-grams: collect candidates, prefer after a preposition, then strong places, then longer phrases
  let place: Intent["place"] = null; let unknownPlace: string | null = null;
  const country = hits.find((h) => h.e.kind === "country")?.e.key || null;
  const regionHit = hits.find((h) => h.e.kind === "region");
  {
    const cands: { h: NonNullable<ReturnType<typeof lookupPlace>>; i: number; len: number; score: number }[] = [];
    for (let len = 3; len >= 1; len--) {
      for (let i = 0; i + len <= tokens.length; i++) {
        if (used.slice(i, i + len).some(Boolean)) continue;
        const words = tokens.slice(i, i + len);
        if (STOP.has(words[0]) || STOP.has(words[words.length - 1])) continue;
        const phrase = words.join(" ");
        if (phrase.length < 3 || /^\d+$/.test(phrase)) continue;
        const afterPrep = i > 0 && PREP.has(tokens[i - 1]);
        const h = lookupPlace(phrase, { cc: country });
        if (!h || !(h.strong || afterPrep) || (country && h.place.cc !== country)) continue;
        cands.push({ h, i, len, score: (afterPrep ? 4 : 0) + (h.place.profiles > 0 ? 2 : 0) + Math.log10(h.place.pop + 10) / 3 + len + i * 0.05 });
      }
    }
    cands.sort((x, y) => y.score - x.score);
    if (cands[0]) { const c = cands[0]; place = { ...c.h.place, fuzzy: false, weak: !c.h.strong }; for (let k = c.i; k < c.i + c.len; k++) used[k] = true; }
  }
  // 3) fuzzy vocabulary for unknown words (typos)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (used[i] || t.length < 5 || STOP.has(t)) continue;
    const max = t.length >= 9 ? 2 : 1;
    let best: { w: string; e: Entry; d: number } | null = null;
    for (const fw of fuzzyWords!) {
      if (Math.abs(fw.w.length - t.length) > max) continue;
      const dd = lev(t, fw.w, max);
      if (dd <= max && (!best || dd < best.d || (dd === best.d && PRIO[fw.e.kind] > PRIO[best.e.kind]))) best = { ...fw, d: dd };
    }
    if (best) { hits.push({ e: best.e, start: i, len: 1, fuzzy: true }); used[i] = true; }
  }
  // 4) fuzzy places (typos like "Hamburgh", "Muenchn")
  if (!place) {
    for (let i = 0; i < tokens.length && !place; i++) {
      const t = tokens[i];
      if (used[i] || t.length < 5 || STOP.has(t)) continue;
      const h = lookupPlace(t, { cc: country, allowFuzzy: true });
      if (h && (!country || h.place.cc === country)) { place = { ...h.place, fuzzy: h.fuzzy }; used[i] = true; }
    }
  }
  // 5) unknown place after a preposition ("in Atlantis")
  for (let i = 1; i < tokens.length; i++) {
    if (!used[i] && PREP.has(tokens[i - 1]) && !STOP.has(tokens[i]) && tokens[i].length >= 3 && !place && !country && !regionHit) { unknownPlace = tokens.slice(i, i + 2).filter((t, k) => !used[i + k] && !STOP.has(t)).join(" "); for (let k = i; k < i + 2 && k < tokens.length; k++) if (!STOP.has(tokens[k])) used[k] = true; break; }
  }

  const cats = new Set<Category>(); const req = new Set<string>(); const soft = new Set<string>(); const practices: string[] = [];
  let needs = false; const needCats = new Set<Category>();
  const practiceCats = new Set<Category>();
  for (const h of hits) {
    if (h.e.kind === "cat") cats.add(h.e.key as Category);
    if (h.e.kind === "practice") {
      const p = PRACTICES.find((x) => x.id === h.e.key)!; practices.push(p.id);
      if (SOFT_PRACTICES.has(p.id)) p.terms.forEach((t) => soft.add(t)); else req.add(p.terms.join("|"));
    }
    if (h.e.kind === "need") { needs = true; const nd = NEEDS[Number(h.e.key)]; nd.cats.forEach((c) => needCats.add(c)); nd.terms.forEach((t) => soft.add(t)); }
  }
  // A practice that is also a category synonym (cacao -> Spiritual Growth, reiki...) should not hard-filter on that category.
  for (const h of hits) if (h.e.kind === "practice") {
    const p = PRACTICES.find((x) => x.id === h.e.key)!;
    if (!p.cats) for (const c of [...cats]) if (CAT_SYNONYMS[c].some((s) => p.match.map(norm).includes(norm(s)))) cats.delete(c);
  }
  const massage = PRACTICES.find((x) => x.id === "massage")!;
  const otherPractice = hits.some((h) => h.e.kind === "practice" && h.e.key !== "massage");
  const otherCat = hits.some((h) => h.e.kind === "cat" && !massage.match.map(norm).includes(norm(tokens.slice(h.start, h.start + h.len).join(" "))));
  if (practices.includes("massage") && (otherPractice || otherCat)) {
    req.delete(massage.terms.join("|")); massage.terms.forEach((t) => soft.add(t));
    if (otherPractice || otherCat) { cats.delete("BodyWork"); if (!otherCat && !hits.some((h) => h.e.kind === "practice" && h.e.key !== "massage" && PRACTICES.find((x) => x.id === h.e.key)?.cats)) { /* keep only the other practice */ } }
  } else if (practices.includes("massage")) practiceCats.add("BodyWork");
  for (const pid of practices) { const pr = PRACTICES.find((x) => x.id === pid)!; if (pr.id !== "massage") pr.cats?.forEach((c) => practiceCats.add(c)); }
  practiceCats.forEach((c) => cats.add(c));
  const explicitCats = cats.size > 0 || req.size > 0;
  if (!explicitCats && needs) needCats.forEach((c) => cats.add(c));
  const expanded = new Set<Category>();
  cats.forEach((c) => (CAT_EXPAND[c] || [c]).forEach((x) => expanded.add(x)));

  const keywords = tokens.filter((t, i) => !used[i] && !STOP.has(t) && t.length >= 3 && !/^\d+$/.test(t));
  const region = regionHit ? { cc: REGIONS[regionHit.e.key][0], admin: REGIONS[regionHit.e.key][1], label: regionHit.e.key } : null;
  return {
    language, categories: [...expanded], explicitCats, requiredTerms: [...req], softTerms: [...soft], keywords, practices, needs,
    place, region, countryCode: region?.cc || country || place?.cc || null, unknownPlace,
    dateFrom: date ? date.from.toISOString() : null, dateTo: date ? date.to.toISOString() : null, dateLabel: date?.label || null,
    maxPrice: price.max, cheap: price.cheap, source: "rules",
  };
}

/** Is the rule parse good enough to skip the LLM? */
export function ruleParseConfident(i: Intent): boolean {
  const hasWhat = i.categories.length > 0 || i.requiredTerms.length > 0;
  const hasLeftovers = i.keywords.length > 0 || Boolean(i.unknownPlace) || Boolean(i.place?.weak) || Boolean(i.place?.fuzzy);
  return hasWhat && !hasLeftovers;
}
export type { Place };
