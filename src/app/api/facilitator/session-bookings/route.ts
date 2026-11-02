import { NextResponse } from "next/server";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { supabaseForRequest } from "@/lib/sessionBookingServer";
import { GENERIC_ERROR, logError } from "@/lib/safeLog";

export const dynamic = "force-dynamic";

/** GET /api/facilitator/session-bookings?status=pending — the signed-in facilitator's session bookings. */
export async function GET(req: Request) {
  const actor = await facilitatorFromRequest(req);
  const client = supabaseForRequest(req);
  if (!actor || !client) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const status = new URL(req.url).searchParams.get("status");
  let query = client
    .from("session_bookings")
    .select("*, offerings(title)")
    .eq("facilitator_id", actor.userId)
    .order("start_at", { ascending: true })
    .limit(200);
  if (status && ["pending", "confirmed", "declined", "cancelled", "expired"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    logError("facilitator.session-bookings", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  const bookings = (data || []).map((row) => ({
    id: row.id,
    offeringId: row.offering_id,
    offeringTitle: row.offerings?.title ?? null,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    notes: row.notes,
    startAt: row.start_at,
    endAt: row.end_at,
    status: row.status,
    paymentStatus: (row as { payment_status?: string }).payment_status ?? null,
    priceAmount: Number(row.price_amount),
    platformFeeAmount: Number(row.platform_fee_amount),
    currency: row.currency,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ bookings });
}
