import fs from 'fs';
import path from 'path';
import type { IntakeQuestion, OriveBooking, OriveOffering, OriveSlot } from '@/lib/orivePublic';
import { defaultIntakeQuestions, sanitizeQuestions, templateById } from '@/lib/intake';
import { CONCIERGE_FEE_CENTS, cancelDeadline, sessionEndsAt } from '@/lib/payments';
import { pullStore, pushStore, remoteStoreConfigured } from '@/lib/oriveRemote';

export type IntakeFormRecord = {
  id: string;
  name: string;
  questions: IntakeQuestion[];
  facilitatorEmail?: string;
};

function normalizeIntakeForm(raw: unknown): IntakeFormRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as { id?: unknown; name?: unknown; facilitatorId?: unknown; facilitatorEmail?: unknown; questions?: unknown };
  const questions = sanitizeQuestions(item.questions);
  if (!questions.length) return null;
  if (typeof item.id === "string" && typeof item.name === "string" && item.name.trim()) {
    const facilitatorEmail = typeof item.facilitatorEmail === 'string' ? item.facilitatorEmail.trim().toLowerCase() : undefined;
    return { id: item.id.slice(0, 40), name: item.name.trim().slice(0, 80), questions, facilitatorEmail };
  }
  if (typeof item.facilitatorId === "string") {
    const legacyId = item.facilitatorId === "default" ? "form-saved" : `form-${item.facilitatorId}`.slice(0, 40);
    return { id: legacyId, name: "Saved form", questions };
  }
  return null;
}

export type OriveStoreData = {
  offerings: OriveOffering[];
  slots: OriveSlot[];
  bookings: OriveBooking[];
  intakeForms: IntakeFormRecord[];
};

const STORE_FILE = process.env.ORIVE_STORE_FILE
  ? path.resolve(process.env.ORIVE_STORE_FILE)
  : path.resolve(process.cwd(), 'src/data/oriveStore.json');

let memory: OriveStoreData | null = null;
let remoteVersion = 0;
let tail: Promise<void> = Promise.resolve();

function emptyStore(): OriveStoreData {
  return { offerings: [], slots: [], bookings: [], intakeForms: [] };
}

function applyBody(raw: unknown): OriveStoreData {
  const data = raw && typeof raw === 'object' ? raw as OriveStoreData : emptyStore();
  if (!Array.isArray(data.offerings)) return emptyStore();
  data.slots = Array.isArray(data.slots) ? data.slots : [];
  data.bookings = Array.isArray(data.bookings) ? data.bookings : [];
  data.intakeForms = (Array.isArray(data.intakeForms) ? data.intakeForms : [])
    .map(normalizeIntakeForm)
    .filter((form): form is IntakeFormRecord => Boolean(form));
  return data;
}

function load(): OriveStoreData {
  if (memory) return memory;
  try {
    if (fs.existsSync(STORE_FILE)) {
      memory = applyBody(JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8') || '{}'));
      return memory;
    }
  } catch (err) {
    console.warn('[oriveStore] read failed:', err);
  }
  memory = emptyStore();
  return memory;
}

function save(store: OriveStoreData) {
  memory = store;
  if (remoteStoreConfigured()) return;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[oriveStore] persist failed (ephemeral on serverless):', err);
  }
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task, task);
  tail = run.then(() => undefined, () => undefined);
  return run;
}

/** Serializes reads and writes. With a service role key, the document lives in Supabase and updates only if the version still matches. */
function withStore<T>(fn: () => T): Promise<T> {
  return enqueue(async () => {
    if (!remoteStoreConfigured()) return fn();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const row = await pullStore();
      memory = row ? applyBody(row.body) : emptyStore();
      remoteVersion = row?.version || 0;
      const before = structuredClone(memory);
      const result = fn();
      if (JSON.stringify(memory) === JSON.stringify(before)) return result;
      const wrote = await pushStore(remoteVersion, memory);
      if (wrote === 'ok') return result;
    }
    throw new Error('Booking store conflict. Retry.');
  });
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listInventory(): Promise<{ offering: OriveOffering; slots: OriveSlot[] }[]> {
  return withStore(() => {
    const store = load();
    return store.offerings.map((offering) => ({
      offering,
      slots: store.slots.filter((slot) => slot.offeringId === offering.id && slot.spots > 0),
    }));
  });
}

