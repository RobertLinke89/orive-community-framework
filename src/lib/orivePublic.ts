import type { PublicOffering } from '@/hooks/usePublicOfferings';

export type OriveOffering = {
  id: string;
  title: string;
  description: string | null;
  type: 'individual' | 'group' | 'event';
  location: string | null;
  is_online: boolean;
  image_url: string | null;
  tags: string[];
  facilitator_id: string;
  facilitator_name: string;
  facilitator_email: string;
  duration: number | null;
  createdAt: string;
  intakeFormId?: string | null;
  intakeQuestions?: IntakeQuestion[] | null;
};

export type OriveSlot = {
  id: string;
  offeringId: string;
  startAt: string;
  spots: number;
  priceCents: number;
  currency: 'eur';
};

export type IntakeQuestion = {
  id: string;
  prompt: string;
  required: boolean;
};

export type IntakeAnswer = {
  questionId: string;
  prompt: string;
  answer: string;
};

export type OriveBooking = {
  id: string;
  offeringId: string;
  slotId: string;
  sessionTitle: string;
  facilitatorId?: string;
  facilitatorName: string;
  facilitatorEmail: string;
  customerName: string;
  customerEmail: string;
  startAt: string;
  durationMin?: number | null;
  priceCents: number;
  feeCents?: number;
  currency: 'eur';
  location: string | null;
  status: 'pending' | 'reserved' | 'paid' | 'cancelled' | 'charge_failed' | 'refunded';
  paymentStatus: 'unpaid' | 'card_saved' | 'processing' | 'paid' | 'failed' | 'refunded' | 'waived' | 'simulated';
  settleAttempts?: number;
  payoutStatus?: 'transferred' | 'awaiting_connect' | 'none';
  spotHeld?: boolean;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  paidAt?: string;
  chargedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'guest' | 'facilitator';
  intakeSent?: boolean;
  receiptSent?: boolean;
  reminderSent?: boolean;
  intake?: IntakeAnswer[];
};

export type OriveInventoryItem = {
  offering: OriveOffering;
  slots: OriveSlot[];
};

export function nextOpenSlot(slots: OriveSlot[]): OriveSlot | undefined {
  return [...slots]
    .filter((slot) => slot.spots > 0 && new Date(slot.startAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
}

export function toPublicOffering(offering: OriveOffering, slots: OriveSlot[]): PublicOffering {
  const slot = nextOpenSlot(slots) || slots[0];
  return {
    id: offering.id,
    title: offering.title,
    description: offering.description,
    type: offering.type,
    price: slot ? `€${Math.round(slot.priceCents / 100)}` : null,
    duration: offering.duration,
    location: offering.location,
    is_online: offering.is_online,
    image_url: offering.image_url,
    capacity: slot?.spots ?? null,
    start_at: slot?.startAt ?? null,
    tags: offering.tags,
    facilitator_id: offering.facilitator_id,
    facilitator_name: offering.facilitator_name,
    fulfillment: 'orive',
  };
}

export function toExperience(offering: OriveOffering, slots: OriveSlot[]) {
  return {
    id: offering.id,
    title: offering.title,
    facilitatorId: offering.facilitator_id,
    facilitatorName: offering.facilitator_name,
    facilitatorAvatar: '',
    price: nextOpenSlot(slots) ? Math.round(nextOpenSlot(slots)!.priceCents / 100) : 0,
    duration: offering.duration ? `${offering.duration} min` : '',
    location: offering.location || '',
    category: offering.tags[0] || '',
    image: offering.image_url || '',
    type: offering.type,
    is_online: offering.is_online,
    groupSize: '',
    tags: offering.tags,
    description: offering.description || '',
    dates: slots.map((slot) => {
      const start = new Date(slot.startAt);
      return {
        date: start.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
        time: start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        spots: slot.spots,
      };
    }),
    reviews: [],
    fulfillment: 'orive',
  };
}
