import type Stripe from "stripe";
import { appOrigin } from "@/lib/appOrigin";
import { createBookingToken, hashToken } from "@/lib/bookingToken";
import { encryptField } from "@/lib/fieldCrypto";
import { CANCEL_WINDOW_MS } from "@/lib/payments";
import { getRepos, RepoError, type SessionBookingRecord } from "@/lib/paymentRepo";
import { logError } from "@/lib/safeLog";
import { getStripe } from "@/lib/stripeClient";
import { sendEmail } from "@/lib/email";

/**
 * Payment flow for calendar bookings (public.session_bookings):
 *   1. createSessionCheckout  -> pending hold (35 min) + Stripe Checkout (mode=setup, card saved, no charge)
 *   2. webhook checkout.session.completed -> payment_status=card_saved (hold no longer expires)
 *      webhook checkout.session.expired / cron expireHolds -> status=expired, slot free again
 *   3. facilitator confirm (requires Stripe Connect charges_enabled) -> status=confirmed
 *   4. cron settleDueSessionBookings after the session -> destination charge price+fee,
 *      application_fee_amount = platform fee, idempotency key per attempt, atomic DB claim
 *   5. decline/cancel after charge -> refund with reverse_transfer + refund_application_fee
 */

export const SETUP_TYPE = "orive_session_setup";
export const CHARGE_TYPE = "orive_session_charge";
const CHECKOUT_TTL_S = 30 * 60; // Stripe minimum

export type FlowResult<T = Record<string, unknown>> = ({ ok: true } & T) | { ok: false; status: number; error: string };

type Mailer = (to: string, subject: string, html: string) => Promise<void>;
let mailer: Mailer = async (to, subject, html) => {
  await sendEmail({ to, subject, html });
};
export function setMailerForTests(fn: Mailer | null) {
  mailer = fn || (async (to, subject, html) => { await sendEmail({ to, subject, html }); });
}

export function amountCents(record: Pick<SessionBookingRecord, "price_amount" | "platform_fee_amount">) {
  const price = Math.round(Number(record.price_amount) * 100);
  const fee = Math.round(Number(record.platform_fee_amount) * 100);
  return { price, fee, total: price + fee };
}

export function bookingLink(id: string, token: string) {
  return `${appOrigin()}/booking/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`;
}

/** Customer-facing view without internal/Stripe fields. */
export function publicView(record: SessionBookingRecord, withContact: boolean) {
  const { price, fee, total } = amountCents(record);
  return {
    id: record.id,
    startAt: record.start_at,
    endAt: record.end_at,
    status: record.status,
    paymentStatus: record.payment_status,
    holdExpiresAt: record.status === "pending" && record.payment_status === "awaiting_card" ? record.hold_expires_at : null,
    priceCents: price,
    feeCents: fee,
    totalCents: total,
    currency: record.currency,
    canCancel: ["pending", "confirmed"].includes(record.status) && Date.now() < new Date(record.start_at).getTime() - CANCEL_WINDOW_MS,
    ...(withContact ? { customerName: record.customer_name, customerEmail: record.customer_email } : {}),
  };
}

