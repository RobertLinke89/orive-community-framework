export type { OriveSlot } from '@/lib/orivePublic';

export const oriveInventory = [];

export function isOriveOfferingId(id?: string | null): boolean {
  return Boolean(id && String(id).startsWith('orive-'));
}

export function getOriveSlots(_offeringId: string) {
  return [];
}
