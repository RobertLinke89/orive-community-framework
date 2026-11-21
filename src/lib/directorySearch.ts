// Directory AI search: intent (rules, LLM when needed) -> Postgres FTS/trigram RPC with hard filters -> live-profile check
// -> optional LLM rerank + grounded summary. Free tiers only (llmChain). Never invents prices, dates or ratings.
import { getDirectoryProfile, type DirectoryProfile } from "@/lib/directorySample";
import { runLlmChain } from "@/lib/llmChain";
import { CATEGORIES, CAT_LABEL, RELATED, COUNTRIES, REGIONS, CAT_EXPAND, catWords, type Category } from "./directorySearchVocab";
import { parseRules, ruleParseConfident, type Intent } from "./directorySearchParse";
import { lookupPlace, norm, displayPlace } from "./directorySearchGeo";
import { rest, maybeSyncInBackground } from "./directorySearchSync";
import { claimedAvatar, countryName, elementFor } from "./directoryAvatar";
import { fromPrice, type FromPrice } from "./directoryPrice";
import type { ElementKey } from "@/components/directory/elements";

export type SearchCard = {
  slug: string; href: string; name: string; city: string | null; country: string | null; category: string; categories: string[];
  offer: { title: string; price: number | null; currency: string | null; date: string | null } | null;
  offerCount: number; distanceKm: number | null; reason: string | null;
  element?: ElementKey; avatar?: string | null;
  fromPrice?: FromPrice | null;
};
export type SearchAlternative = { label: string; query: string; cards: SearchCard[] };
export type DirectorySearchResult = {
  query: string; language: string; intent: Intent; cards: SearchCard[]; total: number; alternatives: SearchAlternative[];
  text: string; provider: string | null; timings: Record<string, number>; widened: string | null;
};

type RpcRow = { slug: string; score: number; distance_km: number | null; text_rank: number; cat_match: boolean; term_match: boolean; date_match: boolean };
type Params = { req: string[]; terms: string[]; cats: string[]; cc?: string | null; region?: string | null; city?: string | null; lat?: number | null; lng?: number | null; radius?: number | null; maxPrice?: number | null; from?: string | null; to?: string | null; limit?: number };

async function rpc(p: Params): Promise<RpcRow[]> {
  const r = await rest("rpc/directory_search_query", { method: "POST", body: JSON.stringify({
    p_req: p.req, p_terms: p.terms, p_categories: p.cats, p_cat_terms: [...new Set(p.cats.flatMap((c) => catWords(c as Category)))], p_cc: p.cc ?? null, p_region: p.region ?? null, p_city: p.city ?? null,
    p_lat: p.lat ?? null, p_lng: p.lng ?? null, p_radius_km: p.radius ?? null, p_max_price: p.maxPrice ?? null, p_date_from: p.from ?? null, p_date_to: p.to ?? null, p_limit: p.limit ?? 40,
  }) }, 8000);
  if (!r.ok) throw new Error(`directory_search_query ${r.status} ${(await r.text()).slice(0, 200)}`);
  return (await r.json()) as RpcRow[];
}

type Extra = { slug: string; dates: string[]; offers: { id: string | null; starts_at: string | null }[] };
async function extras(slugs: string[]): Promise<Map<string, Extra>> {
  if (!slugs.length) return new Map();
  const r = await rest(`directory_search?select=slug,dates,offers&slug=in.(${slugs.map((s) => `"${s}"`).join(",")})`, {}, 6000).catch(() => null);
  if (!r || !r.ok) return new Map();
  return new Map(((await r.json()) as Extra[]).map((e) => [e.slug, e]));
}

// ---------- LLM intent extraction ----------
function parseJson<T>(text: string): T | null {
  const m = text.match(/\{[\s\S]*\}/); if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}
type LlmIntent = { categories?: string[]; practice_keywords?: string[]; keywords?: string[]; city?: string | null; region?: string | null; country_code?: string | null; max_price?: number | null; language?: string };
async function llmIntent(query: string): Promise<LlmIntent | null> {
  const system = `You convert a wellbeing search query (any language, may contain typos) into JSON for a directory of practitioners in Europe.
Allowed categories (use exact spelling, only when clearly asked or clearly implied): ${CATEGORIES.join(", ")}.
Return ONLY JSON: {"categories":[],"practice_keywords":[],"keywords":[],"city":null,"region":null,"country_code":null,"max_price":null,"language":"de"}
- practice_keywords: specific practices named (e.g. "yin", "reiki", "cacao", "tantra", "shiatsu"), lowercase, in English AND the original language.
- keywords: other content words useful for full-text search (needs like "stress", "sleep", names of studios), lowercase, translated to English and German.
- city: the city/town as commonly written in English or local language, typos fixed. region: state/province/island if named. country_code: ISO-3166 alpha-2 (UK=GB) if a country is named or implied by the city.
- max_price: number if a price limit is given. language: ISO 639-1 of the query.
Never guess a city that is not in the query.`;
  const res = await runLlmChain(system, `Query: ${query}`).catch(() => null);
  if (!res) return null;
  return parseJson<LlmIntent>(res.text);
}

