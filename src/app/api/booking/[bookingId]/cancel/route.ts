import { NextResponse } from "next/server";
import { renderCancellationEmail, sendEmail } from "@/lib/email";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { cancelBooking, getBooking } from "@/lib/oriveStore";
import { settleBooking } from "@/lib/settlement";
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
  const booking = await getBooking(params.bookingId);
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const by = body.by === "facilitator" ? "facilitator" : "guest";

  if (by === "facilitator") {
    const actor = await facilitatorFromRequest(req);
    if (!actor || actor.email !== booking.facilitatorEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: "Sign in as the facilitator to cancel." }, { status: 403 });
    }
  } else {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || email !== booking.customerEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: "Email does not match this booking." }, { status: 403 });
    }
  }

  const result = await cancelBooking(booking.id, by);
  if (result.error === "late") {
    const charged = await settleBooking(booking.id);
    if (charged.ok) await notify(booking, true, by);
    return NextResponse.json({
      success: charged.ok,
      charged: true,
      message: "The cancellation window has passed. The card is charged for the session.",
    });
  }
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  if (result.booking) await notify(result.booking, false, by);
  return NextResponse.json({ success: true, charged: false });
}
