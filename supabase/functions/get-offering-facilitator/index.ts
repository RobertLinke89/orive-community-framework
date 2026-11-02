import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-orive-client-token",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIp(req: Request): string {
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

function isLikelyBot(req: Request): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  if (!ua) return true;
  return /(bot|crawler|spider|scrapy|curl|wget|python|httpclient|go-http-client)/i.test(ua);
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts = 300,
  windowMs = 60 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const windowStart = new Date(Date.now() - windowMs);
  const now = new Date();

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

    const ip = getClientIp(req);
    const token = getClientToken(req);
    const bot = isLikelyBot(req);
    const maxPerIp = bot ? 60 : 600;

    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "offering_facilitator_get",
      maxPerIp,
      60 * 60 * 1000
    );

    const headers = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-RateLimit-Policy": `ip+token:${maxPerIp}/hour`,
      ...(rl.allowed ? {} : { "Retry-After": String(rl.retryAfterSeconds) }),
    };

    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers,
      });
    }

    const body = await req.json().catch(() => ({}));
    const offeringId = body?.offeringId;

    if (!offeringId || !UUID_RE.test(offeringId)) {
      return new Response(
        JSON.stringify({ error: "Provide a valid offeringId" }),
        { status: 400, headers }
      );
    }

    // First, verify the offering exists and is active
    const { data: offering, error: offeringError } = await supabase
      .from("offerings")
      .select("id, facilitator_id, status")
      .eq("id", offeringId)
      .eq("status", "active")
      .maybeSingle();

    if (offeringError) {
      console.error("Error fetching offering:", offeringError);
      return new Response(JSON.stringify({ error: "Failed to verify offering" }), {
        status: 500,
        headers,
      });
    }

    if (!offering) {
      return new Response(
        JSON.stringify({ facilitator: null, error: "Offering not found or not active" }),
        { status: 404, headers }
      );
    }

    // Fetch facilitator profile - REQUIRE is_visible to be true
    // Public offerings MUST have a visible facilitator profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, professional_title, username, is_visible")
      .eq("id", offering.facilitator_id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching facilitator profile:", profileError);
      return new Response(JSON.stringify({ error: "Failed to load facilitator" }), {
        status: 500,
        headers,
      });
    }

    // If profile doesn't exist or is not visible, return 404
    // This enforces the rule that all public offerings must have a visible facilitator
    if (!profile || profile.is_visible === false) {
      return new Response(
        JSON.stringify({ 
          facilitator: null, 
          error: "Facilitator profile not public",
          notPublic: true
        }),
        { status: 404, headers }
      );
    }

    // Remove is_visible from response (internal field)
    const { is_visible, ...publicProfile } = profile;

    return new Response(
      JSON.stringify({
        facilitator: publicProfile,
        rateLimit: { remaining: rl.remaining },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error in get-offering-facilitator:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