function mergeLlm(rule: Intent, l: LlmIntent): Intent {
  const out: Intent = { ...rule, source: "rules+llm" };
  const cats = (l.categories || []).filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c));
  if (!rule.categories.length && cats.length && !rule.requiredTerms.length) {
    const exp = new Set<Category>(); cats.forEach((c) => (CAT_EXPAND[c] || [c]).forEach((x) => exp.add(x)));
    out.categories = [...exp]; out.explicitCats = true;
  }
  const kw = [...(l.practice_keywords || []), ...(l.keywords || [])].map((k) => norm(k)).filter((k) => k.length >= 3).slice(0, 12);
  if (kw.length) out.softTerms = [...new Set([...rule.softTerms, ...kw])];
  if (rule.place?.weak) {
    // weak rule match (tiny place without profiles, e.g. "Gotham" in "Gotham City"): keep it only if the LLM names the same place
    const same = l.city && lookupPlace(norm(l.city), { cc: rule.place.cc })?.place.name === rule.place.name;
    if (!same) { out.place = null; out.countryCode = rule.region?.cc || null; out.unknownPlace = l.city || rule.unknownPlace; }
  }
  if (!out.place && !rule.region && l.city) {
    const cc = l.country_code ? l.country_code.toUpperCase().replace("UK", "GB") : rule.countryCode;
    const h = lookupPlace(norm(l.city), { cc, allowFuzzy: true });
    if (h && (!cc || h.place.cc === cc) && (h.strong || !rule.place?.weak)) { out.place = { ...h.place, fuzzy: h.fuzzy }; out.countryCode = h.place.cc; out.unknownPlace = null; }
    else if (!h) out.unknownPlace = l.city;
  }
  if (!out.place && !rule.region && l.region) {
    const r = REGIONS[norm(l.region)]; if (r) { out.region = { cc: r[0], admin: r[1], label: l.region }; out.countryCode = r[0]; out.unknownPlace = null; }
  }
  if (!out.countryCode && l.country_code && COUNTRIES[l.country_code.toUpperCase().replace("UK", "GB")]) { out.countryCode = l.country_code.toUpperCase().replace("UK", "GB"); }
  if (out.maxPrice == null && typeof l.max_price === "number" && l.max_price >= 0) out.maxPrice = l.max_price;
  // leftover words the LLM recognised as place/category no longer count as unknown keywords
  if (out.place || out.categories.length) out.keywords = rule.keywords.filter((k) => !norm(out.place?.name).includes(k) && !(l.city && norm(l.city).includes(k)));
  return out;
}

// ---------- retrieval ----------
function baseParams(i: Intent): Params {
  const p: Params = { req: i.requiredTerms, terms: [...i.softTerms, ...i.keywords], cats: i.categories, maxPrice: i.maxPrice, from: i.dateFrom, to: i.dateTo, limit: 60 };
  if (i.place) { p.lat = i.place.lat; p.lng = i.place.lng; p.radius = i.place.pop > 1_000_000 ? 35 : i.place.pop > 300_000 ? 25 : 20; p.city = i.place.name; }
  else if (i.region) { p.cc = i.region.cc; p.region = i.region.admin; }
  else if (i.countryCode) p.cc = i.countryCode;
  return p;
}

function catLabel(c: string, lang: string) { return (CAT_LABEL[lang === "de" ? "de" : "en"] as Record<string, string>)[c] || c; }

