import { format } from 'date-fns';
import { parsePriceString, roundToCents } from '@/lib/pricing';

/** Flat Orive platform fee per confirmed session booking (EUR). Mirrors the DB default. */
export const ORIVE_PLATFORM_FEE_EUR = 1.0;

export type SessionBookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'expired';

export interface FreeSlot {
  slot_start: string;
  slot_end: string;
}

export interface SessionBookingRow {
  id: string;
  offering_id: string;
  facilitator_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  start_at: string;
  end_at: string;
  status: SessionBookingStatus;
  price_amount: number;
  platform_fee_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only real Supabase rows (UUIDs) can use the slot calendar; mock/crawled ids ("fac-…") cannot. */
export function isUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function groupSlotsByDate(slots: FreeSlot[]): Map<string, FreeSlot[]> {
  const map = new Map<string, FreeSlot[]>();
  for (const slot of slots) {
    const key = format(new Date(slot.slot_start), 'yyyy-MM-dd');
    const list = map.get(key);
    if (list) list.push(slot);
    else map.set(key, [slot]);
  }
  return map;
}

export function sessionPriceSummary(sessionPrice: string) {
  const parsed = parsePriceString(sessionPrice);
  const price = parsed.amount ?? 0;
  const fee = ORIVE_PLATFORM_FEE_EUR;
  return {
    price: roundToCents(price),
    fee,
    total: roundToCents(price + fee),
  };
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

/**
 * TODO(notifications): hook for e-mail / WhatsApp notifications on booking
 * status changes. Intentionally a no-op: no messages are sent yet.
 * Wire this to supabase/functions/notify-booking-update (or Resend) later.
 */
export async function notifySessionBookingStatusChange(
  _booking: Pick<SessionBookingRow, 'id' | 'status' | 'customer_email' | 'start_at'>,
): Promise<void> {
  // intentionally empty
}
