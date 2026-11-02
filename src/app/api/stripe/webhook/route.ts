import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { sendEmail, renderPaymentReceiptEmail } from '@/lib/email';
import { notifyFacilitatorOfIntake } from '@/lib/intakeMail';
import { allowStripeSimulation, CONCIERGE_FEE_CENTS } from '@/lib/payments';
import { getBooking, listBookings, markBookingChargeFailed, markBookingCharged, markBookingPaid, markBookingRefunded, markIntakeSent, markReceiptSent } from '@/lib/oriveStore';
import { confirmSetupSession } from '@/lib/settlement';
import { findStripeAccount } from '@/lib/facilitatorPayout';
import { grantChatCredits, resolveChatCreditPlan } from '@/lib/chatCredits';
import { bookingPassUrl } from '@/lib/legacyBookingLinks';
import { getRepos } from '@/lib/paymentRepo';
import { logError } from '@/lib/safeLog';
import {
  SETUP_TYPE,
  onAccountUpdated,
  onChargeRefunded,
  onCheckoutExpired,
  onPaymentIntent,
  onSetupCompleted,
} from '@/lib/sessionPayments';
import { stripeForWebhooks } from '@/lib/stripeClient';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook.
 *  - S6: signature is mandatory; unsigned JSON only in local `next dev` with ALLOW_STRIPE_SIMULATION (never on Vercel).
 *  - S5: every event id is claimed in public.stripe_events first; duplicates return 200 without side effects;
 *        on failure the claim is released so Stripe's retry is processed.
 *  - S13: no internal error messages in responses.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  if (webhookSecret && signature) {
    try {
      event = stripeForWebhooks().webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
  } else if (allowStripeSimulation() && !webhookSecret) {
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'Webhook signature required.' }, { status: 400 });
  }

  const { events } = getRepos();
  let fresh: boolean;
  try {
    fresh = await events.claim(event.id, event.type);
  } catch (error) {
    logError('webhook.claim', error, { eventId: event.id });
    return NextResponse.json({ error: 'Temporarily unavailable.' }, { status: 503 });
  }
  if (!fresh) return NextResponse.json({ received: true, duplicate: true });

  try {
    const outcome = await dispatch(event);
    await events.markProcessed(event.id);
    return NextResponse.json({ received: true, outcome });
  } catch (error) {
    logError('webhook.process', error, { eventId: event.id, type: event.type });
    await events.release(event.id).catch(() => undefined);
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 });
  }
}

async function dispatch(event: Stripe.Event): Promise<string> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === SETUP_TYPE) return onSetupCompleted(session);
      if (session.mode === 'setup' && session.id) {
        await confirmSetupSession(session.id);
        return 'legacy_setup';
      }
      if (session.metadata?.type === 'orive_chat_credits') return chatCredits(session);
      if (session.metadata?.bookingId) return legacyPaymentCompleted(session);
      return 'ignored';
    }
    case 'checkout.session.expired':
      return onCheckoutExpired(event.data.object as Stripe.Checkout.Session);
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.type === 'orive_settlement' && intent.metadata.bookingId) {
        const booking = await getBooking(intent.metadata.bookingId);
        const account = booking ? await findStripeAccount(booking.facilitatorId, booking.facilitatorEmail) : null;
        await markBookingCharged(intent.metadata.bookingId, {
          stripePaymentIntentId: intent.id,
          payoutStatus: account ? 'transferred' : 'awaiting_connect',
        });
        return 'legacy_charged';
      }
      return onPaymentIntent(intent, true);
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.type === 'orive_settlement' && intent.metadata.bookingId) {
        await markBookingChargeFailed(intent.metadata.bookingId);
        return 'legacy_failed';
      }
      return onPaymentIntent(intent, false);
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const session = await onChargeRefunded(charge);
      if (session !== 'ignored') return session;
      const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      const bookingId = charge.metadata?.bookingId || (intentId ? (await listBookings()).find((item) => item.stripePaymentIntentId === intentId)?.id : undefined);
      if (bookingId && charge.refunded) {
        await markBookingRefunded(bookingId);
        return 'legacy_refunded';
      }
      return 'ignored';
    }
    case 'account.updated':
      return onAccountUpdated(event.data.object as Stripe.Account);
    default:
      return 'ignored';
  }
}

async function chatCredits(session: Stripe.Checkout.Session) {
  const plan = resolveChatCreditPlan(session.metadata?.plan);
  const visitorKey = session.metadata?.visitorKey;
  if (plan && visitorKey) {
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    grantChatCredits({ visitorKey, plan, stripeSessionId: session.id, stripeCustomerId: customerId });
  }
  return 'chat_credits';
}

/** Legacy pay-link flow (/pay/[bookingId]): mark paid, one intake mail, one receipt. No JSON log file (S10). */
async function legacyPaymentCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId as string;
  const before = await getBooking(bookingId);
  if (!before) return 'unknown_booking';
  const paidBooking = await markBookingPaid(bookingId, session.id);
  if (paidBooking && !paidBooking.intakeSent) {
    try {
      await notifyFacilitatorOfIntake(paidBooking);
      await markIntakeSent(paidBooking.id);
    } catch (error) {
      logError('webhook.intake', error, { bookingId });
    }
  }
  const customerEmail = session.customer_details?.email || session.customer_email || paidBooking?.customerEmail;
  if (customerEmail && paidBooking && !paidBooking.receiptSent) {
    const sessionAmount = paidBooking.priceCents / 100;
    const feeAmount = (paidBooking.feeCents ?? CONCIERGE_FEE_CENTS) / 100;
    const receipt = renderPaymentReceiptEmail({
      receiptNumber: `REC-${new Date().getFullYear()}-${paidBooking.id.slice(-6).toUpperCase()}`,
      bookingReference: bookingId,
      sessionTitle: paidBooking.sessionTitle,
      clientName: session.customer_details?.name || paidBooking.customerName || 'Kunde',
      clientEmail: customerEmail,
      amount: sessionAmount + feeAmount,
      sessionAmount,
      feeAmount,
      currency: 'EUR',
      date: new Date().toLocaleDateString('de-DE'),
      bookingPassUrl: bookingPassUrl(bookingId),
    });
    await sendEmail({ to: customerEmail, subject: receipt.subject, html: receipt.html });
    await markReceiptSent(paidBooking.id);
  }
  return 'legacy_paid';
}
