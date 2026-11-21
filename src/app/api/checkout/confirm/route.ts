import { NextResponse } from "next/server";
import { getBooking } from "@/lib/oriveStore";
import { confirmSetupSession } from "@/lib/settlement";
import { isStripeKeyUsable } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "");
    const bookingId = String(body.bookingId || "");
    if (!sessionId || !bookingId) {
      return NextResponse.json({ error: "Missing session." }, { status: 400 });
    }
    if (!(await getBooking(bookingId))) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (!isStripeKeyUsable(process.env.STRIPE_SECRET_KEY)) {
      return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
    }
    const reserved = await confirmSetupSession(sessionId);
    if (!reserved || reserved.id !== bookingId) {
      return NextResponse.json({ error: "Card was not saved." }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: reserved.status });
  } catch (error: any) {
    console.error("[checkout confirm]", error);
    return NextResponse.json({ error: error?.message || "Could not confirm the card." }, { status: 500 });
  }
}
