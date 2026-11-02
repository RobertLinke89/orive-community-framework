import { NextResponse } from "next/server";
import { tokenFromRequest, verifyBookingToken } from "@/lib/bookingToken";
import { getRepos } from "@/lib/paymentRepo";
import { publicView } from "@/lib/sessionPayments";

export const dynamic = "force-dynamic";

/** GET /api/session-bookings/:id?t=<token> — booking pass. Requires the signed token from the e-mail/redirect. */
export async function GET(req: Request, { params }: { params: { bookingId: string } }) {
  if (!verifyBookingToken(tokenFromRequest(req), params.bookingId)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const booking = await getRepos().sessions.get(params.bookingId);
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ booking: publicView(booking, true) }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
