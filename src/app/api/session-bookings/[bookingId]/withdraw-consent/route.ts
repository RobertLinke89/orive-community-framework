import { NextResponse } from "next/server";
import { tokenFromRequest, verifyBookingToken } from "@/lib/bookingToken";
import { consentStore } from "@/lib/consent";
import { isSameOrigin } from "@/lib/appOrigin";

export const dynamic = "force-dynamic";
const H = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

/** POST /api/session-bookings/:id/withdraw-consent?t=<token> — Art. 7(3): withdraw, intake answers are deleted. */
export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: H });
  if (!verifyBookingToken(tokenFromRequest(req), params.bookingId)) return NextResponse.json({ error: "Booking not found." }, { status: 404, headers: H });
  const store = consentStore();
  if (!store) return NextResponse.json({ error: "Unavailable." }, { status: 503, headers: H });
  const withdrawn = await store.withdraw(params.bookingId).catch(() => null);
  if (withdrawn === null) return NextResponse.json({ error: "Unavailable." }, { status: 503, headers: H });
  return NextResponse.json({ ok: true, withdrawn }, { headers: H });
}
