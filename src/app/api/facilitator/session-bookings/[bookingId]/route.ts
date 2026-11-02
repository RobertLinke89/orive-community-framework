import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/appOrigin";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { notifySessionBookingStatusChange, type SessionBookingStatus } from "@/lib/sessionBooking";
import { facilitatorDecision } from "@/lib/sessionPayments";

export const dynamic = "force-dynamic";

const ACTIONS = ["confirm", "decline", "cancel"] as const;

/**
 * PATCH /api/facilitator/session-bookings/:bookingId  body: { action: "confirm" | "decline" | "cancel" }
 * confirm requires a saved card and Stripe Connect charges_enabled; cancel after payment refunds
 * with reverse_transfer + refund_application_fee. Ownership is checked against the JWT user id.
 */
export async function PATCH(req: Request, { params }: { params: { bookingId: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const action = ACTIONS.find((item) => item === body.action);
  if (!action) return NextResponse.json({ error: "action must be confirm, decline or cancel." }, { status: 400 });

  const result = await facilitatorDecision(actor.userId, params.bookingId, action);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  await notifySessionBookingStatusChange({
    id: result.booking.id,
    status: result.booking.status as SessionBookingStatus,
    customer_email: "",
    start_at: result.booking.startAt,
  });
  return NextResponse.json({ booking: result.booking, refunded: Boolean(result.refunded) });
}