function pickOffer(p: DirectoryProfile, i: Intent, ex?: Extra) {
  if (!p.offers.length) return null;
  const terms = [...i.requiredTerms.flatMap((g) => g.split("|")), ...i.softTerms, ...i.keywords].map((t) => norm(t.replace(/=$/, ""))).filter((t) => t.length >= 3);
  const dateOf = (id?: string | null) => (id && ex ? ex.offers.find((o) => o.id === id)?.starts_at || null : null);
  const scored = p.offers.map((o, idx) => {
    const t = norm(o.title); let s = 0;
    for (const term of terms) if (t.includes(term)) s += 3;
    for (const c of i.categories) if (t.includes(norm(c)) || t.includes(norm(catLabel(c, "de")))) s += 1;
    if (i.maxPrice != null && o.price != null && o.price <= i.maxPrice) s += 1;
    if (o.price != null) s += 0.5;
    const d = dateOf(o.id); if (d && new Date(d).getTime() > Date.now()) s += 0.4;
    if (i.dateFrom && d && d >= i.dateFrom && (!i.dateTo || d < i.dateTo)) s += 2;
    return { o, s: s - idx * 0.01, d };
  }).sort((a, b) => b.s - a.s);
  const best = scored[0];
  const d = best.d && new Date(best.d).getTime() > Date.now() - 864e5 ? best.d : null;
  return { title: best.o.title, price: best.o.price ?? null, currency: best.o.currency ?? null, date: d };
}

async function toCards(rows: RpcRow[], i: Intent, lang: string): Promise<SearchCard[]> {
  const live: { row: RpcRow; p: DirectoryProfile }[] = [];
  for (const row of rows) {
    const p = await getDirectoryProfile(row.slug); // null when removed / not live anymore
    if (p) live.push({ row, p });
  }
  const ex = await extras(live.map((x) => x.p.slug));
  return live.map(({ row, p }) => {
    const shown = (i.categories.find((c) => p.categories.includes(c)) || p.primary || p.categories[0] || "") as string;
    return {
      slug: p.slug, href: `/${p.slug}`, name: p.name, city: p.city ? displayPlace(p.city, lang) : null, country: countryName(p.countryCode, p.country, lang),
      category: catLabel(shown, lang), categories: p.categories.map((c) => catLabel(c, lang)),
      offer: pickOffer(p, i, ex.get(p.slug)), offerCount: p.offers.length,
      distanceKm: row.distance_km != null ? Math.round(row.distance_km) : null, reason: null,
      element: elementFor(p), avatar: claimedAvatar(p.slug), fromPrice: fromPrice(p.offers),
    };
  });
}

function ruleReason(c: SearchCard, i: Intent, lang: string): string | null {
  const de = lang === "de";
  const terms = [...i.requiredTerms.flatMap((g) => g.split("|")), ...i.softTerms, ...i.keywords].map((t) => norm(t.replace(/=$/, ""))).filter((t) => t.length >= 3);
  const hit = c.offer && terms.find((t) => norm(c.offer!.title).includes(t));
  if (hit && c.offer) return de ? `Angebot passt zu „${hit}“: ${c.offer.title}` : `Offer matches “${hit}”: ${c.offer.title}`;
  return null;
}

function cheapSort(cards: SearchCard[]) {
  return [...cards].sort((a, b) => (a.offer?.price ?? 1e9) - (b.offer?.price ?? 1e9));
}

