import { NextResponse } from "next/server";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { listBookings } from "@/lib/oriveStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const bookings = (await listBookings())
    .filter((booking) => booking.facilitatorEmail.trim().toLowerCase() === actor.email)
    .filter((booking) => booking.status !== "pending")
    .map((booking) => ({
      id: booking.id,
      slotId: booking.slotId,
      sessionTitle: booking.sessionTitle,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      startAt: booking.startAt,
      location: booking.location,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      payoutStatus: booking.payoutStatus || "none",
      priceCents: booking.priceCents,
      intake: booking.intake || [],
    }));
  return NextResponse.json({ bookings });
}