// ---------------------------------------------------------------------------
// 1. Booking -> setup checkout
// ---------------------------------------------------------------------------
export async function createSessionCheckout(input: {
  offeringId: string;
  startAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  notes?: string | null;
  intake?: unknown;
  healthDataConsent?: boolean;
}): Promise<FlowResult<{ bookingId: string; url: string; token: string; holdExpiresAt: string | null }>> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, status: 503, error: "Payments are not configured." };
  if (input.intake !== undefined && input.intake !== null && !input.healthDataConsent) {
    return { ok: false, status: 400, error: "Consent for processing health-related intake answers is required." };
  }
  const { sessions } = getRepos();
  let booking: SessionBookingRecord;
  try {
    booking = await sessions.insert({
      offering_id: input.offeringId,
      start_at: input.startAt,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone || null,
      notes: input.notes || null,
      intake_ciphertext: input.intake ? encryptField(JSON.stringify(input.intake)) : null,
      health_data_consent_at: input.intake ? new Date().toISOString() : null,
    });
  } catch (error) {
    const code = error instanceof RepoError ? error.code : "";
    if (code === "23P01") return { ok: false, status: 409, error: "This slot was just taken." };
    if (code === "53400") return { ok: false, status: 429, error: "Too many open bookings. Please try again later." };
    if (code === "P0002") return { ok: false, status: 404, error: "Offering not found." };
    logError("session-checkout.insert", error);
    return { ok: false, status: 500, error: "Booking could not be created." };
  }

  const token = createBookingToken(booking.id);
  try {
    const customer = await stripe.customers.create(
      { email: booking.customer_email, name: booking.customer_name, metadata: { bookingId: booking.id } },
      { idempotencyKey: `session-customer-${booking.id}` },
    );
    const session = await stripe.checkout.sessions.create(
      {
        mode: "setup",
        customer: customer.id,
        payment_method_types: ["card"],
        currency: "eur",
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_S,
        client_reference_id: booking.id,
        metadata: { bookingId: booking.id, type: SETUP_TYPE },
        setup_intent_data: { metadata: { bookingId: booking.id, type: SETUP_TYPE } },
        success_url: `${bookingLink(booking.id, token)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${bookingLink(booking.id, token)}&payment=cancelled`,
      },
      { idempotencyKey: `session-setup-${booking.id}` },
    );
    await sessions.update(booking.id, {
      stripe_customer_id: customer.id,
      stripe_checkout_session_id: session.id,
      access_token_hash: hashToken(token),
    });
    return { ok: true, bookingId: booking.id, url: session.url as string, token, holdExpiresAt: booking.hold_expires_at };
  } catch (error) {
    logError("session-checkout.stripe", error, { bookingId: booking.id });
    await sessions.update(booking.id, { status: "expired", payment_status: "released" }, { status: "pending", payment_status: "awaiting_card" });
    return { ok: false, status: 502, error: "Payment provider unavailable." };
  }
}

// ---------------------------------------------------------------------------
// 2. Webhook handlers (called after signature check + event de-duplication)
// ---------------------------------------------------------------------------
export async function onSetupCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const { sessions } = getRepos();
  const bookingId = session.metadata?.bookingId;
  if (!stripe || !bookingId || session.mode !== "setup" || session.status !== "complete") return "ignored";
  const booking = await sessions.get(bookingId);
  if (!booking || booking.stripe_checkout_session_id !== session.id) return "unknown_booking";

  const setupId = typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent?.id;
  const setup = setupId ? await stripe.setupIntents.retrieve(setupId) : null;
  const paymentMethod = typeof setup?.payment_method === "string" ? setup.payment_method : setup?.payment_method?.id;
  if (!paymentMethod) return "no_payment_method";

  const saved = await sessions.update(
    booking.id,
    { payment_status: "card_saved", stripe_payment_method_id: paymentMethod, hold_expires_at: null },
    { status: "pending", payment_status: "awaiting_card" },
  );
  if (!saved) {
    // Hold expired (or cancelled) before the card arrived: detach the card, tell the guest.
    await stripe.paymentMethods.detach(paymentMethod).catch((e) => logError("session.detach", e, { bookingId }));
    await mailer(booking.customer_email, "Dein Termin ist leider abgelaufen", "<p>Die Reservierung ist abgelaufen, bevor die Karte gespeichert wurde. Es wurde nichts belastet. Bitte buche einen neuen Termin.</p>");
    return "hold_expired";
  }
  await mailer(saved.customer_email, "Termin angefragt", "<p>Deine Karte ist hinterlegt (noch keine Belastung). Der Facilitator bestätigt deinen Termin in Kürze.</p>");
  return "card_saved";
}

export async function onCheckoutExpired(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId || session.metadata?.type !== SETUP_TYPE) return "ignored";
  const expired = await getRepos().sessions.update(
    bookingId,
    { status: "expired", payment_status: "released" },
    { status: "pending", payment_status: "awaiting_card" },
  );
  return expired ? "expired" : "noop";
}

export async function onPaymentIntent(intent: Stripe.PaymentIntent, succeeded: boolean) {
  if (intent.metadata?.type !== CHARGE_TYPE || !intent.metadata.bookingId) return "ignored";
  const { sessions } = getRepos();
  const patch: Partial<SessionBookingRecord> = succeeded
    ? { payment_status: "paid", stripe_payment_intent_id: intent.id, paid_at: new Date().toISOString(), payout_status: "transferred" }
    : { payment_status: "failed", stripe_payment_intent_id: intent.id };
  const current = await sessions.get(intent.metadata.bookingId);
  if (!current || current.payment_status === "paid" || current.payment_status === "refunded") return "noop";
  await sessions.update(current.id, patch);
  return succeeded ? "paid" : "failed";
}

