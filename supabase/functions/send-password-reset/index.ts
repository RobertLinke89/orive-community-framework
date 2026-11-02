import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

const RATE_LIMIT_POLICY = "email; window=3600; max=3";

type PasswordResetRequest = {
  email: string;
  captchaToken: string;
  redirectTo?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteip) form.set("remoteip", remoteip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!resp.ok) return false;
  const json = await resp.json();
  return !!json.success;
}

async function checkRateLimit(
  supabaseAdmin: any,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }>
{
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const { data: existing } = await supabaseAdmin
    .from("rate_limits")
    .select("id, attempt_count, window_start")
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("window_start", windowStart.toISOString())
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from("rate_limits").insert({
      identifier,
      action,
      attempt_count: 1,
      window_start: now.toISOString(),
    });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSec: 0 };
  }

  if (existing.attempt_count >= maxAttempts) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  await supabaseAdmin
    .from("rate_limits")
    .update({ attempt_count: existing.attempt_count + 1 })
    .eq("id", existing.id);

  return {
    allowed: true,
    remaining: maxAttempts - (existing.attempt_count + 1),
    retryAfterSec: 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = (await req.json()) as PasswordResetRequest;
    if (!body?.email || typeof body.email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body?.captchaToken || typeof body.captchaToken !== "string") {
      return new Response(JSON.stringify({ error: "CAPTCHA is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = normalizeEmail(body.email);
    if (!emailRegex.test(email) || email.length < 5 || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || undefined;
    const captchaOk = await verifyTurnstile(body.captchaToken, ip);
    if (!captchaOk) {
      return new Response(JSON.stringify({ error: "CAPTCHA verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rate = await checkRateLimit(supabaseAdmin, email, "password_reset_send", 3, 60 * 60 * 1000);
    if (!rate.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rate.retryAfterSec),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Policy": RATE_LIMIT_POLICY,
        },
      });
    }

    // Use admin generateLink so we can gate the action behind CAPTCHA.
    // Always return success (avoid account enumeration).
    const redirectTo =
      typeof body.redirectTo === "string" && body.redirectTo.length > 0
        ? body.redirectTo
        : "https://orive.app/reset-password";

    try {
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
    } catch (e) {
      // Swallow errors to avoid enumerating users.
      console.warn("Password reset generateLink failed (masked)");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(rate.remaining),
        "X-RateLimit-Policy": RATE_LIMIT_POLICY,
      },
    });
  } catch (error) {
    console.error("Error in send-password-reset:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
