import { NextResponse } from "next/server";
import { tokenFromRequest, verifyBookingToken } from "@/lib/bookingToken";
import { getBooking } from "@/lib/oriveStore";
import { confirmSetupSession } from "@/lib/settlement";
import { GENERIC_ERROR, logError } from "@/lib/safeLog";
import { getStripe } from "@/lib/stripeClient";

export const dynamic = "force-dynamic";

/** Fallback when the webhook is late: the success page confirms its own setup session (token-bound). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.sessionId || "");
    const bookingId = String(body.bookingId || "");
    if (!sessionId || !bookingId) return NextResponse.json({ error: "Missing session." }, { status: 400 });
    if (!verifyBookingToken(tokenFromRequest(req) || String(body.token || ""), bookingId)) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (!(await getBooking(bookingId))) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (!getStripe()) return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
    const reserved = await confirmSetupSession(sessionId);
    if (!reserved || reserved.id !== bookingId) {
      return NextResponse.json({ error: "Card was not saved." }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: reserved.status });
  } catch (error) {
    logError("checkout.confirm", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
