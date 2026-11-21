import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { sendEmail, renderPaymentReceiptEmail } from '@/lib/email';
import { notifyFacilitatorOfIntake } from '@/lib/intakeMail';
import { allowStripeSimulation, isProductionRuntime, isStripeKeyUsable, CONCIERGE_FEE_CENTS } from '@/lib/payments';
import { getBooking, listBookings, markBookingChargeFailed, markBookingCharged, markBookingPaid, markBookingRefunded, markIntakeSent } from '@/lib/oriveStore';
import { confirmSetupSession } from '@/lib/settlement';
import { findStripeAccount } from '@/lib/facilitatorPayout';
import { grantChatCredits, resolveChatCreditPlan } from '@/lib/chatCredits';

export const dynamic = 'force-dynamic';

const OUTREACH_LOG_FILE = path.resolve(process.cwd(), 'src/data/outreachLog.json');

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    let event: Stripe.Event;

    if (webhookSecret && isStripeKeyUsable(stripeSecretKey) && signature) {
      const stripe = new Stripe(stripeSecretKey as string, {
        apiVersion: '2024-06-20' as any,
      });

      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook Signature Verification Failed]:', err.message);
        return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
      }
    } else if (isProductionRuntime() || !allowStripeSimulation()) {
      return NextResponse.json({ error: 'Webhook signature required.' }, { status: 400 });
    } else {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    console.log(`[Stripe Webhook] Received event type: ${event.type}`);

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'setup' && session.id) {
        await confirmSetupSession(session.id);
        return NextResponse.json({ received: true });
      }
      if (session.metadata?.type === 'orive_chat_credits') {
        const plan = resolveChatCreditPlan(session.metadata.plan);
        const visitorKey = session.metadata.visitorKey;
        if (plan && visitorKey) {
          const customerId =
            typeof session.customer === 'string' ? session.customer : session.customer?.id;
          grantChatCredits({
            visitorKey,
            plan,
            stripeSessionId: session.id,
            stripeCustomerId: customerId,
          });
        }
        return NextResponse.json({ received: true });
      }
      const bookingId = session.metadata?.bookingId;
      const customerEmail = session.customer_details?.email || session.customer_email || session.metadata?.customerEmail;
      const customerName = session.customer_details?.name || session.metadata?.customerName || 'Kunde';
      const sessionTitle = session.metadata?.sessionTitle || 'ORIVE Wellbeing Session';
      const amountTotal = (session.amount_total || 9500) / 100;

      if (bookingId) {
        console.log(`[Stripe Webhook] Updating booking ${bookingId} to paid/confirmed.`);
        const paidBooking = await markBookingPaid(bookingId, session.id);
        if (paidBooking && !paidBooking.intakeSent) {
          try {
            await notifyFacilitatorOfIntake(paidBooking);
            await markIntakeSent(paidBooking.id);
          } catch (err) {
            console.warn('[Stripe Webhook] Facilitator intake mail failed:', err);
          }
        }

        try {
          if (fs.existsSync(OUTREACH_LOG_FILE)) {
            const content = fs.readFileSync(OUTREACH_LOG_FILE, 'utf-8');
            let logs = JSON.parse(content || '[]');
            logs = logs.map((entry: any) => {
              if (entry.inquiryId === bookingId || entry.bookingReference === bookingId || entry.bookingId === bookingId) {
                return {
                  ...entry,
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  stripeSessionId: session.id,
                  amountPaid: `${amountTotal} €`,
                  paidAt: new Date().toISOString(),
                };
              }
              return entry;
            });
            fs.writeFileSync(OUTREACH_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
          }
        } catch (err) {
          console.warn('[Stripe Webhook] Could not update outreach log:', err);
        }

        // Send official payment receipt email
        if (customerEmail) {
          const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://orive.co';
          const bookingPassUrl = `${origin}/booking/${bookingId}`;

          const stored = await getBooking(bookingId);
          const sessionAmount = stored ? stored.priceCents / 100 : Math.max(amountTotal - CONCIERGE_FEE_CENTS / 100, 0);
          const feeAmount = stored ? (stored.feeCents ?? CONCIERGE_FEE_CENTS) / 100 : CONCIERGE_FEE_CENTS / 100;
          const receiptTemplate = renderPaymentReceiptEmail({
            receiptNumber,
            bookingReference: bookingId,
            sessionTitle,
            clientName: customerName,
            clientEmail: customerEmail,
            amount: sessionAmount + feeAmount,
            sessionAmount,
            feeAmount,
            currency: 'EUR',
            date: new Date().toLocaleDateString('de-DE'),
            bookingPassUrl,
          });

          await sendEmail({
            to: customerEmail,
            subject: receiptTemplate.subject,
            html: receiptTemplate.html,
            from: 'ORIVE Abrechnung <onboarding@resend.dev>',
          });
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId && intent.metadata?.type === 'orive_settlement') {
        const booking = await getBooking(bookingId);
        const account = booking ? findStripeAccount(booking.facilitatorId, booking.facilitatorEmail) : null;
        await markBookingCharged(bookingId, {
          stripePaymentIntentId: intent.id,
          payoutStatus: account ? 'transferred' : 'awaiting_connect',
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) await markBookingChargeFailed(bookingId);
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : '';
      const bookingId = charge.metadata?.bookingId || (await listBookings()).find((item) => item.stripePaymentIntentId === intentId)?.id;
      if (bookingId) await markBookingRefunded(bookingId);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