export function listFacilitatorInventory(email: string) {
  return withStore(() => {
    const needle = email.trim().toLowerCase();
    const store = load();
    return store.offerings
      .filter((offering) => offering.facilitator_email.trim().toLowerCase() === needle)
      .map((offering) => ({
        offering,
        slots: store.slots.filter((slot) => slot.offeringId === offering.id),
      }));
  });
}

export function getInventoryItem(offeringId: string) {
  return withStore(() => {
    const store = load();
    const offering = store.offerings.find((item) => item.id === offeringId);
    if (!offering) return null;
    return {
      offering,
      slots: store.slots.filter((slot) => slot.offeringId === offeringId),
    };
  });
}

export function isStoredOriveOffering(offeringId?: string | null) {
  return withStore(() => {
    if (!offeringId) return false;
    return load().offerings.some((item) => item.id === offeringId);
  });
}

export function getStoredSlot(offeringId: string, slotId: string) {
  return withStore(() => load().slots.find((slot) => slot.id === slotId && slot.offeringId === offeringId) || null);
}

export function publishOffering(input: {
  title: string;
  description?: string | null;
  type?: OriveOffering['type'];
  location?: string | null;
  is_online?: boolean;
  tags?: string[];
  facilitator_id: string;
  facilitator_name: string;
  facilitator_email: string;
  duration?: number | null;
  image_url?: string | null;
  startAt: string;
  spots: number;
  priceCents: number;
  intakeFormId?: string | null;
  intakeQuestions?: IntakeQuestion[] | null;
  repeatWeeks?: number | null;
}) {
  return withStore(() => {
  const store = load();
  const offeringId = id('orive');
  const slotId = id('slot');
  const offering: OriveOffering = {
    id: offeringId,
    title: input.title,
    description: input.description || null,
    type: input.type || 'event',
    location: input.location || null,
    is_online: Boolean(input.is_online),
    image_url: input.image_url || null,
    tags: input.tags || [],
    facilitator_id: input.facilitator_id,
    facilitator_name: input.facilitator_name,
    facilitator_email: input.facilitator_email,
    duration: input.duration ?? null,
    createdAt: new Date().toISOString(),
    intakeFormId: input.intakeFormId ?? null,
    intakeQuestions: input.intakeQuestions ?? [],
  };
  const slot: OriveSlot = {
    id: slotId,
    offeringId,
    startAt: input.startAt,
    spots: input.spots,
    priceCents: input.priceCents,
    currency: 'eur',
  };
  const slots: OriveSlot[] = [slot];
  const weeks = Math.min(8, Math.max(1, Math.floor(Number(input.repeatWeeks) || 1)));
  const origin = new Date(input.startAt).getTime();
  for (let week = 1; week < weeks; week += 1) {
    slots.push({
      id: id('slot'),
      offeringId,
      startAt: new Date(origin + week * 7 * 24 * 60 * 60 * 1000).toISOString(),
      spots: input.spots,
      priceCents: input.priceCents,
      currency: 'eur',
    });
  }
  store.offerings.unshift(offering);
  store.slots.unshift(...slots);
  save(store);
  return { offering, slots };
  });
}

export function createPendingBooking(input: Omit<OriveBooking, 'id' | 'createdAt' | 'status' | 'paymentStatus'> & {
  paymentStatus?: OriveBooking['paymentStatus'];
}) {
  return withStore(() => {
    const store = load();
    const booking: OriveBooking = {
      ...input,
      id: id('book'),
      status: 'pending',
      paymentStatus: input.paymentStatus || 'unpaid',
      createdAt: new Date().toISOString(),
    };
    store.bookings.unshift(booking);
    save(store);
    return booking;
  });
}

