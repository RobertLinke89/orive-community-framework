import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from 'https://esm.sh/react@18.3.1';
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22';
import { BookingStatusUpdateEmail } from './_templates/booking-status-update.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingUpdateRequest {
  clientEmail: string;
  customerName: string;
  sessionTitle: string;
  sessionType: 'session' | 'experience';
  facilitatorName: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  bookingDate: string;
  bookingTime: string;
  bookingDateRaw: string;
  duration: number;
  oldDate?: string;
  oldTime?: string;
  message?: string;
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
      clientEmail,
      customerName,
      sessionTitle,
      sessionType,
      facilitatorName,
      status,
      bookingDate,
      bookingTime,
      bookingDateRaw,
      duration,
      oldDate,
      oldTime,
      message,
    }: BookingUpdateRequest = await req.json();

    console.log(`Sending booking ${status} notification to:`, clientEmail);

    // Generate calendar link for confirmed/rescheduled bookings
    let calendarLink: string | undefined;
    if (status !== 'cancelled') {
      calendarLink = generateCalendarLink(
        supabaseUrl,
        sessionTitle,
        bookingDateRaw,
        bookingTime,
        duration,
        facilitatorName
      );
    }

    const html = await renderAsync(
      React.createElement(BookingStatusUpdateEmail, {
        customerName,
        sessionTitle,
        sessionType,
        facilitatorName,
        status,
        bookingDate,
        bookingTime,
        duration,
        oldDate,
        oldTime,
        calendarLink,
        message,
      })
    );

    const subjectMap = {
      confirmed: `✅ Your booking for ${sessionTitle} is confirmed!`,
      rescheduled: `📅 Your booking for ${sessionTitle} has been rescheduled`,
      cancelled: `❌ Your booking for ${sessionTitle} has been cancelled`,
    };

    const emailResponse = await resend.emails.send({
      from: "ORIVE <onboarding@resend.dev>",
      to: [clientEmail],
      subject: subjectMap[status],
      html,
    });

    console.log("Booking update notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking update notification:", error);
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