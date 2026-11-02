import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type PaymentStatus = "unpaid" | "paid" | "refunded";

interface SendPaymentLinkRequest {
  bookingId: string;
  baseUrl: string;
}

function normalizeBaseUrl(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) throw new Error("baseUrl required");
  const u = new URL(trimmed);
  return u.origin;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SendPaymentLinkRequest = await req.json();
    if (!body?.bookingId) {
      return new Response(JSON.stringify({ error: "bookingId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = normalizeBaseUrl(body.baseUrl);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, facilitator_id, client_name, client_email")
      .eq("id", body.bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.facilitator_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: payment, error: paymentError } = await supabase
      .from("booking_payments")
      .select("status")
      .eq("booking_id", body.bookingId)
      .maybeSingle();

    if (paymentError) {
      console.error("Error loading payment:", paymentError);
      return new Response(JSON.stringify({ error: "Failed to load payment status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentStatus = (payment?.status || "unpaid") as PaymentStatus;
    if (paymentStatus !== "unpaid") {
      return new Response(
        JSON.stringify({ error: "Payment link can only be sent for unpaid bookings" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const [{ data: clientName }, { data: clientEmail }] = await Promise.all([
      supabase.rpc("decrypt_pii", { encrypted_text: booking.client_name }),
      supabase.rpc("decrypt_pii", { encrypted_text: booking.client_email }),
    ]);

    if (!clientEmail) {
      return new Response(JSON.stringify({ error: "Client email unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentUrl = `${origin}/pay/${encodeURIComponent(body.bookingId)}`;

    const resend = new Resend(resendApiKey);
    const safeName = clientName || "there";

    const { error: sendError } = await resend.emails.send({
      from: "Orive <onboarding@resend.dev>",
      to: [clientEmail],
      subject: "Complete your payment",
      html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Hi ${safeName},</h2>
          <p style="margin: 0 0 16px;">Your booking is confirmed as <strong>unpaid</strong>. Use the link below to complete payment.</p>
          <p style="margin: 0 0 20px;">
            <a href="${paymentUrl}" style="display:inline-block; padding: 12px 16px; text-decoration:none; border-radius: 999px; background:#00CDAC; color:#062a2f; font-weight:600;">Pay now</a>
          </p>
          <p style="margin: 0; color:#6b7280; font-size: 12px;">If the button doesn’t work, copy and paste this URL:</p>
          <p style="margin: 8px 0 0; font-size: 12px;"><a href="${paymentUrl}">${paymentUrl}</a></p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend send error:", sendError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-payment-link unexpected error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
