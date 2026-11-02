import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-orive-client-token",
};

type VitalName = "LCP" | "INP" | "CLS";

function getClientToken(req: Request): string {
  const raw = (req.headers.get("x-orive-client-token") || "").trim();
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

function safeString(input: unknown, max = 500): string | null {
  if (typeof input !== "string") return null;
  const s = input.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function safeNumber(input: unknown): number | null {
  const n = typeof input === "number" ? input : typeof input === "string" ? Number(input) : NaN;
  return Number.isFinite(n) ? n : null;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts = 120,
  windowMs = 60 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>
{
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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

    const token = getClientToken(req);
    const ip = getClientIp(req);
    const ua = safeString(req.headers.get("user-agent") ?? "", 512);

    // Rate limit: 120 events/hour per (ip+token). Enough for a few pageviews.
    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "web_vitals_log",
      120,
      60 * 60 * 1000
    );

    const rateHeaders = {
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-RateLimit-Policy": "ip+token:120/hour",
      ...(rl.allowed ? {} : { "Retry-After": String(rl.retryAfterSeconds) }),
    };

    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, ...rateHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const name = safeString(body?.name, 8) as VitalName | null;
    const value = safeNumber(body?.value);

    if (!name || !["LCP", "INP", "CLS"].includes(name)) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...corsHeaders, ...rateHeaders, "Content-Type": "application/json" },
      });
    }
    if (value === null || value < 0) {
      return new Response(JSON.stringify({ error: "Invalid value" }), {
        status: 400,
        headers: { ...corsHeaders, ...rateHeaders, "Content-Type": "application/json" },
      });
    }

    const rating = safeString(body?.rating, 16);
    const delta = safeNumber(body?.delta);
    const metricId = safeString(body?.metricId ?? body?.id, 128);
    const navigationType = safeString(body?.navigationType, 32);
    const pagePath = safeString(body?.pagePath, 200);
    const pageUrl = safeString(body?.pageUrl, 800);

    const ipHash = ip && ip !== "unknown" ? await sha256Hex(ip) : null;

    const { error } = await supabase.from("web_vitals_events").insert({
      name,
      value,
      rating,
      delta,
      metric_id: metricId,
      navigation_type: navigationType,
      page_path: pagePath,
      page_url: pageUrl,
      user_agent: ua,
      client_token: token || null,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("Failed to insert web vitals event:", error);
      return new Response(JSON.stringify({ error: "Failed to log" }), {
        status: 500,
        headers: { ...corsHeaders, ...rateHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, rateLimit: { remaining: rl.remaining } }), {
      status: 200,
      headers: { ...corsHeaders, ...rateHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("log-web-vitals unexpected error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
