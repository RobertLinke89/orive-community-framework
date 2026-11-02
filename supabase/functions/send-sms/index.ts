import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
}

interface BookingSMSRequest {
  to: string;
  customerName: string;
  sessionTitle: string;
  facilitatorName: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';
  oldDate?: string;
  oldTime?: string;
}

function formatBookingSMS(data: BookingSMSRequest): string {
  const { customerName, sessionTitle, facilitatorName, bookingDate, bookingTime, status, oldDate, oldTime } = data;
  
  switch (status) {
    case 'pending':
      return `Hi ${customerName}! 🙏\n\nYour booking request for "${sessionTitle}" with ${facilitatorName} has been received.\n\n📅 ${bookingDate}\n🕐 ${bookingTime}\n\n${facilitatorName} will confirm shortly.\n\n- ORIVE`;
    
    case 'confirmed':
      return `Hi ${customerName}! ✅\n\nGreat news! Your session "${sessionTitle}" with ${facilitatorName} is confirmed.\n\n📅 ${bookingDate}\n🕐 ${bookingTime}\n\nSee you there!\n\n- ORIVE`;
    
    case 'rescheduled':
      return `Hi ${customerName}! 📅\n\nYour session "${sessionTitle}" has been rescheduled.\n\n❌ Old: ${oldDate} at ${oldTime}\n✅ New: ${bookingDate} at ${bookingTime}\n\n- ORIVE`;
    
    case 'cancelled':
      return `Hi ${customerName},\n\nUnfortunately, your session "${sessionTitle}" on ${bookingDate} at ${bookingTime} has been cancelled.\n\nPlease reach out to ${facilitatorName} for more details.\n\n- ORIVE`;
    
    default:
      return `Hi ${customerName}! Your booking for "${sessionTitle}" has been updated. Check your email for details.\n\n- ORIVE`;
  }
}

async function sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials not configured");
    return { success: false, error: "Twilio not configured" };
  }

  // Clean and validate phone number
  let cleanedNumber = to.replace(/[\s()-]/g, '');
  if (!cleanedNumber.startsWith('+')) {
    cleanedNumber = '+' + cleanedNumber;
  }

  // Basic E.164 validation
  if (!/^\+[1-9]\d{6,14}$/.test(cleanedNumber)) {
    console.error("Invalid phone number format:", to);
    return { success: false, error: "Invalid phone number format" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    To: cleanedNumber,
    From: fromNumber,
    Body: message,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio API error:", result);
      return { success: false, error: result.message || "Failed to send SMS" };
    }

    console.log("SMS sent successfully, SID:", result.sid);
    return { success: true, sid: result.sid };
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    let message: string;
    let to: string;

    // Check if it's a booking notification or raw SMS
    if ('status' in requestData && 'customerName' in requestData) {
      // Booking SMS
      const bookingData = requestData as BookingSMSRequest;
      to = bookingData.to;
      message = formatBookingSMS(bookingData);
      console.log(`Sending booking ${bookingData.status} SMS to:`, to);
    } else {
      // Raw SMS
      const smsData = requestData as SMSRequest;
      to = smsData.to;
      message = smsData.message;
      console.log("Sending raw SMS to:", to);
    }

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await sendSMS(to, message);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});