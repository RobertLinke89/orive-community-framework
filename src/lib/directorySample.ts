// Directory profiles: the 31 static sample profiles (src/data/directorySample.json) + ALL tier-A facilitators with
// cleaned offers, read server-side from the crawler project (facilitators / facilitator_offers, service key, never NEXT_PUBLIC).
// No email/phone. Cached in memory (TTL) with an on-disk snapshot so cold starts and DB outages keep serving.
// Does NOT use /api/facilitator/import (which contains fake rating/review/view values).
import data from "@/data/directorySample.json";
import { promises as fs, readFileSync, statSync, writeFileSync, mkdirSync, renameSync } from "fs";
import path from "path";
import { isHiddenProfile } from "./directoryHide";
import { cleanOfferTitle, isJunkOfferTitle } from "./offerQuality";
import { displayPlace } from "./directorySearchGeo";
import { buildProfiles, describe, type BuildStats, type DirectoryProfile, type FacRow, type OfferRow } from "./directoryBuild";
export type { DirectoryOffer, DirectoryProfile } from "./directoryBuild";

const STATIC = (data as any).profiles as DirectoryProfile[];

// Runtime data lives outside the web root (/app/.directory-data, not under public/, gitignored).
export const DATA_DIR = path.join(process.cwd(), ".directory-data");
const REMOVALS_FILE = path.join(DATA_DIR, "removals.json");
const SNAPSHOT_FILE = path.join(DATA_DIR, "a-profiles.json");
const TTL_MS = 30 * 60 * 1000;

type State = { list: DirectoryProfile[]; bySlug: Map<string, DirectoryProfile>; at: number };
let state: State | null = null;
let loading: Promise<State> | null = null;

// Display-time offer cleanup (no DB change): drop navigation/legal/cancellation junk titles, strip "DE · " prefixes.
// Display-time normalisation (no DB writes): drop junk offer titles and regenerate the
// templated profile text so it never quotes a hidden offer and uses localized place names (Köln, Slowakei).
const GENERATED = /^(.+?) (ist im Bereich |offers |propose une pratique |is actief in )/;
function cleanOffers(p: DirectoryProfile): DirectoryProfile {
  const offers = (p.offers || []).filter((o) => !isJunkOfferTitle(o.title)).map((o) => ({ ...o, title: cleanOfferTitle(o.title) }));
  let description = p.description;
  if (description && GENERATED.test(description) && description.startsWith(p.name)) {
    const pick = (p.primary ?? p.categories[0] ?? "") as string;
    try { description = describe(p.name, pick, p.categories.length ? p.categories : [pick], p.city ? displayPlace(p.city, p.lang) : "", p.country, p.lang, offers); } catch { /* keep stored text */ }
  }
  const same = description === p.description && offers.length === (p.offers || []).length && offers.every((o, i) => o.title === p.offers[i].title);
  return same ? p : { ...p, offers, description };
}

function index(dyn: DirectoryProfile[], at: number): State {
  const list = [...STATIC, ...dyn].map(cleanOffers);
  const bySlug = new Map<string, DirectoryProfile>();
  for (const p of list) if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  return { list, bySlug, at };
}

