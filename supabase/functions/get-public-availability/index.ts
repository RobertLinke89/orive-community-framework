import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-orive-client-token",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIp(req: Request): string {
  // Common proxy headers. We take the first IP in x-forwarded-for.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

function getClientToken(req: Request): string {
  const raw = (req.headers.get("x-orive-client-token") || "").trim();
  return raw && raw.length <= 128 ? raw : "";
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts = 30,
  windowMs = 60 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>{
  const windowStart = new Date(Date.now() - windowMs);
  const now = new Date();

  // Fetch existing counter (service role can access rate_limits)
  const { data: existing, error: selectError } = await supabase
    .from("rate_limits")
    .select("id, attempt_count, window_start")
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error("Rate limit select error:", selectError);
    // Fail-open to preserve UX if infra hiccups; still reduces scraping in normal ops.
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  }

  if (!existing) {
    const { error: insertError } = await supabase.from("rate_limits").insert({
      identifier,
      action,
      attempt_count: 1,
      window_start: now.toISOString(),
    });

    if (insertError) {
      console.error("Rate limit insert error:", insertError);
      return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
    }

    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.attempt_count >= maxAttempts) {
    const start = new Date(existing.window_start);
    const retryAfterMs = Math.max(0, start.getTime() + windowMs - Date.now());
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  const { error: updateError } = await supabase
    .from("rate_limits")
    .update({ attempt_count: existing.attempt_count + 1 })
    .eq("id", existing.id);

  if (updateError) {
    console.error("Rate limit update error:", updateError);
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - (existing.attempt_count + 1)),
    retryAfterSeconds: 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let facilitatorId: string | null = null;
    if (req.method === "GET") {
      const url = new URL(req.url);
      facilitatorId = url.searchParams.get("facilitatorId");
    } else {
      const body = await req.json().catch(() => ({}));
      facilitatorId = body?.facilitatorId ?? null;
    }

    if (!facilitatorId || !UUID_RE.test(facilitatorId)) {
      return new Response(JSON.stringify({ error: "Invalid facilitatorId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = getClientIp(req);
    const token = getClientToken(req);

    // Rate limit per IP + per facilitator (tight) + per IP (broader)
    const perFacKey = `ip:${ip}:tok:${token || "none"}:fac:${facilitatorId}`;
    const perIpKey = `ip:${ip}`;

    const perFac = await checkRateLimit(
      supabase,
      perFacKey,
      "public_availability_lookup_fac",
      30,
      60 * 60 * 1000
    );
    if (!perFac.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": perFac.retryAfterSeconds.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Policy": "token+ip+fac,ip; window=3600",
          },
        }
      );
    }

    const perIp = await checkRateLimit(
      supabase,
      perIpKey,
      "public_availability_lookup_ip",
      200,
      60 * 60 * 1000
    );
    if (!perIp.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": perIp.retryAfterSeconds.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Policy": "token+ip+fac,ip; window=3600",
          },
        }
      );
    }

    // Only return availability for facilitators that are public/active
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", facilitatorId)
      .eq("onboarding_completed", true)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return new Response(JSON.stringify({ error: "Failed to load availability" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      return new Response(JSON.stringify({ slots: [] }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(Math.min(perFac.remaining, perIp.remaining)),
          "X-RateLimit-Policy": "token+ip+fac,ip; window=3600",
        },
      });
    }

    const { data: slots, error: slotsError } = await supabase
      .from("availability_slots")
      .select("day_of_week, start_time, end_time")
      .eq("facilitator_id", facilitatorId)
      .eq("is_available", true)
      .order("day_of_week")
      .order("start_time")
      .limit(200);

    if (slotsError) {
      console.error("Availability lookup error:", slotsError);
      return new Response(JSON.stringify({ error: "Failed to load availability" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        slots: slots ?? [],
        rateLimit: {
          remainingPerFacilitator: perFac.remaining,
          remainingPerIp: perIp.remaining,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(Math.min(perFac.remaining, perIp.remaining)),
          "X-RateLimit-Policy": "token+ip+fac,ip; window=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-availability:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