export function getBooking(bookingId: string) {
  return withStore(() => load().bookings.find((item) => item.id === bookingId) || null);
}

export function deleteBooking(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return false;
    releaseSpot(store, booking);
    store.bookings = store.bookings.filter((item) => item.id !== bookingId);
    save(store);
    return true;
  });
}

export function listBookings() {
  return withStore(() => load().bookings);
}

export function listIntakeForms(facilitatorEmail?: string) {
  return withStore(() => {
    const forms = load().intakeForms;
    const needle = facilitatorEmail?.trim().toLowerCase();
    if (!needle) return forms;
    return forms.filter((form) => form.facilitatorEmail === needle);
  });
}

export function upsertIntakeForm(input: { id?: string; name: string; questions: IntakeQuestion[]; facilitatorEmail?: string }) {
  return withStore(() => {
    const store = load();
    const id = input.id && store.intakeForms.some((form) => form.id === input.id)
      ? input.id
      : `form-${Date.now().toString(36)}`;
    const record: IntakeFormRecord = {
      id,
      name: input.name.trim().slice(0, 80),
      questions: input.questions,
      facilitatorEmail: input.facilitatorEmail?.trim().toLowerCase(),
    };
    store.intakeForms = [record, ...store.intakeForms.filter((form) => form.id !== id)];
    save(store);
    return record;
  });
}

export function deleteIntakeForm(id: string, facilitatorEmail?: string) {
  return withStore(() => {
    const store = load();
    const needle = facilitatorEmail?.trim().toLowerCase();
    store.intakeForms = store.intakeForms.filter((form) => {
      if (form.id !== id) return true;
      if (!needle) return false;
      return form.facilitatorEmail !== needle;
    });
    save(store);
  });
}

export function questionsForOffering(offering: OriveOffering, isDe: boolean) {
  return withStore((): IntakeQuestion[] => {
    if (Array.isArray(offering.intakeQuestions)) return offering.intakeQuestions;
    if (offering.intakeFormId) {
      const template = templateById(offering.intakeFormId, isDe);
      if (template) return template.questions;
      const own = load().intakeForms.find((form) => form.id === offering.intakeFormId);
      if (own) return own.questions;
      return [];
    }
    return defaultIntakeQuestions(isDe);
  });
}

export function resolveIntakeChoice(formId: string | null, isDe: boolean) {
  return withStore(() => {
    if (!formId) return { id: null as string | null, questions: [] as IntakeQuestion[] };
    const template = templateById(formId, isDe);
    if (template) return { id: template.id, questions: template.questions };
    const own = load().intakeForms.find((form) => form.id === formId);
    if (own) return { id: own.id, questions: own.questions };
    return { error: "Unknown intake form." as const };
  });
}

function holdSpot(store: { slots: OriveSlot[] }, booking: OriveBooking) {
  if (booking.spotHeld) return true;
  const slot = store.slots.find((item) => item.id === booking.slotId);
  if (!slot || slot.spots < 1) return false;
  slot.spots -= 1;
  booking.spotHeld = true;
  return true;
}

function releaseSpot(store: { slots: OriveSlot[] }, booking: OriveBooking) {
  if (!booking.spotHeld) return;
  const slot = store.slots.find((item) => item.id === booking.slotId);
  if (slot) slot.spots += 1;
  booking.spotHeld = false;
}

export function markBookingPaid(bookingId: string, stripeSessionId?: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    if (booking.status === 'paid') return booking;
    booking.status = 'paid';
    booking.paymentStatus = 'paid';
    booking.paidAt = new Date().toISOString();
    booking.chargedAt = booking.chargedAt || booking.paidAt;
    if (stripeSessionId) booking.stripeSessionId = stripeSessionId;
    holdSpot(store, booking);
    save(store);
    return booking;
  });
}