// ---------- rerank + grounded text ----------
function factString(c: SearchCard) {
  return [c.name, c.city, c.country, c.categories.join("/"), c.offer?.title, c.offer?.price != null ? `${c.offer.price} ${c.offer.currency || ""}` : "", c.offer?.date?.slice(0, 10) || ""].filter(Boolean).join(" | ");
}
function grounded(text: string, facts: string) {
  // any number in the text must appear in the facts (no invented prices, dates, ratings)
  const nums: string[] = text.match(/\d+(?:[.,]\d+)?/g) ?? [];
  if (nums.some((n) => !facts.includes(n.replace(",", ".")) && !facts.includes(n))) return false;
  return !/(bewert|rating|stern|stars?\b|review|rezension|★)/i.test(text);
}
async function rerankAndText(query: string, lang: string, cards: SearchCard[], i: Intent): Promise<{ order: number[]; reasons: Map<number, string>; text: string | null; provider: string | null }> {
  // Soft queries (needs, free keywords) may promote from the top 30; precise queries only reorder the top 10.
  const soft = i.needs || i.keywords.length > 0 || i.softTerms.length > 0;
  const top = cards.slice(0, soft ? 30 : 10);
  const list = top.map((c, k) => `${k}. ${factString(c)}`).join("\n");
  const L = ({ de: "German", en: "English", fr: "French", nl: "Dutch", es: "Spanish", it: "Italian" } as Record<string, string>)[lang] || "the language of the query";
  const system = `You rank directory results for a wellbeing search. Use ONLY the facts given. Never invent prices, dates, ratings, reviews or availability.
Return ONLY JSON: {"order":[indices of the best up to 10 results, most relevant first],"reasons":{"index":"one short line in ${L} why it matches, using only the facts"},"summary":"1-2 short sentences in ${L} describing what was found (no prices, no dates, no numbers)"}
Prefer results in the requested city over nearby towns and keep the given order when results are equally relevant.
Drop results that clearly do not match what the user asked for. Reasons must be factual (no "might", "could", "possibly").`;
  const res = await runLlmChain(system, `Query: ${query}\nResults:\n${list}`).catch(() => null);
  if (!res) return { order: [], reasons: new Map(), text: null, provider: null };
  const j = parseJson<{ order?: number[]; reasons?: Record<string, string>; summary?: string }>(res.text);
  if (!j) return { order: [], reasons: new Map(), text: null, provider: res.provider };
  const order = [...new Set((j.order || []).filter((n) => Number.isInteger(n) && n >= 0 && n < top.length))];
  const reasons = new Map<number, string>();
  for (const [k, v] of Object.entries(j.reasons || {})) {
    const idx = Number(k); if (!Number.isInteger(idx) || !top[idx] || typeof v !== "string") continue;
    const line = v.replace(/\s+/g, " ").trim().slice(0, 140);
    if (line && grounded(line, factString(top[idx])) && !/(könnte|koennte|vielleicht|möglicherweise|might|could|possibly|perhaps|hindeut|suggests?)/i.test(line)) reasons.set(idx, line);
  }
  const summary = typeof j.summary === "string" ? j.summary.replace(/\s+/g, " ").trim().slice(0, 300) : "";
  return { order, reasons, text: summary && !/\d/.test(summary) && grounded(summary, "") ? summary : null, provider: res.provider };
}

function where(i: Intent, lang: string) {
  const de = lang === "de";
  if (i.place) return (de ? "in und um " : "in and around ") + displayPlace(i.place.name, lang);
  if (i.region) return (de ? "in " : "in ") + i.region.label.replace(/\b\w/g, (m) => m.toUpperCase());
  if (i.countryCode) return (de ? "in " : "in ") + (COUNTRIES[i.countryCode]?.[de ? 0 : 1] || i.countryCode).replace(/\b\w/g, (m) => m.toUpperCase());
  return "";
}
function templateText(i: Intent, lang: string, n: number, widened: string | null) {
  const de = lang === "de";
  const what = i.requiredTerms.length ? i.requiredTerms[0].split("|")[0].replace(/=$/, "").replace(/^./, (m) => m.toUpperCase()) : i.categories.length ? [...new Set(i.categories.slice(0, 2).map((c) => catLabel(c, lang)))].join(" / ") : (i.keywords[0] || (de ? "Angebote" : "offers"));
  const w = where(i, lang);
  const pre = i.unknownPlace ? (de ? `Den Ort „${i.unknownPlace}“ kenne ich nicht. ` : `I don't know the place “${i.unknownPlace}”. `) : "";
  const wid = widened ? (de ? ` (Umkreis erweitert: ${widened})` : ` (search widened: ${widened})`) : "";
  if (!n) return pre + (de ? `Ich habe keine passenden Anbieter für ${what}${w ? " " + w : ""} gefunden. Hier sind Alternativen:` : `I found no matching providers for ${what}${w ? " " + w : ""}. Here are alternatives:`);
  const tail = de ? " Preise und Termine bitte direkt beim Anbieter prüfen." : " Please check prices and dates with the provider.";
  const dateNote = i.dateFrom ? (de ? " Konkrete Termine sind nur bei wenigen Anbietern hinterlegt." : " Only a few providers list concrete dates.") : "";
  return pre + (de ? `${what}${w ? " " + w : ""}: ${n} ${n === 1 ? "passendes Profil" : "passende Profile"} im Orive-Verzeichnis${wid}.` : `${what}${w ? " " + w : ""}: ${n} ${n === 1 ? "matching profile" : "matching profiles"} in the Orive directory${wid}.`) + dateNote + tail;
}

// ---------- public entry ----------
export function looksLikeSearch(i: Intent) {
  return i.categories.length > 0 || i.requiredTerms.length > 0 || Boolean(i.place || i.region || i.countryCode) || (i.keywords.length > 0 && i.keywords.join("").length >= 4);
}

