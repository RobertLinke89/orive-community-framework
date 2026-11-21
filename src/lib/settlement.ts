import Stripe from "stripe";
import { renderPaymentReceiptEmail, renderReservationEmail, sendEmail } from "@/lib/email";
import { notifyFacilitatorOfIntake } from "@/lib/intakeMail";
import { findStripeAccount } from "@/lib/facilitatorPayout";
import {
  getBooking,
  listDueBookings,
  markBookingCharged,
  markBookingChargeFailed,
  markIntakeSent,
  markReceiptSent,
  reserveBooking,
} from "@/lib/oriveStore";
import type { OriveBooking } from "@/lib/orivePublic";
import { CONCIERGE_FEE_CENTS, allowStripeSimulation, isStripeKeyUsable } from "@/lib/payments";

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isStripeKeyUsable(key)) return null;
  return new Stripe(key as string, { apiVersion: "2024-06-20" as Stripe.StripeConfig["apiVersion"] });
}

async function sendReceipt(booking: OriveBooking) {
  if (booking.receiptSent || !booking.customerEmail) return;
  const sessionAmount = booking.priceCents / 100;
  const feeAmount = (booking.feeCents ?? CONCIERGE_FEE_CENTS) / 100;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://orive.co";
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
    bookingPassUrl: `${origin}/booking/${booking.id}`,
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
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://orive.co";
  const when = new Date(reserved.startAt);
  const letter = renderReservationEmail({
    sessionTitle: reserved.sessionTitle,
    clientName: reserved.customerName || "Gast",
    whenLabel: Number.isNaN(when.getTime()) ? reserved.startAt : when.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }),
    sessionAmount: `${Math.round(reserved.priceCents / 100)} €`,
    bookingPassUrl: `${origin}/booking/${encodeURIComponent(reserved.id)}`,
  });
  if (reserved.customerEmail) {
    await sendEmail({ to: reserved.customerEmail, subject: letter.subject, html: letter.html });
  }
  return reserved;
}

export async function settleBooking(bookingId: string) {
  const booking = await getBooking(bookingId);
  if (!booking) return { ok: false, error: "not_found" };
  if (booking.paymentStatus === "paid" || booking.paymentStatus === "waived" || booking.status === "cancelled") {
    return { ok: true, skipped: true };
  }

  const stripe = stripeClient();
  const account = findStripeAccount(booking.facilitatorId, booking.facilitatorEmail);
  const canCharge = Boolean(stripe && booking.stripeCustomerId && booking.stripePaymentMethodId);

  if (!canCharge) {
    if (booking.paymentStatus === "simulated" || allowStripeSimulation()) {
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
      description: `${booking.sessionTitle} · ${booking.id}`,
      metadata: {
        bookingId: booking.id,
        type: "orive_settlement",
        facilitatorId: booking.facilitatorId || "",
      },
      ...(account
        ? {
            application_fee_amount: booking.feeCents ?? CONCIERGE_FEE_CENTS,
            transfer_data: { destination: account },
          }
        : {}),
    });

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
    console.error("[settle]", booking.id, error);
    await markBookingChargeFailed(booking.id);
    return { ok: false, error: "charge_failed" };
  }
}

export async function settleDueBookings() {
  const due = await listDueBookings();
  const results = [];
  for (const booking of due) {
    results.push({ id: booking.id, ...(await settleBooking(booking.id)) });
  }
  return results;
}
