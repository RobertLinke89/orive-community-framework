import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.12";
import { SessionFollowupEmail } from "./_templates/session-followup.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function formatFollowupSMS(
  customerName: string,
  sessionTitle: string,
  facilitatorName: string
): string {
  return `Hi ${customerName}! 🙏\n\nHow are you feeling after your "${sessionTitle}" session with ${facilitatorName}?\n\nWe'd love your feedback! Need support? Our 24/7 WhatsApp integration is here for you.\n\n💬 Reply to this message or check your email.\n\n- ORIVE`;
}

async function sendFollowupSMS(
  supabaseUrl: string,
  supabaseAnonKey: string,
  to: string,
  customerName: string,
  sessionTitle: string,
  facilitatorName: string
): Promise<void> {
  try {
    const message = formatFollowupSMS(customerName, sessionTitle, facilitatorName);
    
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
      console.error('Failed to send follow-up SMS:', error);
    } else {
      console.log('Follow-up SMS sent successfully to:', to);
    }
  } catch (error) {
    console.error('Error sending follow-up SMS:', error);
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

    // Calculate the time range for 24-hour post-session follow-ups
    // We check for sessions that ended between 23 and 25 hours ago
    const now = new Date();
    const minTime = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago
    const maxTime = new Date(now.getTime() - 23 * 60 * 60 * 1000); // 23 hours ago

    console.log(`Checking for completed sessions between ${minTime.toISOString()} and ${maxTime.toISOString()}`);

    // Query for confirmed bookings that need follow-up
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
        followup_sent
      `)
      .eq('status', 'confirmed')
      .eq('followup_sent', false);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bookings' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for follow-up');
      return new Response(
        JSON.stringify({ message: 'No bookings need follow-up', count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter bookings where the session ended 23-25 hours ago
    const bookingsToFollowUp = bookings.filter(booking => {
      const [hours, minutes] = booking.booking_time.split(':').map(Number);
      const sessionStart = new Date(booking.booking_date);
      sessionStart.setHours(hours, minutes, 0, 0);
      
      // Calculate session end time
      const sessionEnd = new Date(sessionStart.getTime() + (booking.duration || 60) * 60 * 1000);
      
      return sessionEnd >= minTime && sessionEnd <= maxTime;
    });

    console.log(`Found ${bookingsToFollowUp.length} bookings to send follow-ups for`);

    let followupsSent = 0;
    const errors: string[] = [];

    for (const booking of bookingsToFollowUp) {
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

        // Generate feedback link (could be a dedicated feedback page)
        const feedbackLink = `https://orive.app/feedback?booking=${booking.id}`;

        // Send email follow-up
        const emailHtml = await render(
          SessionFollowupEmail({
            customerName: booking.client_name,
            sessionTitle,
            sessionType,
            facilitatorName,
            feedbackLink,
          })
        );

        const emailResponse = await resend.emails.send({
          from: "ORIVE <onboarding@resend.dev>",
          to: [booking.client_email],
          subject: `🙏 How was your session with ${facilitatorName}?`,
          html: emailHtml,
        });

        console.log(`Follow-up email sent to ${booking.client_email}:`, emailResponse);

        // Send SMS follow-up if phone is available
        if (booking.client_phone) {
          await sendFollowupSMS(
            supabaseUrl,
            supabaseAnonKey,
            booking.client_phone,
            booking.client_name,
            sessionTitle,
            facilitatorName
          );
        }

        // Mark follow-up as sent
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ followup_sent: true })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Failed to mark follow-up sent for booking ${booking.id}:`, updateError);
          errors.push(`Failed to update booking ${booking.id}`);
        } else {
          followupsSent++;
        }
      } catch (error: unknown) {
        console.error(`Error processing booking ${booking.id}:`, error);
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing booking ${booking.id}: ${message}`);
      }
    }

    console.log(`Follow-up process complete. Sent: ${followupsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'Follow-up process complete',
        followupsSent,
        totalChecked: bookingsToFollowUp.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-session-followup function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});