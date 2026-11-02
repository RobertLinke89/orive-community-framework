import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-orive-client-token",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

function getClientToken(req: Request): string {
  const raw = (req.headers.get("x-orive-client-token") || "").trim();
  return raw && raw.length <= 128 ? raw : "";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Allows dots for the requested pattern: robert.linke
const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._-]{0,48}[a-z0-9])?$/i;

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
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
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>{
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
    const maxPerIp = bot ? 60 : 600; // profile views/hour
    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "public_profile_get",
      maxPerIp,
      60 * 60 * 1000
    );

    const rlIp = await checkRateLimit(
      supabase,
      `ip:${ip}`,
      "public_profile_get_ip",
      bot ? 60 : 600,
      60 * 60 * 1000
    );

    if (!rl.allowed || !rlIp.allowed) {
      const chosen = !rl.allowed ? rl : rlIp;
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": chosen.retryAfterSeconds.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Policy": "token+ip,ip; window=3600",
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const profileId = body?.profileId;
    const usernameRaw = (body?.username ?? "").toString().trim();
    const username = usernameRaw ? usernameRaw.toLowerCase() : "";

    const hasProfileId = typeof profileId === "string" && UUID_RE.test(profileId);
    const hasUsername = !!username && USERNAME_RE.test(username);

    if (!hasProfileId && !hasUsername) {
      return new Response(
        JSON.stringify({ error: "Provide a valid profileId or username" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let q = supabase
      .from("profiles")
      .select(
        "id, username, full_name, professional_title, expertise, bio, location, avatar_url, banner_url, onboarding_completed"
      )
      .eq("onboarding_completed", true)
      .eq("is_visible", true);

    if (hasProfileId) q = q.eq("id", profileId);
    if (hasUsername) q = q.ilike("username", username);

    const { data: profile, error } = await q.maybeSingle();

    if (error) {
      console.error("Get profile error:", error);
      return new Response(JSON.stringify({ error: "Failed to load profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      return new Response(
        JSON.stringify({
          profile: null,
          error: "Profile not public",
          rateLimit: { remaining: Math.min(rl.remaining, rlIp.remaining), botHeuristic: bot },
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(Math.min(rl.remaining, rlIp.remaining)),
            "X-RateLimit-Policy": "token+ip,ip; window=3600",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        profile,
        rateLimit: { remaining: Math.min(rl.remaining, rlIp.remaining), botHeuristic: bot },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(Math.min(rl.remaining, rlIp.remaining)),
          "X-RateLimit-Policy": "token+ip,ip; window=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-profile:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
