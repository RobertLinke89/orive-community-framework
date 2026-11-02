import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allows dots for the requested pattern: robert.linke
const UsernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((v) => v.toLowerCase())
  .refine((v) => /^[a-z0-9](?:[a-z0-9._-]{0,48}[a-z0-9])?$/.test(v), {
    message: "Invalid username format",
  });

const RATE_LIMIT_MAX = 20; // 20 requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (!rateLimit) {
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

  await supabase
    .from('rate_limits')
    .update({ attempt_count: rateLimit.attempt_count + 1 })
    .eq('id', rateLimit.id);

  return { 
    allowed: true, 
    remaining: maxAttempts - (rateLimit.attempt_count + 1) 
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // We accept only authenticated requests (Business Settings page).
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
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

    // Rate limit check per user to prevent username enumeration
    const rateLimitCheck = await checkRateLimit(
      supabase,
      user.id,
      'check_username',
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS
    );

    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for username check by user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: 60
        }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0"
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UsernameSchema.safeParse(body?.username);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid username",
          details: parsed.error.issues.map((i) => i.message),
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(rateLimitCheck.remaining)
          },
        }
      );
    }

    const username = parsed.data;

    const { data: existing, error: existsErr } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .neq("id", user.id)
      .limit(1)
      .maybeSingle();

    if (existsErr) {
      console.error("check-username: query error", existsErr);
      return new Response(JSON.stringify({ error: "Failed to check username" }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimitCheck.remaining)
        },
      });
    }

    const available = !existing;
    return new Response(JSON.stringify({ username, available }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(rateLimitCheck.remaining)
      },
    });
  } catch (err) {
    console.error("check-username: unexpected", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
