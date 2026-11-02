import type { CategoryKey } from "@/lib/claim/categories";
import { CATEGORY_SLUGS, profilePath } from "@/lib/claim/slugs";

/** Crawled offers (crawler project: public.facilitator_offers). Pure helpers only – no DB access here. */
export const OFFER_TYPES = ["service", "event", "course", "product", "freebie"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];
export const isOfferType = (s: unknown): s is OfferType => typeof s === "string" && (OFFER_TYPES as readonly string[]).includes(s);

export const TYPE_LABEL: Record<OfferType, string> = {
  service: "Sessions & Behandlungen", event: "Events", course: "Kurse", product: "Produkte", freebie: "Kostenlos",
};
export const TYPE_CHIP: Record<OfferType, string> = { service: "Session", event: "Event", course: "Kurs", product: "Produkt", freebie: "Kostenlos" };

export type OfferRow = {
  id: string; facilitator_id: string; type: string; title: string; description: string | null; price: number | string | null;
  currency: string | null; duration: string | null; url: string | null; image_url: string | null; starts_at: string | null;
};
/** Consented (live + terms_consented_at) facilitator from the app DB; the only way an offer becomes public. */
export type PublishedFacilitator = { source_facilitator_id: string; slug: string; display_name: string; category: CategoryKey; city: string | null };

export type PublicOffer = {
  id: string; type: OfferType; title: string; description: string | null;
  price: number | null; currency: string; duration: string | null; startsAt: string | null;
  externalUrl: string | null;
  image: { url: string; alt: string; label: string | null };
  facilitator: { name: string; city: string | null; category: CategoryKey; slug: string; href: string };
  href: string;
};

const httpsUrl = (u: string | null | undefined) => (u && /^https:\/\/[^\s"'<>]+$/i.test(u.trim()) ? u.trim() : null);
/** /public/claim/covers has no personal.jpg -> closest existing category image. */
const COVER_FILE: Partial<Record<CategoryKey, string>> = { personal: "coaching" };
export const fallbackImage = (c: CategoryKey) => `/claim/covers/${COVER_FILE[c] ?? c}.jpg`;

const clean = (s: string | null | undefined, max: number) => {
  const v = (s ?? "").replace(/\s+/g, " ").trim();
  return v ? (v.length > max ? v.slice(0, max - 1).trimEnd() + "…" : v) : null;
};

export function offerPath(c: CategoryKey, id: string) { return `/${CATEGORY_SLUGS[c]}/angebote/${id}`; }
export function listingPath(c: CategoryKey, type?: OfferType | null) { return `/${CATEGORY_SLUGS[c]}/angebote${type ? `?typ=${type}` : ""}`; }

/** Row + its consented facilitator -> public shape. Returns null for unknown types / empty titles. */
export function toPublicOffer(r: OfferRow, f: PublishedFacilitator): PublicOffer | null {
  if (!isOfferType(r.type) || r.facilitator_id !== f.source_facilitator_id) return null;
  const title = clean(r.title, 140);
  if (!title) return null;
  const n = r.price === null || r.price === undefined || r.price === "" ? null : Number(r.price);
  const img = httpsUrl(r.image_url);
  return {
    id: r.id, type: r.type, title, description: clean(r.description, 900),
    price: n !== null && Number.isFinite(n) && n >= 0 ? n : null,
    currency: (r.currency || "EUR").trim().toUpperCase() || "EUR",
    duration: clean(r.duration, 60), startsAt: r.starts_at, externalUrl: httpsUrl(r.url),
    image: img ? { url: img, alt: title, label: null } : { url: fallbackImage(f.category), alt: `${title} (Beispielbild)`, label: "Beispielbild" },
    facilitator: { name: f.display_name, city: f.city, category: f.category, slug: f.slug, href: profilePath(f.category, f.slug) },
    href: offerPath(f.category, r.id),
  };
}

/** Price only when real: null -> nothing, 0 -> "Kostenlos", >0 -> "45 €". */
export function priceLabel(o: Pick<PublicOffer, "price" | "currency" | "type">): string | null {
  if (o.price === null) return o.type === "freebie" ? "Kostenlos" : null;
  if (o.price === 0) return "Kostenlos";
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: o.currency, maximumFractionDigits: o.price % 1 ? 2 : 0 }).format(o.price);
  } catch { return null; }
}
/** "ab X" over real paid prices only (free / unknown ignored). */
export function fromPriceLabel(offers: Pick<PublicOffer, "price" | "currency">[]): string | null {
  const paid = offers.filter((o) => typeof o.price === "number" && o.price > 0);
  if (!paid.length) return null;
  const min = paid.reduce((a, b) => (b.price! < a.price! ? b : a));
  const p = priceLabel({ price: min.price, currency: min.currency, type: "service" });
  return p ? `ab ${p}` : null;
}
export function dateLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(+d)) return null;
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);
}

/** Events: upcoming only, ascending starts_at (undated events last). Others: keep stable title order. */
export function sortOffers(list: PublicOffer[], now = Date.now()): PublicOffer[] {
  const ev = list.filter((o) => o.type === "event" && (!o.startsAt || +new Date(o.startsAt) >= now - 6 * 3600e3));
  ev.sort((a, b) => (a.startsAt ? +new Date(a.startsAt) : Infinity) - (b.startsAt ? +new Date(b.startsAt) : Infinity) || a.title.localeCompare(b.title, "de"));
  const rest = list.filter((o) => o.type !== "event").sort((a, b) => OFFER_TYPES.indexOf(a.type) - OFFER_TYPES.indexOf(b.type) || a.title.localeCompare(b.title, "de"));
  return [...rest.filter((o) => o.type === "service"), ...ev, ...rest.filter((o) => o.type !== "service")];
}
export function groupByType(list: PublicOffer[], now = Date.now()): { type: OfferType; offers: PublicOffer[] }[] {
  const s = sortOffers(list, now);
  return OFFER_TYPES.map((type) => ({ type, offers: s.filter((o) => o.type === type) })).filter((g) => g.offers.length);
}
