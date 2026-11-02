import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/appOrigin";
import { tokenFromRequest, verifyBookingToken } from "@/lib/bookingToken";
import { guestCancel } from "@/lib/sessionPayments";

export const dynamic = "force-dynamic";

/** POST /api/session-bookings/:id/cancel (header x-booking-token) — free cancel until 24h before start. */
export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!verifyBookingToken(tokenFromRequest(req), params.bookingId)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const result = await guestCancel(params.bookingId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, charged: false });
}