async function fetchAll<T>(base: string, key: string, q: string): Promise<T[]> {
  const out: T[] = []; const step = 1000;
  for (let from = 0; ; from += step) {
    const r = await fetch(`${base}/rest/v1/${q}`, { cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + step - 1}`, "Range-Unit": "items" } });
    if (!r.ok && r.status !== 206) throw new Error(`directory fetch ${q.split("?")[0]} ${r.status}`);
    const rows = (await r.json()) as T[];
    out.push(...rows);
    if (rows.length < step) break;
    if (from > 200000) break;
  }
  return out;
}

async function loadFromDb(): Promise<State> {
  const base = (process.env.CRAWLER_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.CRAWLER_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) throw new Error("directory: crawler DB not configured");
  const [facs, offers, enr] = await Promise.all([
    fetchAll<FacRow>(base, key, "facilitators?select=id,name,categories,kambo_flag,city,country,website,instagram,source,source_url,created_at&quality_tier=eq.A&order=id"),
    fetchAll<OfferRow>(base, key, "facilitator_offers?select=id,facilitator_id,type,title,description,price,currency,duration,url&order=facilitator_id,id"),
    fetchAll<{ facilitator_id: string }>(base, key, "facilitator_offer_enrichment?select=facilitator_id&status=in.(blocked,excluded)&order=facilitator_id"),
  ]);
  const byFac = new Map<string, OfferRow[]>();
  for (const o of offers) { let a = byFac.get(o.facilitator_id); if (!a) byFac.set(o.facilitator_id, (a = [])); a.push(o); }
  const stats: BuildStats = { tierA: 0, staticOrSkipped: 0, pass1: 0, pass2: 0, excluded: {} };
  const dyn = buildProfiles(facs, byFac, new Set(enr.map((e) => e.facilitator_id)), STATIC, stats);
  const s = index(dyn, Date.now());
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const tmp = SNAPSHOT_FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify({ at: s.at, stats, profiles: dyn }), { mode: 0o600 });
    renameSync(tmp, SNAPSHOT_FILE);
  } catch { /* snapshot is best effort */ }
  return s;
}

function readSnapshot(): State | null {
  try { const j = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")); return Array.isArray(j.profiles) ? index(j.profiles, Number(j.at) || 0) : null; } catch { return null; }
}

function refresh(): Promise<State> {
  if (!loading) loading = loadFromDb().then((s) => (state = s)).catch((e) => { console.error("[directory]", String(e?.message || e)); return state ?? index([], 0); }).finally(() => { loading = null; });
  return loading;
}

async function ensure(): Promise<State> {
  if (!state) state = readSnapshot();
  if (!state) return refresh();                       // cold start without snapshot: wait once
  if (Date.now() - state.at > TTL_MS) void refresh(); // stale-while-revalidate
  return state;
}

type Removal = { slug: string; at: string; reason: string | null; status: "hidden" | "restored" };
let remCache: { mtime: number; hidden: Set<string> } | null = null;
function hiddenSlugs(): Set<string> {
  try {
    const m = statSync(REMOVALS_FILE).mtimeMs;
    if (!remCache || remCache.mtime !== m) {
      const list = JSON.parse(readFileSync(REMOVALS_FILE, "utf8")) as Removal[];
      // last entry per slug wins (hidden -> restored is possible manually)
      const last = new Map<string, Removal>();
      for (const r of list) last.set(r.slug, r);
      remCache = { mtime: m, hidden: new Set([...last.values()].filter((r) => r.status === "hidden").map((r) => r.slug)) };
    }
    return remCache.hidden;
  } catch { return new Set(); }
}

/** Known slug (even if removed). */
export async function findDirectoryProfile(slug: string): Promise<DirectoryProfile | null> {
  const s = String(slug || "").toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(s)) return null;
  return (await ensure()).bySlug.get(s) ?? null;
}
export function isDirectoryRemoved(slug: string) { return hiddenSlugs().has(String(slug || "").toLowerCase()); }
/** Visible profile or null (removed profiles are hidden immediately). */
export async function getDirectoryProfile(slug: string): Promise<DirectoryProfile | null> {
  const p = await findDirectoryProfile(slug);
  return p && !isDirectoryRemoved(p.slug) && !isHiddenProfile(p) ? p : null;
}
/** Hidden as junk (name is a page title / domain / placeholder). */
export function isDirectoryHidden(p: { slug: string; name: string }) { return isHiddenProfile(p); }
export async function allDirectoryProfiles() { return (await ensure()).list.filter((p) => !isDirectoryRemoved(p.slug) && !isHiddenProfile(p)); }
export function staticDirectoryProfiles() { return STATIC; }

let writing: Promise<void> = Promise.resolve();
/** Records a removal request and hides the profile at once. No login, no mail. */
export async function recordRemoval(slug: string, reason: string | null) {
  const p = await findDirectoryProfile(slug);
  if (!p) return false;
  const job = writing.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const list: Removal[] = JSON.parse(await fs.readFile(REMOVALS_FILE, "utf8").catch(() => "[]"));
    list.push({ slug: p.slug, at: new Date().toISOString(), reason: reason ? reason.slice(0, 1000) : null, status: "hidden" });
    const tmp = REMOVALS_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(list, null, 1), { mode: 0o600 });
    await fs.rename(tmp, REMOVALS_FILE);
  });
  writing = job.catch(() => {});
  await job;
  remCache = null;
  return true;
}

/** Indexing is off unless explicitly enabled. Profiles without offers are always noindex. */
export function directoryIndexable(p: DirectoryProfile) {
  return process.env.ORIVE_DIRECTORY_INDEXABLE === "1" && p.offers.length > 0;
}

// Real view counter: simple JSON file (no DB writes). Cached in memory, written debounced.
export const VIEW_THRESHOLD = 50;
const VIEWS_FILE = path.join(DATA_DIR, "views.json");
let cache: Record<string, number> | null = null;
let vtimer: ReturnType<typeof setTimeout> | null = null;
export async function countView(slug: string): Promise<number> {
  try {
    if (!cache) cache = JSON.parse(await fs.readFile(VIEWS_FILE, "utf8").catch(() => "{}"));
    cache![slug] = (cache![slug] || 0) + 1;
    if (!vtimer) vtimer = setTimeout(() => {
      vtimer = null;
      const snapshot = JSON.stringify(cache);
      fs.mkdir(DATA_DIR, { recursive: true }).then(() => fs.writeFile(VIEWS_FILE + ".tmp", snapshot)).then(() => fs.rename(VIEWS_FILE + ".tmp", VIEWS_FILE)).catch(() => {});
    }, 2000);
    return cache![slug];
  } catch { return 0; }
}
