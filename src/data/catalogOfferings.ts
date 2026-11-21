import type { PublicOffering } from '@/hooks/usePublicOfferings';
import { isRealOfferingImage } from '@/lib/imageUrl';
import raw from './catalogOfferings.json';
import { cleanOfferTitle, dedupeLocation, isJunkOfferTitle } from '@/lib/offerQuality';

function isUpcoming(startAt: string | null | undefined): boolean {
  if (!startAt) return false;
  const t = new Date(startAt).getTime();
  return Number.isFinite(t) && t >= Date.now();
}

/** Slim Eventbrite catalog for the homepage. Avoids shipping crawledOfferings.json. */
export const catalogOfferings: PublicOffering[] = (raw as PublicOffering[])
  .filter((item) => isRealOfferingImage(item.image_url) && isUpcoming(item.start_at) && !isJunkOfferTitle(item.title))
  .map((item) => ({
    ...item,
    title: cleanOfferTitle(item.title),
    location: item.location ? dedupeLocation(item.location) : item.location,
    rating: undefined,
    reviewCount: undefined,
    fulfillment: 'external',
  }));

export function getCatalogOfferingById(id: string): PublicOffering | undefined {
  return catalogOfferings.find((item) => item.id === id);
}
