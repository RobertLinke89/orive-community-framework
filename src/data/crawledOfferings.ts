import type { PublicOffering } from '@/hooks/usePublicOfferings';
import type { Facilitator } from '@/data/facilitatorsData';
import rawData from './crawledOfferings.json';
import { cleanOfferTitle, dedupeLocation, isJunkOfferTitle, isSafeAvatarUrl } from '@/lib/offerQuality';

const AUTHENTIC_PLATFORMS = new Set([
  'Eventbrite',
  'Eventbrite Europe',
  'Wim Hof Method Official',
]);

export function isAuthenticCrawledOffering(item: {
  id?: string;
  source_url?: string | null;
  source_platform?: string | null;
  image_url?: string | null;
  facilitator_name?: string | null;
}): boolean {
  const source = String(item.source_url || '').toLowerCase();
  const platform = String(item.source_platform || '');
  const name = String(item.facilitator_name || '').toLowerCase();
  if (name.includes('test') || source.includes('example.com')) return false;
  if (source.includes('orive.co/')) return false;
  if (platform === 'European Retreat Sanctuaries' || platform === 'European Community Network') return false;
  const hasEventPhoto = String(item.image_url || '').includes('evbuc.com');
  if (AUTHENTIC_PLATFORMS.has(platform) && hasEventPhoto) return true;
  if ((source.includes('eventbrite.') || source.includes('wimhofmethod.com')) && hasEventPhoto) return true;
  return hasEventPhoto;
}

// Helper to roll forward any past date to upcoming schedule
export function ensureRollingUpcomingDate(startAt: string | null | undefined): string | null {
  if (!startAt) return null;
  const now = new Date();
  const date = new Date(startAt);
  if (isNaN(date.getTime())) return null;

  // If date is in the past, advance by 7-day increments (preserving weekday and time)
  if (date.getTime() < now.getTime()) {
    const diffMs = now.getTime() - date.getTime();
    const weeksToAdd = Math.ceil(diffMs / (7 * 86400000)) + 1;
    date.setTime(date.getTime() + weeksToAdd * 7 * 86400000);
  }
  return date.toISOString();
}

function isUpcoming(startAt: string | null | undefined): boolean {
  if (!startAt) return false;
  const t = new Date(startAt).getTime();
  return Number.isFinite(t) && t >= Date.now();
}

// Partner listings as published. Dates are not rolled forward. Past starts are dropped.
export const crawledOfferings: PublicOffering[] = (rawData as any[])
  .filter((item) => isUpcoming(item?.start_at) && !isJunkOfferTitle(item?.title))
  .map((item) => ({
    id: String(item.id),
    title: cleanOfferTitle(String(item.title)),
    description: item.description ? String(item.description) : null,
    type: (item.type === 'individual' ? 'individual' : item.type === 'group' ? 'group' : 'event') as 'individual' | 'group' | 'event',
    price: item.price ? String(item.price) : null,
    duration: typeof item.duration === 'number' ? item.duration : null,
    location: item.location ? dedupeLocation(String(item.location)) : null,
    is_online: Boolean(item.is_online),
    image_url: item.image_url ? String(item.image_url) : null,
    capacity: typeof item.capacity === 'number' ? item.capacity : null,
    start_at: item.start_at ? String(item.start_at) : null,
    end_at: item.end_at ? String(item.end_at) : null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    facilitator_id: String(item.facilitator_id || 'fac-crawled'),
    facilitator_name: item.facilitator_name ? String(item.facilitator_name) : undefined,
    facilitator_avatar: isSafeAvatarUrl(item.facilitator_avatar) ? String(item.facilitator_avatar) : undefined,
    source_platform: item.source_platform ? String(item.source_platform) : undefined,
    source_url: item.source_url ? String(item.source_url) : undefined,
    crawled_at: item.crawled_at ? String(item.crawled_at) : undefined,
    fulfillment: item.source_url ? 'external' : 'unlisted',
  }));

export const crawledOfferingsSessions: PublicOffering[] = crawledOfferings.filter(
  o => o.type === 'individual'
);

export const crawledOfferingsEvents: PublicOffering[] = crawledOfferings.filter(
  o => o.type === 'event' || o.type === 'group'
);

// Helper to look up a crawled offering by ID
export const getCrawledOfferingById = (id: string): PublicOffering | undefined => {
  return crawledOfferings.find(o => o.id === id);
};

// Extract unique facilitators from crawled offerings
const facMap = new Map<string, Facilitator>();

// Only organisers with a verifiable public source (Eventbrite / wimhofmethod.com). The synthetic seed entries
// ("European Retreat Sanctuaries", "European Community Network", "… Mentors", orive.co/experience/… links) are demo data
// and are no longer turned into facilitator profiles (removed 2026-11-09).
export function isRealCrawledSource(item: { source_url?: string | null }): boolean {
  const u = String(item?.source_url || '').toLowerCase();
  return /^https?:\/\/([a-z0-9-]+\.)*(eventbrite\.[a-z.]+|wimhofmethod\.com)\//.test(u);
}

(rawData as any[]).forEach(item => {
  if (!isRealCrawledSource(item)) return;
  const facId = String(item.facilitator_id || 'fac-crawled');
  if (!facMap.has(facId)) {
    const name = item.facilitator_name ? String(item.facilitator_name) : 'Facilitator';
    const username = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const location = item.location ? String(item.location) : '';
    const sourcePlatform = item.source_platform || undefined;
    const sourceUrl = item.source_url || undefined;
    const isWimHof = sourcePlatform === 'Wim Hof Method';
    const professionalTitle = isWimHof
      ? 'Wim Hof Method Trainer'
      : (tags[0] || undefined);

    const bio = isWimHof
      ? `${name} is listed as a Wim Hof Method trainer${location ? ` in ${location}` : ''}. This profile is sourced from the partner listing, not verified by ORIVE.`
      : `${name} is listed as the organizer${location ? ` in ${location}` : ''}${sourcePlatform ? ` on ${sourcePlatform}` : ''}. This profile is sourced from the partner listing, not verified by ORIVE.`;

    facMap.set(facId, {
      id: facId,
      username,
      name,
      avatar: isSafeAvatarUrl(item.facilitator_avatar) ? String(item.facilitator_avatar) : '',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      views: 0,
      tags,
      hourlyRate: item.type === 'individual' && item.price ? String(item.price) : '',
      location,
      professionalTitle,
      bio,
      source_platform: sourcePlatform,
      source_url: sourceUrl,
      isClaimed: false,
    });
  }
});

export const crawledFacilitators: Facilitator[] = Array.from(facMap.values());

// Helper to look up a crawled facilitator by ID or username
export const getCrawledFacilitatorById = (id: string): Facilitator | undefined => {
  return crawledFacilitators.find(f => f.id === id || f.username === id);
};
