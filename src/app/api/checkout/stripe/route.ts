import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createPendingBooking, deleteBooking, getInventoryItem, getStoredSlot, isStoredOriveOffering, questionsForOffering } from '@/lib/oriveStore';
import { renderReservationEmail, sendEmail } from '@/lib/email';
import { collectIntake } from '@/lib/intake';
import { notifyFacilitatorOfIntake } from '@/lib/intakeMail';
import { markIntakeSent, reserveBooking } from '@/lib/oriveStore';
import { CONCIERGE_FEE_CENTS, allowStripeSimulation, isStripeKeyUsable } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const origin = req.headers.get('origin') || 'https://orive.co';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (isStripeKeyUsable(stripeSecretKey)) {
      const stripe = new Stripe(stripeSecretKey as string, {
        apiVersion: '2024-06-20' as any,
      });

      const customer = await stripe.customers.create({
        email: customerEmail || undefined,
        name: customerName || undefined,
        metadata: { bookingId: booking.id },
      });

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
          offeringId: targetOfferingId,
          slotId: slot.id,
          bookingId: booking.id,
          type: 'orive_booking_setup',
        },
        success_url: `${origin}/booking/${encodeURIComponent(booking.id)}?reserved=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/${encodeURIComponent(targetOfferingId)}?payment=cancelled`,
      });

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
        bookingPassUrl: `${origin}/booking/${encodeURIComponent(reserved.id)}`,
      });
      if (reserved.customerEmail) {
        await sendEmail({ to: reserved.customerEmail, subject: letter.subject, html: letter.html });
      }
    }
    return NextResponse.json({
      success: true,
      mode: 'simulation',
      bookingId: booking.id,
      url: `${origin}/booking/${encodeURIComponent(booking.id)}?reserved=1`,
    });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Stripe checkout session' },
      { status: 500 }
    );
  }
}
