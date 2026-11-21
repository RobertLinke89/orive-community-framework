// Demo 1:1 sessions (fictional facilitators, ratings and reviews) removed on 2026-11-09 – only real offers are shown.
// Session images - using public folder URLs for smaller bundle size

export interface Session {
  id: string;
  title: string;
  facilitatorId: string;
  facilitatorName: string;
  type: '1:1 Session';
  rating: number;
  reviewCount: number;
  sales: number;
  views: number;
  image: string;
  hourlyRate: string;
  location: string;
  tags: string[];
  description: string;
  source_url?: string;
  source_platform?: string;
}

export const sessionsData: Record<string, Session> = {};

export const getSessionsByFacilitator = (facilitatorId: string): Session[] => {
  return Object.values(sessionsData).filter(
    session => session.facilitatorId === facilitatorId
  );
};

import { getCrawledOfferingById, isAuthenticCrawledOffering } from './crawledOfferings';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { ensureOfferingDescription } from '@/lib/offeringDescription';

export const getSessionById = (id: string): Session | undefined => {
  const crawled = getCrawledOfferingById(id);
  if (
    crawled &&
    crawled.type === 'individual' &&
    (isAuthenticCrawledOffering(crawled) || isListableOfferingImage(crawled.image_url))
  ) {
    return {
      id: crawled.id,
      title: crawled.title,
      facilitatorId: crawled.facilitator_id,
      facilitatorName: crawled.facilitator_name || 'Facilitator',
      type: '1:1 Session',
      rating: crawled.rating || 0,
      reviewCount: crawled.reviewCount || 0,
      sales: 0,
      views: 0,
      image: crawled.image_url || '',
      hourlyRate: crawled.price || '',
      location: crawled.location || '',
      tags: crawled.tags || [],
      description: ensureOfferingDescription({
        title: crawled.title,
        description: crawled.description || '',
        tags: crawled.tags || [],
        category: crawled.tags?.[0] || crawled.source_platform || '',
        location: crawled.location || '',
        facilitatorName: crawled.facilitator_name || 'Facilitator',
        type: crawled.type,
      }),
      source_url: crawled.source_url,
      source_platform: crawled.source_platform,
    };
  }
  return undefined;
};

export const getAllSessions = (): Session[] => {
  return Object.values(sessionsData);
};

// Get unique facilitator IDs that have sessions
export const getFacilitatorIdsWithSessions = (): string[] => {
  const ids = new Set(Object.values(sessionsData).map(s => s.facilitatorId));
  return Array.from(ids);
};

// Session-to-facilitator mapping for easy lookup
export const sessionFacilitatorMap: Record<string, { id: string; name: string; location: string }> = {};
