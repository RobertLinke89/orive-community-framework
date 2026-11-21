import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/oriveStore';
import { CONCIERGE_FEE_CENTS, cancelDeadline } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { bookingId: string } }
) {
  const rawId = params.bookingId;
  if (!rawId) {
    return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
  }

  const booking = await getBooking(rawId);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  const start = new Date(booking.startAt);
  const feeCents = booking.feeCents ?? CONCIERGE_FEE_CENTS;
  const deadline = cancelDeadline(booking.startAt);
  const cardSaved = booking.paymentStatus === 'card_saved' || booking.paymentStatus === 'simulated';
  return NextResponse.json({
    success: true,
    booking: {
      id: booking.id,
      reference: booking.id,
      sessionTitle: booking.sessionTitle,
      sessionPrice: `${Math.round(booking.priceCents / 100)} €`,
      feePrice: `${(feeCents / 100).toFixed(2).replace('.', ',')} €`,
      totalPrice: `${((booking.priceCents + feeCents) / 100).toFixed(2).replace('.', ',')} €`,
      date: Number.isNaN(start.getTime()) ? booking.startAt : start.toISOString().slice(0, 10),
      time: Number.isNaN(start.getTime()) ? '' : start.toISOString().slice(11, 16),
      duration: booking.durationMin || 60,
      status: booking.status === 'paid' ? 'confirmed' : booking.status,
      paymentStatus: booking.paymentStatus === 'paid'
        ? 'paid'
        : cardSaved
          ? 'card_saved'
          : booking.paymentStatus === 'failed'
            ? 'failed'
            : booking.paymentStatus === 'refunded'
              ? 'refunded'
              : booking.paymentStatus === 'waived'
                ? 'waived'
                : 'pending',
      simulated: booking.paymentStatus === 'simulated',
      canCancel: cardSaved && Date.now() < deadline,
      cancellableUntil: deadline ? new Date(deadline).toISOString() : null,
      clientName: booking.customerName,
      clientEmail: booking.customerEmail,
      facilitatorName: booking.facilitatorName,
      facilitatorEmail: booking.facilitatorEmail,
      location: booking.location,
      createdAt: booking.createdAt,
    },
  });
}
