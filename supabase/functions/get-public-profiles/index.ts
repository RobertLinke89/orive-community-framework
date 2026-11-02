import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-orive-client-token",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

function getClientToken(req: Request): string {
  const raw = (req.headers.get("x-orive-client-token") || "").trim();
  // Bound length to avoid log/DB abuse.
  return raw && raw.length <= 128 ? raw : "";
}

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
  maxAttempts = 120,
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

    // Optional lightweight "bot detection" via heuristics: bot-like UAs get much tighter limits.
    const maxPerIp = bot ? 30 : 240; // requests/hour
    // Primary limiter is token+ip (harder to evade than IP-only behind NATs).
    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "public_profiles_list",
      maxPerIp,
      60 * 60 * 1000
    );

    // Secondary limiter is IP-only to reduce evasion by rotating tokens.
    const rlIp = await checkRateLimit(
      supabase,
      `ip:${ip}`,
      "public_profiles_list_ip",
      bot ? 30 : 240,
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
    const page = Math.max(1, Number(body?.page ?? 1));
    const pageSizeRaw = Number(body?.pageSize ?? 12);
    const pageSize = Math.min(24, Math.max(1, pageSizeRaw));
    const offset = (page - 1) * pageSize;

    // Server-enforced max window: prevents clients from paginating through the entire dataset.
    // (This is a pragmatic anti-scraping control. Adjust based on marketplace size.)
    const maxPages = 10;
    if (page > maxPages) {
      return new Response(
        JSON.stringify({ profiles: [], page, pageSize, hasMore: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, professional_title, expertise, location, avatar_url, banner_url")
      .eq("onboarding_completed", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("List profiles error:", error);
      return new Response(JSON.stringify({ error: "Failed to load profiles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasMore = (profiles?.length ?? 0) === pageSize && page < maxPages;

    return new Response(
      JSON.stringify({
        profiles: profiles ?? [],
        page,
        pageSize,
        hasMore,
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
    console.error("Error in get-public-profiles:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
