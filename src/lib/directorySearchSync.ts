// Mirrors the live directory profiles (same list the [username] route serves) into public.directory_search.
// Writes only to the search table created by the directory_search_v1 migration. Server only.
import { allDirectoryProfiles, type DirectoryProfile } from "@/lib/directorySample";
import { CAT_SYNONYMS, type Category } from "./directorySearchVocab";
import { geocodeCity } from "./directorySearchGeo";

const ISO2: Record<string, string> = { UK: "GB" };
export function dbEnv() {
  const base = (process.env.CRAWLER_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.CRAWLER_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return base && key ? { base, key } : null;
}
export async function rest(path: string, init: RequestInit = {}, timeoutMs = 15000) {
  const env = dbEnv(); if (!env) throw new Error("directory-search: DB not configured");
  return fetch(`${env.base}/rest/v1/${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(timeoutMs), headers: { apikey: env.key, Authorization: `Bearer ${env.key}`, "Content-Type": "application/json", ...(init.headers || {}) } });
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type OfferExtra = { id: string; description: string | null; starts_at: string | null };
async function offerExtras(ids: string[]): Promise<Map<string, OfferExtra>> {
  const out = new Map<string, OfferExtra>();
  for (let i = 0; i < ids.length; i += 120) {
    const chunk = ids.slice(i, i + 120);
    const r = await rest(`facilitator_offers?select=id,description,starts_at&id=in.(${chunk.join(",")})`);
    if (!r.ok) throw new Error(`offer extras ${r.status}`);
    for (const row of (await r.json()) as OfferExtra[]) out.set(row.id, row);
  }
  return out;
}

export function rowFor(p: DirectoryProfile, extras: Map<string, OfferExtra>) {
  const cc = ISO2[p.countryCode] || p.countryCode || null;
  const geo = p.city ? geocodeCity(p.city, cc || "") : null;
  const offers = p.offers.map((o) => {
    const x = o.id ? extras.get(o.id) : undefined;
    return { id: o.id || null, title: o.title, type: o.type, price: o.price, currency: o.currency, duration: o.duration, url: o.url, starts_at: x?.starts_at || null };
  });
  const priced = offers.filter((o) => typeof o.price === "number" && o.price! > 0);
  const now = Date.now();
  const dates = offers.map((o) => o.starts_at).filter((d): d is string => Boolean(d) && new Date(d!).getTime() > now - 864e5).sort();
  const catTerms = [...new Set([...(p.categories as Category[]).flatMap((c) => CAT_SYNONYMS[c] || [c]), ...(p.kambo ? CAT_SYNONYMS.Kambo : [])])].join(" ");
  const offerText = p.offers.map((o) => (o.id ? extras.get(o.id)?.description : null) || "").join(" \n ").replace(/\s+/g, " ").slice(0, 6000);
  const completeness = (p.offers.length > 0 ? 1 : 0) + (priced.length > 0 ? 1 : 0) + (p.website ? 1 : 0) + (p.instagram ? 1 : 0) + (p.city ? 1 : 0) + (p.offers.length >= 3 ? 1 : 0);
  const min = priced.length ? priced.reduce((a, b) => (b.price! < a.price! ? b : a)) : null;
  return {
    slug: p.slug, facilitator_id: UUID.test(p.id) ? p.id : null, name: p.name, primary_cat: p.primary || p.categories[0] || null,
    categories: p.categories, kambo: Boolean(p.kambo), city: p.city || null, region: geo?.admin || null, country: p.country || null,
    country_code: cc, lat: geo?.lat ?? null, lng: geo?.lng ?? null, description: p.description || null, offers,
    offer_titles: p.offers.map((o) => o.title).join(" | "), offer_text: offerText, cat_terms: catTerms,
    min_price: min?.price ?? null, price_currency: min?.currency ?? null, offer_count: p.offers.length, priced_count: priced.length,
    next_date: dates[0] || null, dates, completeness, synced_at: new Date().toISOString(),
  };
}

let running: Promise<{ rows: number; removed: number; ms: number }> | null = null;
export function syncDirectorySearch() {
  if (!running) running = (async () => {
    const t0 = Date.now(); const started = new Date(t0 - 1000).toISOString();
    const profiles = await allDirectoryProfiles();
    const ids = profiles.flatMap((p) => p.offers.map((o) => o.id).filter((x): x is string => Boolean(x) && UUID.test(String(x))));
    const extras = await offerExtras(ids);
    const rows = profiles.map((p) => rowFor(p, extras));
    for (let i = 0; i < rows.length; i += 500) {
      const r = await rest("directory_search?on_conflict=slug", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows.slice(i, i + 500)) }, 60000);
      if (!r.ok) throw new Error(`upsert ${r.status} ${(await r.text()).slice(0, 200)}`);
    }
    // Drop index rows of profiles that are no longer live (rows of this search table only).
    const del = await rest(`directory_search?synced_at=lt.${encodeURIComponent(started)}`, { method: "DELETE", headers: { Prefer: "return=representation,count=exact" } }, 60000);
    const removed = del.ok ? ((await del.json()) as unknown[]).length : -1;
    lastSync = Date.now();
    console.info(`[directory-search] sync rows=${rows.length} removed=${removed} ms=${Date.now() - t0}`);
    return { rows: rows.length, removed, ms: Date.now() - t0 };
  })().finally(() => { running = null; });
  return running;
}
let lastSync = 0;
const SYNC_EVERY_MS = 6 * 60 * 60 * 1000;
/** Fire-and-forget background refresh (at most every 6h per process). */
export function maybeSyncInBackground() {
  if (process.env.DIRECTORY_SEARCH_AUTOSYNC === "0") return;
  if (Date.now() - lastSync < SYNC_EVERY_MS || running) return;
  lastSync = Date.now();
  void syncDirectorySearch().catch((e) => console.error("[directory-search] sync failed", String(e?.message || e)));
}
