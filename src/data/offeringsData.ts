import type { PublicOffering } from '@/hooks/usePublicOfferings';
import { catalogOfferings } from '@/data/catalogOfferings';
import {
  crawledOfferings,
  crawledOfferingsEvents,
  crawledOfferingsSessions,
  isAuthenticCrawledOffering,
} from '@/data/crawledOfferings';
import { isListableOfferingImage } from '@/lib/imageUrl';

function uniqueById(items: PublicOffering[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    if (!isListableOfferingImage(item.image_url) && !isAuthenticCrawledOffering(item)) return false;
    seen.add(item.id);
    return true;
  });
}

export const mockOfferingsSessions: PublicOffering[] = uniqueById([
  ...crawledOfferingsSessions.filter(isAuthenticCrawledOffering),
]);

export const mockOfferingsEvents: PublicOffering[] = uniqueById([
  ...catalogOfferings,
  ...crawledOfferingsEvents.filter(isAuthenticCrawledOffering),
]);

export const allMockOfferings: PublicOffering[] = uniqueById([
  ...catalogOfferings,
  ...crawledOfferings.filter(isAuthenticCrawledOffering),
]);
