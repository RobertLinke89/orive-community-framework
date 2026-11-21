// Demo experiences (fictional facilitators, ratings and reviews) removed on 2026-11-09 – only real offers are shown.
// Centralized experiences data with proper facilitator connections
// Using public folder URLs for smaller bundle size


export interface Experience {
  id: string;
  title: string;
  facilitatorId: string;
  facilitatorName: string;
  facilitatorAvatar: string;
  rating?: number;
  reviewCount?: number;
  location: string;
  price: number;
  image: string;
  category: string;
  duration: string;
  groupSize: string;
  language?: string;
  type?: 'individual' | 'group' | 'event';
  is_online?: boolean;
  description: string;
  tags: string[];
  whatToExpect?: string[];
  whatToBring?: string[];
  dates?: Array<{
    date: string;
    time: string;
    spots?: number;
  }>;
  reviews?: Array<{
    author: string;
    rating: number;
    date: string;
    text: string;
  }>;
  source_platform?: string;
  source_url?: string;
  fulfillment?: 'orive' | 'external' | 'unlisted';
}

// All experiences mapped by unique IDs
export const experiencesData: Record<string, Experience> = {};

// Helper function to get experiences by facilitator ID
export const getExperiencesByFacilitator = (facilitatorId: string): Experience[] => {
  return Object.values(experiencesData).filter(exp => exp.facilitatorId === facilitatorId);
};

import { getCrawledOfferingById, isAuthenticCrawledOffering } from './crawledOfferings';
import { getCatalogOfferingById } from './catalogOfferings';
import { resolveFulfillment } from '@/lib/fulfillment';
import { formatOfferingLength, offeringSpan } from '@/lib/offeringSpan';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { cleanDescription, cleanOfferTitle, dedupeLocation, isSafeAvatarUrl } from '@/lib/offerQuality';

const prettyTag = (t: string) => (t === 'BodyWork' ? 'Bodywork' : t);

export const getExperienceById = (id: string): Experience | undefined => {
  const catalog = getCatalogOfferingById(id);
  const crawled = getCrawledOfferingById(id);
  const listing = catalog || crawled;
  if (listing && (catalog || isAuthenticCrawledOffering(listing) || isListableOfferingImage(listing.image_url))) {
    const priceDigits = String(listing.price ?? '').replace(/[^0-9]/g, '');
    const span = offeringSpan(listing);
    const hasValidDate = Boolean(span.start);
    const durationLabel = span.multiDay && span.days
      ? formatOfferingLength(span, false)
      : typeof listing.duration === 'number'
        ? `${listing.duration} min`
        : String(listing.duration || '');
    return {
      id: listing.id,
      title: cleanOfferTitle(listing.title),
      facilitatorId: listing.facilitator_id,
      facilitatorName: listing.facilitator_name || 'Facilitator',
      facilitatorAvatar: [listing.facilitator_avatar, crawled?.facilitator_avatar].find((u) => isSafeAvatarUrl(u)) || '',
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      price: priceDigits ? parseInt(priceDigits, 10) : 0,
      duration: durationLabel,
      location: dedupeLocation(listing.location || ''),
      category: prettyTag(listing.tags?.[0] || listing.source_platform || ''),
      image: listing.image_url || '',
      type: listing.type,
      is_online: Boolean(listing.is_online),
      groupSize: listing.capacity ? `Up to ${listing.capacity} people` : '',
      tags: (listing.tags || []).map(prettyTag),
      // Original partner description only (sanitized) – no generated template copy.
      description: cleanDescription(listing.description || crawled?.description || ''),
      whatToExpect: [],
      whatToBring: [],
      dates: hasValidDate && span.start
        ? [{
            date: span.start.toISOString(),
            time: span.end && span.multiDay ? span.end.toISOString() : '',
          }]
        : [],
      reviews: [],
      source_platform: listing.source_platform,
      source_url: listing.source_url,
      fulfillment: resolveFulfillment(listing),
    };
  }
  return undefined;
};
