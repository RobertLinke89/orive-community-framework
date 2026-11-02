import { nameSlug, uniqueSlug } from "./slugs";
import { tierFor, type QualityTier } from "./quality";
import { categoryFromCrawler, presetOffers, type CategoryKey, type OfferTemplate } from "./categories";

export type CrawlerFacilitator = {
  id: string; name: string | null; categories: string[] | null; kambo_flag: boolean | null;
  city: string | null; country: string | null; website: string | null; email: string | null;
  phone: string | null; instagram: string | null; source_url: string | null; source: string | null;
  quality_score?: number | null; quality_tier?: string | null;
};

export type ClaimableInsert = {
  source_facilitator_id: string; slug: string; display_name: string; category: CategoryKey;
  categories: string[]; city: string | null; country: string | null; website: string | null;
  instagram: string | null; contact_email: string | null; source_url: string | null;
  quality_score: number | null; quality_tier: QualityTier | null;
};

const clean = (s: string | null | undefined, max = 200) => {
  const v = (s ?? "").replace(/[\u0000-\u001f]/g, " ").trim();
  return v ? v.slice(0, max) : null;
};

/** @deprecated use nameSlug from ./slugs */
export const slugify = nameSlug;

export function safeUrl(u: string | null | undefined): string | null {
  const v = clean(u, 300);
  if (!v) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".") ? url.toString() : null;
  } catch { return null; }
}

/** Slugs are unique per category (URL /{category}/{slug}); `taken` holds the used slugs per category. */
export function mapCrawlerRow(r: CrawlerFacilitator, taken: Map<CategoryKey, Set<string>>): ClaimableInsert | null {
  const name = clean(r.name, 160);
  if (!name || name.length < 2) return null;
  const category = categoryFromCrawler(r.categories, r.kambo_flag);
  if (!taken.has(category)) taken.set(category, new Set());
  const slug = uniqueSlug(nameSlug(name), taken.get(category)!);
  const email = clean(r.email, 255)?.toLowerCase() ?? null;
  return {
    source_facilitator_id: r.id, slug, display_name: name,
    category,
    categories: (r.categories || []).map((c) => String(c).slice(0, 60)).slice(0, 10),
    city: clean(r.city, 120), country: clean(r.country, 120),
    website: safeUrl(r.website), instagram: safeUrl(r.instagram),
    contact_email: email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null,
    source_url: safeUrl(r.source_url),
    quality_score: typeof r.quality_score === "number" ? r.quality_score : null,
    quality_tier: typeof r.quality_score === "number" ? tierFor(r.quality_score) : null,
  };
}

export function offersFor(category: CategoryKey): (OfferTemplate & { position: number })[] {
  return presetOffers(category).map((x, position) => ({ ...x, position }));
}