export async function onChargeRefunded(charge: Stripe.Charge) {
  const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intentId) return "ignored";
  const { sessions } = getRepos();
  const booking = await sessions.getByPaymentIntent(intentId);
  if (!booking) return "ignored";
  if (!charge.refunded) return "partial_refund";
  await sessions.update(booking.id, { payment_status: "refunded", refunded_at: new Date().toISOString(), payout_status: "reversed" });
  return "refunded";
}

export async function onAccountUpdated(account: Stripe.Account) {
  await getRepos().payouts.updateFlagsByStripeAccount(account.id, {
    charges_enabled: Boolean(account.charges_enabled),
    payouts_enabled: Boolean(account.payouts_enabled),
    details_submitted: Boolean(account.details_submitted),
  });
  return "account_updated";
}

// ---------------------------------------------------------------------------
// 3. Facilitator decisions
// ---------------------------------------------------------------------------
export async function facilitatorDecision(
  actorUserId: string,
  bookingId: string,
  action: "confirm" | "decline" | "cancel",
): Promise<FlowResult<{ booking: ReturnType<typeof publicView>; refunded?: boolean }>> {
  const { sessions, payouts } = getRepos();
  const booking = await sessions.get(bookingId);
  if (!booking || booking.facilitator_id !== actorUserId) return { ok: false, status: 404, error: "Booking not found." };

  if (action === "confirm") {
    if (booking.status !== "pending") return { ok: false, status: 409, error: "Booking is not pending." };
    if (booking.payment_status !== "card_saved") return { ok: false, status: 409, error: "Guest has not saved a card yet." };
    const account = await payouts.getByUserId(actorUserId);
    if (!account?.stripe_account_id || !account.charges_enabled) {
      return { ok: false, status: 409, error: "Finish Stripe onboarding (charges not enabled) before confirming." };
    }
    const updated = await sessions.update(
      booking.id,
      { status: "confirmed", stripe_destination_account: account.stripe_account_id },
      { status: "pending", payment_status: "card_saved" },
    );
    if (!updated) return { ok: false, status: 409, error: "Booking changed, reload." };
    await mailer(updated.customer_email, "Termin bestätigt", "<p>Dein Termin ist bestätigt. Abgebucht wird erst nach der Session.</p>");
    return { ok: true, booking: publicView(updated, false) };
  }

  const nextStatus = action === "decline" ? "declined" : "cancelled";
  if (action === "decline" && booking.status !== "pending") return { ok: false, status: 409, error: "Only pending bookings can be declined." };
  if (!["pending", "confirmed"].includes(booking.status)) return { ok: false, status: 409, error: "Booking already closed." };

  if (booking.payment_status === "paid") {
    const refund = await refundSessionBooking(booking.id);
    if (!refund.ok) return refund;
    const updated = await sessions.update(booking.id, { status: nextStatus });
    return { ok: true, booking: publicView(updated || booking, false), refunded: true };
  }
  if (booking.payment_status === "processing") return { ok: false, status: 409, error: "Payment in progress, try again shortly." };
  const updated = await sessions.update(booking.id, { status: nextStatus, payment_status: "released" }, { status: booking.status, payment_status: booking.payment_status });
  if (!updated) return { ok: false, status: 409, error: "Booking changed, reload." };
  await mailer(updated.customer_email, "Termin abgesagt", "<p>Der Facilitator hat den Termin abgesagt. Es wurde nichts belastet.</p>");
  return { ok: true, booking: publicView(updated, false) };
}

