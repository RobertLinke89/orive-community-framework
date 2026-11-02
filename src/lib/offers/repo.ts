import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverDb } from "@/lib/serverDb";
import { PUBLIC_OR_FILTER } from "@/lib/claim/visibility";
import type { CategoryKey } from "@/lib/claim/categories";
import { CATEGORY_KEYS } from "@/lib/claim/categories";
import { categoryFromSlug, SLUG_RE } from "@/lib/claim/slugs";
import { groupByType, isOfferType, sortOffers, toPublicOffer, type OfferRow, type OfferType, type PublicOffer, type PublishedFacilitator } from "./model";

/**
 * SERVER ONLY. Public offers = crawler public.facilitator_offers (separate Supabase project, RLS on, no policies,
 * read with a server-side key) INTERSECTED with publicly visible facilitators from the app DB
 *   (src/lib/claim/visibility.ts: not hidden AND (approved release batch OR claimed + consented) – same gate as the profile pages),
 *   joined on claimable_profiles.source_facilitator_id = facilitator_offers.facilitator_id.
 * The crawler table is NEVER queried without an explicit list of consented facilitator ids, and every row coming
 * back is re-checked against that list (toPublicOffer refuses a facilitator_id mismatch).
 */
const OFFER_COLS = "id,facilitator_id,type,title,description,price,currency,duration,url,image_url,starts_at";
const PROFILE_COLS = "source_facilitator_id,slug,display_name,category,city";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let crawlerOverride: SupabaseClient | null | undefined;
export function setCrawlerDbForTests(c: SupabaseClient | null | undefined) { crawlerOverride = c; }
/** Server-side client for the crawler project (CRAWLER_SUPABASE_URL + CRAWLER_SUPABASE_SERVICE_KEY). Never NEXT_PUBLIC_. */
export function crawlerDb(): SupabaseClient | null {
  if (crawlerOverride !== undefined) return crawlerOverride;
  const url = process.env.CRAWLER_SUPABASE_URL || "", key = process.env.CRAWLER_SUPABASE_SERVICE_KEY || "";
  if (!url.startsWith("https://") || key.length < 20) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** THE visibility gate (approved/published or claimed+consented, never hidden). */
export async function publishedFacilitators(filter: { category?: CategoryKey; sourceIds?: string[]; slug?: string } = {}): Promise<PublishedFacilitator[]> {
  const db = serverDb();
  if (!db) return [];
  let q = db.from("claimable_profiles").select(PROFILE_COLS).is("hidden_at", null).or(PUBLIC_OR_FILTER);
  if (filter.category) q = q.eq("category", filter.category);
  if (filter.slug) q = q.eq("slug", filter.slug);
  if (filter.sourceIds) q = q.in("source_facilitator_id", filter.sourceIds);
  const { data, error } = await q.limit(2000);
  if (error || !data) return [];
  return (data as any[]).filter((r) => r.source_facilitator_id && (CATEGORY_KEYS as string[]).includes(r.category)) as PublishedFacilitator[];
}

async function offersFor(facs: PublishedFacilitator[], type?: OfferType | null): Promise<PublicOffer[]> {
  const db = crawlerDb();
  if (!db || !facs.length) return [];
  const byId = new Map(facs.map((f) => [f.source_facilitator_id, f]));
  const ids = [...byId.keys()], out: PublicOffer[] = [];
  for (let i = 0; i < ids.length; i += 150) {
    let q = db.from("facilitator_offers").select(OFFER_COLS).in("facilitator_id", ids.slice(i, i + 150));
    if (type) q = q.eq("type", type);
    const { data, error } = await q.limit(1000);
    if (error || !data) continue;
    for (const r of data as OfferRow[]) {
      const f = byId.get(r.facilitator_id);            // re-check: rows of non-consented facilitators are dropped
      const o = f && toPublicOffer(r, f);
      if (o) out.push(o);
    }
  }
  return out;
}

/** Offers section on /{category}/{slug}: only if that profile is live + consented. */
export async function loadProfileOffers(categorySlug: string, slug: string) {
  const category = categoryFromSlug(categorySlug);
  if (!category || !SLUG_RE.test(slug)) return [];
  const facs = (await publishedFacilitators({ category, slug })).slice(0, 1);
  return groupByType(await offersFor(facs));
}

/** /{category}/angebote[?typ=event] */
export async function loadCategoryOffers(categorySlug: string, type?: string | null) {
  const category = categoryFromSlug(categorySlug);
  if (!category) return null;
  const t = isOfferType(type) ? type : null;
  const all = sortOffers(await offersFor(await publishedFacilitators({ category }), null));
  const counts = Object.fromEntries(["service", "event", "course", "product", "freebie"].map((k) => [k, all.filter((o) => o.type === k).length])) as Record<OfferType, number>;
  return { category, type: t, offers: t ? all.filter((o) => o.type === t) : all, counts };
}

/** /{category}/angebote/{id}: offer is looked up first, then its facilitator must pass the consent gate. */
export async function loadOffer(categorySlug: string, id: string): Promise<{ offer: PublicOffer; more: PublicOffer[] } | null> {
  const category = categoryFromSlug(categorySlug);
  const db = crawlerDb();
  if (!category || !db || !UUID_RE.test(id)) return null;
  const { data } = await db.from("facilitator_offers").select(OFFER_COLS).eq("id", id).maybeSingle();
  if (!data) return null;
  const [f] = await publishedFacilitators({ category, sourceIds: [(data as OfferRow).facilitator_id] });
  if (!f) return null;                                   // not consented (or other category) -> 404
  const offer = toPublicOffer(data as OfferRow, f);
  if (!offer) return null;
  const more = sortOffers((await offersFor([f])).filter((o) => o.id !== offer.id)).slice(0, 6);
  return { offer, more };
}
