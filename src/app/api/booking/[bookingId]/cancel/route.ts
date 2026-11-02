import { NextResponse } from "next/server";
import { renderCancellationEmail, sendEmail } from "@/lib/email";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { cancelBooking, getBooking } from "@/lib/oriveStore";
import { refundBooking } from "@/lib/settlement";
import { tokenFromRequest, verifyBookingToken } from "@/lib/bookingToken";
import { isSameOrigin } from "@/lib/appOrigin";
import type { OriveBooking } from "@/lib/orivePublic";

export const dynamic = "force-dynamic";

function canMail(email?: string | null) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (/@partner\.orive\.co$/i.test(value)) return false;
  return true;
}

async function notify(booking: OriveBooking, late: boolean, by: "guest" | "facilitator") {
  const when = new Date(booking.startAt);
  const whenLabel = Number.isNaN(when.getTime())
    ? booking.startAt
    : when.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  const guestLetter = renderCancellationEmail({
    to: "guest",
    late,
    sessionTitle: booking.sessionTitle,
    who: booking.customerName || "Gast",
    whenLabel,
  });
  const hostLetter = renderCancellationEmail({
    to: "facilitator",
    late,
    sessionTitle: booking.sessionTitle,
    who: booking.customerName || booking.customerEmail,
    whenLabel,
  });
  if (canMail(booking.customerEmail) && (late || by === "facilitator")) {
    await sendEmail({ to: booking.customerEmail, subject: guestLetter.subject, html: guestLetter.html });
  }
  if (canMail(booking.facilitatorEmail) && (late || by === "guest")) {
    await sendEmail({ to: booking.facilitatorEmail, subject: hostLetter.subject, html: hostLetter.html });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const booking = await getBooking(params.bookingId);
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const by = body.by === "facilitator" ? "facilitator" : "guest";

  if (by === "facilitator") {
    const actor = await facilitatorFromRequest(req);
    if (!actor || actor.email !== booking.facilitatorEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: "Sign in as the facilitator to cancel." }, { status: 403 });
    }
  } else if (!verifyBookingToken(tokenFromRequest(req), booking.id)) {
    // S9: e-mail address alone is not proof; the signed booking token from the e-mail is required.
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const result = await cancelBooking(booking.id, by);
  if (result.error === "late") {
    // No immediate charge any more: the booking stays reserved and is settled after the
    // session by the cron (same as attending). The guest is told so.
    await notify(booking, true, by);
    return NextResponse.json({
      success: false,
      charged: false,
      willBeCharged: true,
      message: "The free cancellation window has passed. The session fee will be charged after the session date.",
    }, { status: 409 });
  }
  if (result.error === "already_charged" && by === "facilitator") {
    const refund = await refundBooking(booking.id);
    if (!refund.ok) return NextResponse.json({ error: "Refund failed." }, { status: 502 });
    await notify(booking, false, by);
    return NextResponse.json({ success: true, refunded: true });
  }
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  if (result.booking) await notify(result.booking, false, by);
  return NextResponse.json({ success: true, charged: false });
}
