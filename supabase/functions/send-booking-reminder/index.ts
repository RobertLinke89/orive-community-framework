import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.12";
import { BookingReminderEmail } from "./_templates/booking-reminder.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateCalendarLink(
  title: string,
  date: string,
  time: string,
  duration: number,
  facilitatorName: string
): string {
  const [hours, minutes] = time.split(':').map(Number);
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${title} with ${facilitatorName}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: `Your wellness session with ${facilitatorName} via ORIVE.`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatReminderSMS(
  customerName: string,
  sessionTitle: string,
  facilitatorName: string,
  bookingDate: string,
  bookingTime: string
): string {
  return `Hi ${customerName}! ⏰\n\nReminder: Your session "${sessionTitle}" with ${facilitatorName} is tomorrow!\n\n📅 ${bookingDate}\n🕐 ${bookingTime}\n\nSee you there!\n\n- ORIVE`;
}

async function sendReminderSMS(
  supabaseUrl: string,
  supabaseAnonKey: string,
  to: string,
  customerName: string,
  sessionTitle: string,
  facilitatorName: string,
  bookingDate: string,
  bookingTime: string
): Promise<void> {
  try {
    const message = formatReminderSMS(customerName, sessionTitle, facilitatorName, bookingDate, bookingTime);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ to, message }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send reminder SMS:', error);
    } else {
      console.log('Reminder SMS sent successfully to:', to);
    }
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date range for 24-hour reminders
    // We check for bookings that are between 23 and 25 hours from now
    const now = new Date();
    const minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    console.log(`Checking for bookings between ${minTime.toISOString()} and ${maxTime.toISOString()}`);

    // Query for confirmed bookings that need reminders
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        duration,
        client_name,
        client_email,
        client_phone,
        facilitator_id,
        offering_id,
        reminder_sent
      `)
      .eq('status', 'confirmed')
      .eq('reminder_sent', false);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bookings' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for reminders');
      return new Response(
        JSON.stringify({ message: 'No bookings need reminders', count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter bookings that are within the reminder window
    const bookingsToRemind = bookings.filter(booking => {
      const [hours, minutes] = booking.booking_time.split(':').map(Number);
      const bookingDateTime = new Date(booking.booking_date);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      return bookingDateTime >= minTime && bookingDateTime <= maxTime;
    });

    console.log(`Found ${bookingsToRemind.length} bookings to send reminders for`);

    let remindersSent = 0;
    const errors: string[] = [];

    for (const booking of bookingsToRemind) {
      try {
        // Fetch facilitator details
        let facilitatorName = 'Your Facilitator';
        const { data: facilitator } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', booking.facilitator_id)
          .single();

        if (facilitator) {
          facilitatorName = facilitator.full_name;
        }

        // Fetch offering details
        let sessionTitle = 'Session';
        let sessionType: 'session' | 'experience' = 'session';
        
        if (booking.offering_id) {
          const { data: offering } = await supabase
            .from('offerings')
            .select('title, type')
            .eq('id', booking.offering_id)
            .single();

          if (offering) {
            sessionTitle = offering.title;
            sessionType = offering.type === 'experience' ? 'experience' : 'session';
          }
        }

        // Format date
        const dateObj = new Date(booking.booking_date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Generate calendar link
        const calendarLink = generateCalendarLink(
          sessionTitle,
          booking.booking_date,
          booking.booking_time,
          booking.duration,
          facilitatorName
        );

        // Send email reminder
        const emailHtml = await render(
          BookingReminderEmail({
            customerName: booking.client_name,
            sessionTitle,
            sessionType,
            bookingDate: formattedDate,
            bookingTime: booking.booking_time,
            duration: booking.duration,
            facilitatorName,
            calendarLink,
          })
        );

        const emailResponse = await resend.emails.send({
          from: "ORIVE <onboarding@resend.dev>",
          to: [booking.client_email],
          subject: `⏰ Reminder: Your session "${sessionTitle}" is tomorrow!`,
          html: emailHtml,
        });

        console.log(`Email reminder sent to ${booking.client_email}:`, emailResponse);

        // Send SMS reminder if phone is available
        if (booking.client_phone) {
          await sendReminderSMS(
            supabaseUrl,
            supabaseAnonKey,
            booking.client_phone,
            booking.client_name,
            sessionTitle,
            facilitatorName,
            formattedDate,
            booking.booking_time
          );
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Failed to mark reminder sent for booking ${booking.id}:`, updateError);
          errors.push(`Failed to update booking ${booking.id}`);
        } else {
          remindersSent++;
        }
      } catch (error: unknown) {
        console.error(`Error processing booking ${booking.id}:`, error);
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing booking ${booking.id}: ${message}`);
      }
    }

    console.log(`Reminder process complete. Sent: ${remindersSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'Reminder process complete',
        remindersSent,
        totalChecked: bookingsToRemind.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});