import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from 'https://esm.sh/react@18.3.1';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import { BookingConfirmationEmail } from './_templates/booking-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  to: string;
  customerName: string;
  sessionTitle: string;
  sessionType: 'session' | 'experience';
  bookingDate: string;
  bookingTime: string;
  bookingDateRaw: string; // YYYY-MM-DD format for calendar link
  duration: number;
  facilitatorName: string;
  status: 'pending' | 'confirmed';
}

function generateCalendarLink(
  supabaseUrl: string,
  title: string,
  date: string,
  time: string,
  duration: number,
  facilitatorName: string
): string {
  const params = new URLSearchParams({
    title,
    date,
    time,
    duration: duration.toString(),
    facilitator: facilitatorName,
  });
  
  return `${supabaseUrl}/functions/v1/generate-calendar-event?${params.toString()}`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    
    const {
      to,
      customerName,
      sessionTitle,
      sessionType,
      bookingDate,
      bookingTime,
      bookingDateRaw,
      duration,
      facilitatorName,
      status,
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation to:", to);

    // Generate calendar link
    const calendarLink = generateCalendarLink(
      supabaseUrl,
      sessionTitle,
      bookingDateRaw,
      bookingTime,
      duration,
      facilitatorName
    );

    console.log("Generated calendar link:", calendarLink);

    const html = await renderAsync(
      React.createElement(BookingConfirmationEmail, {
        customerName,
        sessionTitle,
        sessionType,
        bookingDate,
        bookingTime,
        duration,
        facilitatorName,
        status,
        calendarLink,
      })
    );

    const subject = status === 'confirmed'
      ? `Your booking for ${sessionTitle} is confirmed!`
      : `Booking request received for ${sessionTitle}`;

    const emailResponse = await resend.emails.send({
      from: "ORIVE <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
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