export async function searchDirectory(query: string, opts: { llm?: boolean; rerank?: boolean; languageHint?: string } = {}): Promise<DirectorySearchResult> {
  const t0 = Date.now(); const timings: Record<string, number> = {};
  maybeSyncInBackground();
  let intent = parseRules(query);
  if (opts.languageHint && intent.language === "de" && opts.languageHint !== "de" && !/[äöüß]/i.test(query)) intent.language = intent.language;
  timings.parse = Date.now() - t0;
  if (opts.llm !== false && !ruleParseConfident(intent)) {
    const t = Date.now(); const l = await llmIntent(query); timings.llmIntent = Date.now() - t;
    if (l) intent = mergeLlm(intent, l);
  }
  const lang = intent.language;
  const empty = (text: string): DirectorySearchResult => ({ query, language: lang, intent, cards: [], total: 0, alternatives: [], text, provider: null, timings, widened: null });
  if (!looksLikeSearch(intent)) return empty("");

  const t1 = Date.now();
  const p = baseParams(intent);
  const rows = await rpc(p);
  const widened: string | null = null;
  timings.sql = Date.now() - t1;
  let cards = await toCards(rows, intent, lang);
  if (intent.cheap) cards = cheapSort(cards);

  const alternatives: SearchAlternative[] = [];
  const de = lang === "de";
  if (cards.length < 3) {
    const tries: { label: string; params: Params }[] = [];
    if (intent.place) tries.push({ label: de ? `In der Nähe von ${displayPlace(intent.place.name, lang)} (bis 100 km)` : `Near ${intent.place.name} (up to 100 km)`, params: { ...p, radius: 100, city: null } });
    if (p.req.length) tries.push({ label: de ? "Ähnliche Angebote (ohne den exakten Begriff)" : "Similar offers (without the exact term)", params: { ...p, req: [], terms: [...p.req.flatMap((g) => g.split("|")), ...p.terms], cats: p.cats } });
    if (intent.categories.length) {
      const rel = [...new Set(intent.categories.flatMap((c) => RELATED[c as Category] || []))].filter((c) => !intent.categories.includes(c)).slice(0, 2);
      if (rel.length && (p.lat || p.cc)) tries.push({ label: (de ? "Verwandt: " : "Related: ") + rel.map((c) => catLabel(c, lang)).join(", "), params: { ...p, cats: rel, req: [], terms: [] } });
      if (intent.place) tries.push({ label: de ? "Im ganzen Land" : "Country-wide", params: { ...p, lat: null, lng: null, city: null, cc: intent.place.cc } });
    }
    if (p.maxPrice != null) tries.push({ label: de ? "Ohne Preisgrenze" : "Without price limit", params: { ...p, maxPrice: null } });
    for (const t of tries) {
      if (alternatives.length >= 3) break;
      const r = await rpc({ ...t.params, limit: 8 }).catch(() => []);
      const seen = new Set([...cards.map((c) => c.slug), ...alternatives.flatMap((a) => a.cards.map((c) => c.slug))]);
      const c = (await toCards(r, intent, lang)).filter((x) => !seen.has(x.slug)).slice(0, 4);
      if (c.length) alternatives.push({ label: t.label, query, cards: c });
    }
  }

  let text: string | null = null; let provider: string | null = null;
  if (opts.rerank !== false && cards.length > 1) {
    const t = Date.now();
    const rr = await rerankAndText(query, lang, cards, intent);
    timings.rerank = Date.now() - t; provider = rr.provider;
    if (rr.order.length) {
      const top = cards.slice(0, 30);
      const head = rr.order.map((k) => ({ ...top[k], reason: rr.reasons.get(k) || null }));
      const rest = cards.filter((c) => !head.some((h) => h.slug === c.slug));
      cards = [...head, ...rest];
    } else {
      cards = cards.map((c, k) => ({ ...c, reason: rr.reasons.get(k) || null }));
    }
    text = rr.text;
  }
  cards = cards.map((c) => (c.reason ? c : { ...c, reason: ruleReason(c, intent, lang) }));
  const tpl = templateText(intent, lang, cards.length, widened);
  const finalText = cards.length ? (text ? `${intent.unknownPlace ? tpl.split(". ")[0] + ". " : ""}${text} ${lang === "de" ? "Preise und Termine bitte direkt beim Anbieter prüfen." : "Please check prices and dates with the provider."}` : tpl) : tpl;
  timings.total = Date.now() - t0;
  return { query, language: lang, intent, cards: cards.slice(0, 30), total: cards.length, alternatives, text: finalText, provider, timings, widened };
}