export function reserveBooking(bookingId: string, input: {
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripeSessionId?: string;
  simulated?: boolean;
}) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    if (booking.status === 'cancelled' || booking.status === 'refunded') return booking;
    if (booking.status === 'paid') return booking;
    if (booking.status === 'reserved' && booking.spotHeld) return booking;
    if (!holdSpot(store, booking)) return null;
    booking.status = 'reserved';
    booking.paymentStatus = input.simulated ? 'simulated' : 'card_saved';
    booking.feeCents = CONCIERGE_FEE_CENTS;
    if (input.stripeCustomerId) booking.stripeCustomerId = input.stripeCustomerId;
    if (input.stripePaymentMethodId) booking.stripePaymentMethodId = input.stripePaymentMethodId;
    if (input.stripeSessionId) booking.stripeSessionId = input.stripeSessionId;
    save(store);
    return booking;
  });
}

export function markBookingCharged(bookingId: string, input: {
  stripePaymentIntentId?: string;
  payoutStatus: OriveBooking['payoutStatus'];
}) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    if (booking.paymentStatus === 'paid') return booking;
    booking.status = 'paid';
    booking.paymentStatus = 'paid';
    booking.paidAt = new Date().toISOString();
    booking.chargedAt = booking.paidAt;
    booking.payoutStatus = input.payoutStatus;
    if (input.stripePaymentIntentId) booking.stripePaymentIntentId = input.stripePaymentIntentId;
    save(store);
    return booking;
  });
}

export function markBookingChargeFailed(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking || booking.paymentStatus === 'paid') return booking || null;
    booking.status = 'charge_failed';
    booking.paymentStatus = 'failed';
    save(store);
    return booking;
  });
}

export function markBookingRefunded(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    booking.status = 'refunded';
    booking.paymentStatus = 'refunded';
    save(store);
    return booking;
  });
}

export function markIntakeSent(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    booking.intakeSent = true;
    save(store);
    return booking;
  });
}

export function markReceiptSent(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    booking.receiptSent = true;
    save(store);
    return booking;
  });
}

export function markReminderSent(bookingId: string) {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return null;
    booking.reminderSent = true;
    save(store);
    return booking;
  });
}

/** Guest cancel inside the window, or any facilitator cancel, releases the place and does not charge. */
export function cancelBooking(bookingId: string, by: 'guest' | 'facilitator') {
  return withStore(() => {
    const store = load();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking) return { error: 'not_found' as const };
    if (booking.status === 'paid' || booking.paymentStatus === 'paid') return { error: 'already_charged' as const, booking };
    if (booking.status === 'cancelled' || booking.paymentStatus === 'waived') return { error: 'already_cancelled' as const, booking };
    const late = by === 'guest' && Date.now() > cancelDeadline(booking.startAt);
    if (late) return { error: 'late' as const, booking };
    booking.status = 'cancelled';
    booking.paymentStatus = 'waived';
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = by;
    releaseSpot(store, booking);
    save(store);
    return { error: null, booking };
  });
}

export function listDueBookings(now = Date.now()) {
  return withStore(() => load().bookings.filter((booking) => {
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'waived' || booking.paymentStatus === 'refunded') return false;
    if (booking.status === 'cancelled' || booking.status === 'pending') return false;
    if (booking.status !== 'reserved' && booking.status !== 'charge_failed') return false;
    return sessionEndsAt(booking.startAt, booking.durationMin) <= now;
  }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** One reminder, once, for a card already saved at least a day before the session. */
export function listReminderBookings(now = Date.now()) {
  return withStore(() => load().bookings.filter((booking) => {
    if (booking.reminderSent || booking.status !== 'reserved') return false;
    if (booking.paymentStatus !== 'card_saved' && booking.paymentStatus !== 'simulated') return false;
    const start = new Date(booking.startAt).getTime();
    const created = new Date(booking.createdAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(created)) return false;
    const until = start - now;
    if (until > DAY_MS || until < 2 * 60 * 60 * 1000) return false;
    return created <= start - DAY_MS;
  }));
}
