import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from 'https://esm.sh/react@18.3.1';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import { FacilitatorNotificationEmail } from './_templates/facilitator-notification.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FacilitatorNotificationRequest {
  facilitatorEmail: string;
  facilitatorName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  sessionTitle: string;
  sessionType: 'session' | 'experience';
  bookingDate: string;
  bookingTime: string;
  duration: number;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      facilitatorEmail,
      facilitatorName,
      clientName,
      clientEmail,
      clientPhone,
      sessionTitle,
      sessionType,
      bookingDate,
      bookingTime,
      duration,
      notes,
    }: FacilitatorNotificationRequest = await req.json();

    console.log("Sending facilitator notification to:", facilitatorEmail);

    // Dashboard link to the calendar/bookings page
    const dashboardLink = "https://orive.app/app/calendar";

    const html = await renderAsync(
      React.createElement(FacilitatorNotificationEmail, {
        facilitatorName,
        clientName,
        clientEmail,
        clientPhone,
        sessionTitle,
        sessionType,
        bookingDate,
        bookingTime,
        duration,
        notes,
        dashboardLink,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "ORIVE <onboarding@resend.dev>",
      to: [facilitatorEmail],
      subject: `🔔 New booking request from ${clientName}`,
      html,
    });

    console.log("Facilitator notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending facilitator notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);