
import { renderPaymentReceiptEmail, renderReservationEmail, sendEmail } from "@/lib/email";
import { notifyFacilitatorOfIntake } from "@/lib/intakeMail";
import { findStripeAccount } from "@/lib/facilitatorPayout";
import {
  claimBookingForSettlement,
  getBooking,
  listDueBookings,
  markBookingCharged,
  markBookingChargeFailed,
  markIntakeSent,
  markReceiptSent,
  reserveBooking,
} from "@/lib/oriveStore";
import type { OriveBooking } from "@/lib/orivePublic";
import { CONCIERGE_FEE_CENTS, allowStripeSimulation } from "@/lib/payments";
import { bookingPassUrl } from "@/lib/legacyBookingLinks";
import { logError } from "@/lib/safeLog";
import { getStripe } from "@/lib/stripeClient";

function stripeClient() {
  return getStripe();
}

async function sendReceipt(booking: OriveBooking) {
  if (booking.receiptSent || !booking.customerEmail) return;
  const sessionAmount = booking.priceCents / 100;
  const feeAmount = (booking.feeCents ?? CONCIERGE_FEE_CENTS) / 100;
  const receipt = renderPaymentReceiptEmail({
    receiptNumber: `REC-${new Date().getFullYear()}-${booking.id.slice(-6).toUpperCase()}`,
    bookingReference: booking.id,
    sessionTitle: booking.sessionTitle,
    clientName: booking.customerName || "Gast",
    clientEmail: booking.customerEmail,
    amount: sessionAmount + feeAmount,
    sessionAmount,
    feeAmount,
    currency: "EUR",
    date: new Date().toLocaleDateString("de-DE"),
    bookingPassUrl: bookingPassUrl(booking.id),
  });
  await sendEmail({
    to: booking.customerEmail,
    subject: receipt.subject,
    html: receipt.html,
  });
  await markReceiptSent(booking.id);
}

export async function confirmSetupSession(sessionId: string) {
  const stripe = stripeClient();
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId;
  if (!bookingId || session.mode !== "setup" || session.status !== "complete") return null;
  const existing = await getBooking(bookingId);
  if (!existing) return null;
  if (existing.status === "reserved" || existing.status === "paid" || existing.paymentStatus === "card_saved") return existing;

  const setupId = typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent?.id;
  const setup = setupId ? await stripe.setupIntents.retrieve(setupId) : null;
  const paymentMethod = typeof setup?.payment_method === "string" ? setup.payment_method : setup?.payment_method?.id;
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const reserved = await reserveBooking(bookingId, {
    stripeCustomerId: customer,
    stripePaymentMethodId: paymentMethod,
    stripeSessionId: session.id,
  });
  if (!reserved || reserved.intakeSent) return reserved;

  await notifyFacilitatorOfIntake(reserved);
  await markIntakeSent(reserved.id);
  const when = new Date(reserved.startAt);
  const letter = renderReservationEmail({
    sessionTitle: reserved.sessionTitle,
    clientName: reserved.customerName || "Gast",
    whenLabel: Number.isNaN(when.getTime()) ? reserved.startAt : when.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }),
    sessionAmount: `${Math.round(reserved.priceCents / 100)} €`,
    bookingPassUrl: bookingPassUrl(reserved.id),
  });
  if (reserved.customerEmail) {
    await sendEmail({ to: reserved.customerEmail, subject: letter.subject, html: letter.html });
  }
  return reserved;
}

export async function settleBooking(bookingId: string) {
  const current = await getBooking(bookingId);
  if (!current) return { ok: false, error: "not_found" };
  if (current.paymentStatus === "paid" || current.paymentStatus === "waived" || current.status === "cancelled") {
    return { ok: true, skipped: true };
  }
  // S4: atomic claim -> only one concurrent caller (cron / late cancel) proceeds to Stripe.
  const booking = await claimBookingForSettlement(bookingId);
  if (!booking) return { ok: true, skipped: true };

  const stripe = stripeClient();
  // Only accounts with charges_enabled are used as destination (Connect check).
  const account = await findStripeAccount(booking.facilitatorId, booking.facilitatorEmail);
  const canCharge = Boolean(stripe && booking.stripeCustomerId && booking.stripePaymentMethodId);

  if (!canCharge) {
    if (allowStripeSimulation()) {
      const charged = await markBookingCharged(booking.id, { payoutStatus: account ? "transferred" : "awaiting_connect" });
      if (charged) await sendReceipt(charged);
      return { ok: true, mode: "simulation" };
    }
    await markBookingChargeFailed(booking.id);
    return { ok: false, error: "card_missing" };
  }

  try {
    const amount = booking.priceCents + (booking.feeCents ?? CONCIERGE_FEE_CENTS);
    const intent = await stripe!.paymentIntents.create({
      amount,
      currency: booking.currency || "eur",
      customer: booking.stripeCustomerId,
      payment_method: booking.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      description: `ORIVE Session ${booking.id.slice(-8)}`,
      metadata: {
        bookingId: booking.id,
        type: "orive_settlement",
      },
      ...(account
        ? {
            application_fee_amount: booking.feeCents ?? CONCIERGE_FEE_CENTS,
            transfer_data: { destination: account },
          }
        : {}),
    }, { idempotencyKey: `settle-${booking.id}-a${booking.settleAttempts || 1}` });

    if (intent.status === "succeeded") {
      const charged = await markBookingCharged(booking.id, {
        stripePaymentIntentId: intent.id,
        payoutStatus: account ? "transferred" : "awaiting_connect",
      });
      if (charged) await sendReceipt(charged);
      return { ok: true, paymentIntentId: intent.id };
    }

    await markBookingChargeFailed(booking.id);
    return { ok: false, error: intent.status };
  } catch (error) {
    logError("settle", error, { bookingId: booking.id });
    await markBookingChargeFailed(booking.id);
    return { ok: false, error: "charge_failed" };
  }
}

/** Refund a legacy booking: destination charge -> pull back transfer and platform fee. */
export async function refundBooking(bookingId: string) {
  const booking = await getBooking(bookingId);
  const stripe = stripeClient();
  if (!booking?.stripePaymentIntentId || booking.paymentStatus !== "paid") return { ok: false, error: "nothing_to_refund" };
  if (!stripe) return { ok: false, error: "not_configured" };
  try {
    const refund = await stripe.refunds.create(
      {
        payment_intent: booking.stripePaymentIntentId,
        reverse_transfer: booking.payoutStatus === "transferred",
        refund_application_fee: booking.payoutStatus === "transferred",
        metadata: { bookingId: booking.id },
      },
      { idempotencyKey: `refund-${booking.id}` },
    );
    return { ok: true, refundId: refund.id };
  } catch (error) {
    logError("refund", error, { bookingId });
    return { ok: false, error: "refund_failed" };
  }
}

export async function settleDueBookings() {
  const due = await listDueBookings();
  const results: Array<{ id: string } & Record<string, unknown>> = [];
  for (const booking of due) {
    results.push({ id: booking.id, ...(await settleBooking(booking.id)) });
  }
  return results;
}


