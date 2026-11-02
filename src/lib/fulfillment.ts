import { isOriveOfferingId } from '@/data/oriveInventory';

export type FulfillmentMode = 'orive' | 'external' | 'unlisted';

export function resolveFulfillment(input: {
  id?: string | null;
  fulfillment?: FulfillmentMode | null;
  source_url?: string | null;
}): FulfillmentMode {
  if (isOriveOfferingId(input.id)) return 'orive';
  if (input.fulfillment === 'orive' || input.fulfillment === 'external' || input.fulfillment === 'unlisted') {
    return input.fulfillment;
  }
  if (input.source_url) return 'external';
  return 'unlisted';
}

export function isOriveBookable(input: {
  id?: string | null;
  fulfillment?: FulfillmentMode | null;
  source_url?: string | null;
}): boolean {
  return resolveFulfillment(input) === 'orive';
}

export function partnerLabel(platform?: string | null): string {
  const raw = String(platform || '').trim();
  if (!raw) return 'Partner';
  if (/eventbrite/i.test(raw)) return 'Eventbrite';
  return raw;
}
