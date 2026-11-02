import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetPaymentPageRequest {
  bookingId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: GetPaymentPageRequest = await req.json();
    const bookingId = (body?.bookingId || "").trim();
    if (!bookingId) {
      return new Response(JSON.stringify({ error: "bookingId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_date, booking_time, duration, status, offering_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Minimal offering info (public-safe)
    let offeringTitle: string | null = null;
    let offeringType: string | null = null;
    let offeringPrice: string | null = null;
    if (booking.offering_id) {
      const { data: offering } = await supabase
        .from("offerings")
        .select("title, type, price")
        .eq("id", booking.offering_id)
        .maybeSingle();
      offeringTitle = offering?.title ?? null;
      offeringType = offering?.type ?? null;
      offeringPrice = offering?.price ?? null;
    }

    const { data: payment } = await supabase
      .from("booking_payments")
      .select("status")
      .eq("booking_id", bookingId)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        booking: {
          id: booking.id,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          duration: booking.duration,
          status: booking.status,
          payment_status: payment?.status ?? "unpaid",
          offering: {
            title: offeringTitle,
            type: offeringType,
            price: offeringPrice,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("get-payment-page unexpected error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