// ---------------------------------------------------------------------------
// Guest cancel (token-authenticated). Late cancellations are NOT charged immediately;
// confirmed bookings stay due and are settled after the session per the 24h policy.
// ---------------------------------------------------------------------------
export async function guestCancel(bookingId: string, now = Date.now()): Promise<FlowResult> {
  const { sessions } = getRepos();
  const booking = await sessions.get(bookingId);
  if (!booking) return { ok: false, status: 404, error: "Booking not found." };
  if (!["pending", "confirmed"].includes(booking.status)) return { ok: false, status: 409, error: "Booking already closed." };
  const start = new Date(booking.start_at).getTime();
  if (!Number.isFinite(start)) return { ok: false, status: 409, error: "Invalid booking date." };
  if (now > start - CANCEL_WINDOW_MS && booking.status === "confirmed") {
    return { ok: false, status: 409, error: "late_cancellation" };
  }
  const updated = await sessions.update(
    booking.id,
    { status: "cancelled", payment_status: "released" },
    { status: booking.status, payment_status: booking.payment_status },
  );
  if (!updated) return { ok: false, status: 409, error: "Booking changed, reload." };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 4. Settlement (cron)
// ---------------------------------------------------------------------------
export async function settleSessionBooking(bookingId: string): Promise<FlowResult<{ paymentIntentId?: string; skipped?: boolean }>> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, status: 503, error: "Payments are not configured." };
  const { sessions, payouts } = getRepos();
  const claimed = await sessions.claimForSettlement(bookingId); // atomic: card_saved|failed -> processing
  if (!claimed) return { ok: true, skipped: true };

  const account = await payouts.getByUserId(claimed.facilitator_id);
  const destination = account?.charges_enabled ? account.stripe_account_id : null;
  if (!destination || !claimed.stripe_customer_id || !claimed.stripe_payment_method_id) {
    await sessions.update(claimed.id, { payment_status: "failed" }, { payment_status: "processing" });
    return { ok: false, status: 409, error: !destination ? "connect_not_ready" : "card_missing" };
  }
  const { fee, total } = amountCents(claimed);
  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: total,
        currency: "eur",
        customer: claimed.stripe_customer_id,
        payment_method: claimed.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        description: `ORIVE Session ${claimed.id.slice(0, 8)}`,
        metadata: { bookingId: claimed.id, type: CHARGE_TYPE },
        application_fee_amount: fee,
        transfer_data: { destination },
      },
      { idempotencyKey: `session-settle-${claimed.id}-a${claimed.settle_attempts}` },
    );
    if (intent.status === "succeeded") {
      const paid = await sessions.update(claimed.id, {
        payment_status: "paid",
        stripe_payment_intent_id: intent.id,
        paid_at: new Date().toISOString(),
        payout_status: "transferred",
      });
      if (paid) await mailer(paid.customer_email, "Zahlungsbeleg ORIVE", `<p>Belastet: ${(total / 100).toFixed(2).replace(".", ",")} € (inkl. ${(fee / 100).toFixed(2).replace(".", ",")} € Plattformgebühr).</p>`);
      return { ok: true, paymentIntentId: intent.id };
    }
    await sessions.update(claimed.id, { payment_status: "failed", stripe_payment_intent_id: intent.id });
    return { ok: false, status: 402, error: intent.status };
  } catch (error) {
    logError("session-settle", error, { bookingId: claimed.id });
    await sessions.update(claimed.id, { payment_status: "failed" }, { payment_status: "processing" });
    return { ok: false, status: 402, error: "charge_failed" };
  }
}

export async function settleDueSessionBookings(now = new Date()) {
  const ids = await getRepos().sessions.listDueIds(now.toISOString());
  const results: Array<{ id: string } & Record<string, unknown>> = [];
  for (const id of ids) results.push({ id, ...(await settleSessionBooking(id)) });
  return results;
}

// ---------------------------------------------------------------------------
// 5. Refund (destination charge: pull back the transfer and the platform fee)
// ---------------------------------------------------------------------------
export async function refundSessionBooking(bookingId: string): Promise<FlowResult<{ refundId: string }>> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, status: 503, error: "Payments are not configured." };
  const { sessions } = getRepos();
  const booking = await sessions.get(bookingId);
  if (!booking?.stripe_payment_intent_id || booking.payment_status !== "paid") return { ok: false, status: 409, error: "Nothing to refund." };
  try {
    const refund = await stripe.refunds.create(
      { payment_intent: booking.stripe_payment_intent_id, reverse_transfer: true, refund_application_fee: true, metadata: { bookingId: booking.id } },
      { idempotencyKey: `session-refund-${booking.id}` },
    );
    await sessions.update(booking.id, { payment_status: "refunded", refunded_at: new Date().toISOString(), payout_status: "reversed" });
    await mailer(booking.customer_email, "Erstattung ORIVE", "<p>Der Betrag wurde vollständig erstattet.</p>");
    return { ok: true, refundId: refund.id };
  } catch (error) {
    logError("session-refund", error, { bookingId });
    return { ok: false, status: 502, error: "Refund failed." };
  }
}

export async function expireSessionHolds() {
  return getRepos().sessions.expireHolds();
}
