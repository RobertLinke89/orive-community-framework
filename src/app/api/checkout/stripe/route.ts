import { NextResponse } from 'next/server';
import { createPendingBooking, deleteBooking, getInventoryItem, getStoredSlot, isStoredOriveOffering, questionsForOffering } from '@/lib/oriveStore';
import { renderReservationEmail, sendEmail } from '@/lib/email';
import { collectIntake } from '@/lib/intake';
import { notifyFacilitatorOfIntake } from '@/lib/intakeMail';
import { markIntakeSent, reserveBooking } from '@/lib/oriveStore';
import { CONCIERGE_FEE_CENTS, allowStripeSimulation } from '@/lib/payments';
import { appOrigin, isSameOrigin } from '@/lib/appOrigin';
import { bookingPassUrl } from '@/lib/legacyBookingLinks';
import { clientKey } from '@/lib/rateLimit';
import { rateLimitShared } from '@/lib/rateLimitShared';
import { verifyTurnstile, clientIp, turnstileTokenFrom } from '@/lib/turnstile';
import { parseHealthConsent, buildConsentRecord, consentStore } from '@/lib/consent';
import { GENERIC_ERROR, logError } from '@/lib/safeLog';
import { getStripe } from '@/lib/stripeClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  if (!(await rateLimitShared(`legacy-checkout:${clientKey(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  try {
    const body = await req.json();
    const captcha = await verifyTurnstile(turnstileTokenFrom(req, body), { ip: clientIp(req), action: 'booking' });
    if (!captcha.ok) return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
    const {
      offeringId,
      slotId,
      sessionTitle,
      customerEmail,
      customerName,
    } = body;

    const targetOfferingId = String(offeringId || '');
    if (!targetOfferingId || !(await isStoredOriveOffering(targetOfferingId))) {
      return NextResponse.json(
        { error: 'This listing is not sold by ORIVE.' },
        { status: 403 }
      );
    }

    const item = await getInventoryItem(targetOfferingId);
    const slot = await getStoredSlot(targetOfferingId, String(slotId || ''));
    if (!item || !slot || slot.spots < 1) {
      return NextResponse.json({ error: 'No open date on ORIVE for this listing.' }, { status: 409 });
    }
    if (new Date(slot.startAt).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'That date has passed.' }, { status: 409 });
    }

    const questions = await questionsForOffering(item.offering, body.lang === 'de');
    const collected = collectIntake(questions, body.intake);
    if (!collected.ok) {
      return NextResponse.json({ error: "error" in collected ? collected.error : "Intake incomplete." }, { status: 400 });
    }

    const consent = parseHealthConsent(body.healthConsent);
    if (collected.intake.length > 0 && !consent) {
      return NextResponse.json({ error: 'Explicit consent for health-related intake answers is required.' }, { status: 400 });
    }

    const booking = await createPendingBooking({
      offeringId: targetOfferingId,
      slotId: slot.id,
      sessionTitle: sessionTitle || item.offering.title,
      facilitatorId: item.offering.facilitator_id,
      facilitatorName: item.offering.facilitator_name,
      facilitatorEmail: item.offering.facilitator_email,
      durationMin: item.offering.duration,
      feeCents: CONCIERGE_FEE_CENTS,
      customerName: customerName || '',
      customerEmail: customerEmail || '',
      startAt: slot.startAt,
      priceCents: slot.priceCents,
      currency: slot.currency,
      location: item.offering.location,
      intake: collected.intake,
    });

    if (consent && collected.intake.length > 0) {
      try { await consentStore()?.insert(buildConsentRecord(String(booking.id), consent, req, 'legacy')); }
      catch (e) { logError('consent.record', e); }
    }

    const origin = appOrigin();
    const stripe = getStripe();

    if (stripe) {
      const customer = await stripe.customers.create({
        email: customerEmail || undefined,
        name: customerName || undefined,
        metadata: { bookingId: booking.id },
      }, { idempotencyKey: `customer-${booking.id}` });

      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        customer: customer.id,
        payment_method_types: ['card'],
        setup_intent_data: {
          metadata: {
            bookingId: booking.id,
            type: 'orive_booking_setup',
          },
        },
        metadata: {
          bookingId: booking.id,
          type: 'orive_booking_setup',
        },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: bookingPassUrl(booking.id, '&reserved=1&session_id={CHECKOUT_SESSION_ID}'),
        cancel_url: `${origin}/checkout/${encodeURIComponent(targetOfferingId)}?payment=cancelled`,
      }, { idempotencyKey: `setup-${booking.id}` });

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        bookingId: booking.id,
      });
    }

    if (!allowStripeSimulation()) {
      await deleteBooking(booking.id);
      return NextResponse.json(
        { error: 'Payments are not configured. Card details are never accepted on ORIVE.' },
        { status: 503 }
      );
    }

    const reserved = await reserveBooking(booking.id, { simulated: true });
    if (!reserved) {
      await deleteBooking(booking.id);
      return NextResponse.json({ error: 'That date just filled.' }, { status: 409 });
    }
    if (!reserved.intakeSent) {
      await notifyFacilitatorOfIntake(reserved);
      await markIntakeSent(reserved.id);
      const when = new Date(reserved.startAt);
      const letter = renderReservationEmail({
        sessionTitle: reserved.sessionTitle,
        clientName: reserved.customerName || 'Gast',
        whenLabel: Number.isNaN(when.getTime()) ? reserved.startAt : when.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }),
        sessionAmount: `${Math.round(reserved.priceCents / 100)} €`,
        bookingPassUrl: bookingPassUrl(reserved.id),
      });
      if (reserved.customerEmail) {
        await sendEmail({ to: reserved.customerEmail, subject: letter.subject, html: letter.html });
      }
    }
    return NextResponse.json({
      success: true,
      mode: 'simulation',
      bookingId: booking.id,
      url: bookingPassUrl(booking.id, '&reserved=1'),
    });
  } catch (error: any) {
    logError('checkout.stripe', error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
