import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

const SHOPIFY_API_VERSION = "2025-07";

// NOTE: Storefront requests are proxied so the client does not need a token.
// The Storefront access token is stored as a backend secret: SHOPIFY_STOREFRONT_ACCESS_TOKEN.
const SHOPIFY_STORE_PERMANENT_DOMAIN = "orive-co-k30qg.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const RATE_LIMIT_POLICY = "ip; window=3600; max=120";

type StorefrontRequestBody = {
  query: string;
  variables?: Record<string, unknown>;
};

function getClientIp(req: Request): string {
  // Common reverse-proxy header. If multiple, take the first.
  const raw = req.headers.get("x-forwarded-for") ?? "";
  const first = raw.split(",")[0]?.trim();
  return first || "unknown";
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
    const token = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing backend configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!token) {
      console.error("Missing backend secret: SHOPIFY_STOREFRONT_ACCESS_TOKEN");
      return new Response(JSON.stringify({ error: "Shop integration not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Basic abuse protection (public endpoint).
    const ip = getClientIp(req);
    const rate = await checkRateLimit(
      supabaseAdmin,
      `shopify:${ip}`,
      "shopify_storefront",
      120,
      60 * 60 * 1000
    );

    if (!rate.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
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

    const body = (await req.json()) as StorefrontRequestBody;

    // Input validation
    if (!body || typeof body.query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Policy": RATE_LIMIT_POLICY,
        },
      });
    }

    const query = body.query.trim();
    if (query.length < 1 || query.length > 50_000) {
      return new Response(JSON.stringify({ error: "Query too large" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Policy": RATE_LIMIT_POLICY,
        },
      });
    }

    const variables = body.variables && typeof body.variables === "object" ? body.variables : {};

    const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });

    // Pass through status code; client handles specific cases (e.g., 402).
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(rate.remaining),
        "X-RateLimit-Policy": RATE_LIMIT_POLICY,
      },
    });
  } catch (error) {
    console.error("Error in shopify-storefront:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
