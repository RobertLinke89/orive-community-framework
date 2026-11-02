import { NextResponse } from "next/server";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { payoutAccountFor, profileByEmail } from "@/lib/facilitatorPayout";
import { listBookings, listFacilitatorInventory } from "@/lib/oriveStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const profile = profileByEmail(actor.email);
  const inventory = await listFacilitatorInventory(actor.email);
  const bookings = (await listBookings()).filter((booking) => {
    if (booking.facilitatorEmail.trim().toLowerCase() !== actor.email) return false;
    return booking.status !== "pending";
  });

  const offers = inventory.flatMap((item) =>
    item.slots.map((slot) => {
      const guests = bookings.filter(
        (booking) =>
          booking.slotId === slot.id &&
          booking.spotHeld &&
          booking.status !== "cancelled" &&
          booking.paymentStatus !== "waived",
      );
      return {
        id: slot.id,
        offeringId: item.offering.id,
        title: item.offering.title,
        description: item.offering.description || "",
        type: item.offering.type,
        price: Math.round(slot.priceCents / 100),
        duration: item.offering.duration || 60,
        location: item.offering.location || "",
        is_online: item.offering.is_online,
        image_url: item.offering.image_url || "",
        capacity: guests.length + slot.spots,
        start_at: slot.startAt,
        tags: item.offering.tags || [],
        intakeQuestions: (item.offering.intakeQuestions || []).map((question) => question.prompt),
        facilitator_id: item.offering.facilitator_id,
        facilitator_name: item.offering.facilitator_name,
        status: "Active",
        bookingsCount: guests.length,
        seekers: guests.map((guest) => ({ name: guest.customerName || guest.customerEmail, avatar: "" })),
      };
    }),
  );

  const guests = bookings.map((booking) => ({
    id: booking.id,
    slotId: booking.slotId,
    sessionTitle: booking.sessionTitle,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    avatar: "",
    startAt: booking.startAt,
    location: booking.location,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    payoutStatus: booking.payoutStatus || "none",
    intake: booking.intake || [],
    euros: booking.priceCents / 100,
  }));

  // Flags are kept current by the account.updated webhook and GET /api/facilitator/connect.
  const payout = await payoutAccountFor({ userId: actor.userId, facilitatorId: actor.id }).catch(() => null);
  const payoutsEnabled = Boolean(payout?.payouts_enabled);

  return NextResponse.json({
    actor: { id: actor.id, email: actor.email, name: profile?.name || actor.name },
    profile: {
      city: profile?.city || "",
      practice: profile?.practice || "",
      onboardingComplete: Boolean(profile?.onboardingComplete) || offers.length > 0,
      payoutsEnabled,
      stripeConnected: Boolean(payout?.stripe_account_id),
      chargesEnabled: Boolean(payout?.charges_enabled),
    },
    offers,
    guests,
  });
}
