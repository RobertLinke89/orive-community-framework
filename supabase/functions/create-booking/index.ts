import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// Declare EdgeRuntime for Deno/Supabase Edge Functions
declare const EdgeRuntime: { waitUntil: (promise: Promise<any>) => void };
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-orive-client-token',
  'Access-Control-Expose-Headers': 'X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After',
};

const RATE_LIMIT_POLICY = 'email; window=3600; max=5';

// Input validation schema with proper format checks
const BookingSchema = z.object({
  facilitatorId: z.string().uuid("Invalid facilitator ID"),
  offeringId: z.string().uuid("Invalid offering ID").optional().nullable(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  bookingTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (HH:MM)"),
  duration: z.number().int().min(15).max(480),
  clientName: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[\p{L}\p{M}\s.'\-]+$/u, "Name contains invalid characters"),
  clientEmail: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .transform(val => val.toLowerCase()),
  clientPhone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format (E.164)")
    .optional()
    .nullable(),
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

type BookingRequest = z.infer<typeof BookingSchema>;

async function logPiiAccess(
  supabase: any,
  action: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  try {
    await supabase.from('pii_access_log').insert({
      user_id: null, // Anonymous booking
      resource_type: 'edge_function',
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      record_count: 1,
    });
  } catch (err) {
    // Log but don't fail the main operation
    console.error('Failed to log PII access:', err);
  }
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 3600000
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Get existing rate limit entry
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (!rateLimit) {
    // First request in this window
    await supabase.from('rate_limits').insert({
      identifier,
      action,
      attempt_count: 1,
      window_start: now.toISOString()
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (rateLimit.attempt_count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  await supabase
    .from('rate_limits')
    .update({ attempt_count: rateLimit.attempt_count + 1 })
    .eq('id', rateLimit.id);

  return { 
    allowed: true, 
    remaining: maxAttempts - (rateLimit.attempt_count + 1) 
  };
}

async function sendConfirmationEmail(
  supabaseUrl: string,
  supabaseAnonKey: string,
  emailData: {
    to: string;
    customerName: string;
    sessionTitle: string;
    sessionType: 'session' | 'experience';
    bookingDate: string;
    bookingTime: string;
    bookingDateRaw: string;
    duration: number;
    facilitatorName: string;
    status: 'pending' | 'confirmed';
  }
) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send confirmation email:', error);
    } else {
      console.log('Confirmation email sent successfully');
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

async function notifyFacilitator(
  supabaseUrl: string,
  supabaseAnonKey: string,
  notificationData: {
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
) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/notify-facilitator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(notificationData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to notify facilitator:', error);
    } else {
      console.log('Facilitator notification sent successfully');
    }
  } catch (error) {
    console.error('Error notifying facilitator:', error);
  }
}

async function sendBookingSMS(
  supabaseUrl: string,
  supabaseAnonKey: string,
  smsData: {
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
) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(smsData),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send SMS:', error);
    } else {
      console.log('SMS sent successfully');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request metadata for audit logging
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const userAgent = req.headers.get('user-agent')?.substring(0, 500) || null;

    const rawBody = await req.json();

    // Validate input with zod schema
    const parseResult = BookingSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      
      console.log('Validation failed:', errors);
      
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: errors
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Policy': RATE_LIMIT_POLICY,
          },
        }
      );
    }

    const bookingData: BookingRequest = parseResult.data;

    // Log PII access before processing (audit trail)
    await logPiiAccess(supabase, 'create_booking', ipAddress, userAgent);

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(
      supabase,
      bookingData.clientEmail,
      'booking_create',
      5, // 5 bookings per hour
      3600000 // 1 hour window
    );

    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for booking request`);
      
      // Log rate limit violation
      await logPiiAccess(supabase, 'create_booking_rate_limited', ipAddress, userAgent);
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many booking requests. Please try again later.',
          retryAfter: 3600 // seconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600',
            'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
            'X-RateLimit-Policy': RATE_LIMIT_POLICY,
          } 
        }
      );
    }

    // Encrypt PII fields before storing
    let encryptedName = bookingData.clientName;
    let encryptedEmail = bookingData.clientEmail;
    let encryptedPhone = bookingData.clientPhone || null;

    try {
      // Encrypt client name
      const { data: nameResult, error: nameErr } = await supabase.rpc('encrypt_pii', {
        plaintext: encryptedName,
      });
      if (nameErr || !nameResult) throw nameErr ?? new Error('encrypt_pii(name) returned empty');
      encryptedName = nameResult;

      // Encrypt client email
      const { data: emailResult, error: emailErr } = await supabase.rpc('encrypt_pii', {
        plaintext: encryptedEmail,
      });
      if (emailErr || !emailResult) throw emailErr ?? new Error('encrypt_pii(email) returned empty');
      encryptedEmail = emailResult;

      // Encrypt client phone if provided
      if (encryptedPhone) {
        const { data: phoneResult, error: phoneErr } = await supabase.rpc('encrypt_pii', {
          plaintext: encryptedPhone,
        });
        if (phoneErr || !phoneResult) throw phoneErr ?? new Error('encrypt_pii(phone) returned empty');
        encryptedPhone = phoneResult;
      }

      console.log('PII encrypted successfully');
    } catch (encryptError) {
      console.error('PII encryption failed - refusing to store plaintext PII:', encryptError);
      return new Response(
        JSON.stringify({ error: 'Unable to process booking at this time' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
            'X-RateLimit-Policy': RATE_LIMIT_POLICY,
          },
        }
      );
    }

    // Create booking with encrypted PII
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        facilitator_id: bookingData.facilitatorId,
        offering_id: bookingData.offeringId || null,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        duration: bookingData.duration,
        client_name: encryptedName,
        client_email: encryptedEmail,
        client_phone: encryptedPhone,
        notes: bookingData.notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
            'X-RateLimit-Policy': RATE_LIMIT_POLICY,
          },
        }
      );
    }

    console.log(`Booking created successfully`);
    
    // Fetch facilitator details and offering type for email
    let facilitatorName = 'Your Facilitator';
    let facilitatorEmail = '';
    let sessionTitle = 'Session';
    let sessionType: 'session' | 'experience' = 'session';

    // Get facilitator name from profile
    const { data: facilitator } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', bookingData.facilitatorId)
      .single();

    if (facilitator) {
      facilitatorName = facilitator.full_name;
      
      // Get facilitator email from auth.users using admin API
      const { data: authUser } = await supabase.auth.admin.getUserById(
        bookingData.facilitatorId
      );
      facilitatorEmail = authUser?.user?.email || '';
    }

    // Get offering details if available
    if (bookingData.offeringId) {
      const { data: offering } = await supabase
        .from('offerings')
        .select('title, type')
        .eq('id', bookingData.offeringId)
        .single();

      if (offering) {
        sessionTitle = offering.title;
        sessionType = offering.type === 'experience' ? 'experience' : 'session';
      }
    }

    // Format date for email
    const dateObj = new Date(bookingData.bookingDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send confirmation email to client (async, don't wait)
    EdgeRuntime.waitUntil(
      sendConfirmationEmail(supabaseUrl, supabaseAnonKey, {
        to: bookingData.clientEmail,
        customerName: bookingData.clientName,
        sessionTitle,
        sessionType,
        bookingDate: formattedDate,
        bookingTime: bookingData.bookingTime,
        bookingDateRaw: bookingData.bookingDate,
        duration: bookingData.duration,
        facilitatorName,
        status: 'pending',
      })
    );

    // Send notification email to facilitator (async, don't wait)
    if (facilitatorEmail) {
      EdgeRuntime.waitUntil(
        notifyFacilitator(supabaseUrl, supabaseAnonKey, {
          facilitatorEmail,
          facilitatorName,
          clientName: bookingData.clientName,
          clientEmail: bookingData.clientEmail,
          clientPhone: bookingData.clientPhone || undefined,
          sessionTitle,
          sessionType,
          bookingDate: formattedDate,
          bookingTime: bookingData.bookingTime,
          duration: bookingData.duration,
          notes: bookingData.notes || undefined,
        })
      );
    } else {
      console.log('No facilitator email found, skipping email notification');
    }

    // Send SMS confirmation to client if phone provided (async, don't wait)
    if (bookingData.clientPhone) {
      EdgeRuntime.waitUntil(
        sendBookingSMS(supabaseUrl, supabaseAnonKey, {
          to: bookingData.clientPhone,
          customerName: bookingData.clientName,
          sessionTitle,
          facilitatorName,
          bookingDate: formattedDate,
          bookingTime: bookingData.bookingTime,
          status: 'pending',
        })
      );
    } else {
      console.log('No client phone provided, skipping SMS notification');
    }
    
    // Return a minimal booking payload (avoid echoing any PII back to the client)
    const safeBooking = {
      id: data.id,
      facilitator_id: data.facilitator_id,
      offering_id: data.offering_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      duration: data.duration,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return new Response(
      JSON.stringify({
        success: true,
        booking: safeBooking,
        rateLimitRemaining: rateLimitCheck.remaining,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimitCheck.remaining),
          'X-RateLimit-Policy': RATE_LIMIT_POLICY,
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Policy': RATE_LIMIT_POLICY,
        },
      }
    );
  }
});
