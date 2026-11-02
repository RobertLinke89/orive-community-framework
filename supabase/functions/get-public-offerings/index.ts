import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-orive-client-token",
  "Access-Control-Expose-Headers": "X-RateLimit-Remaining, X-RateLimit-Policy, Retry-After",
};

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

function isLikelyBot(req: Request): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  if (!ua) return true;
  return /(bot|crawler|spider|scrapy|curl|wget|python|httpclient|go-http-client)/i.test(ua);
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts = 240,
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

    const maxPerIp = bot ? 30 : 240; // req/hour
    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "public_offerings_list",
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

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const page = Math.max(1, Number(body?.page ?? 1) || 1);
    const pageSizeRaw = Number(body?.pageSize ?? 200) || 200;
    const pageSize = Math.min(200, Math.max(1, pageSizeRaw));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch offerings without the gallery join (FK not in schema cache yet)
    const { data: offeringsData, error: offeringsError } = await supabase
      .from("offerings")
      .select(
        `id, facilitator_id, type, title, description, price, duration, location, status, created_at, image_url, start_at, end_at, timezone, capacity`
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (offeringsError) {
      console.error("Error fetching offerings:", offeringsError);
      return new Response(JSON.stringify({ error: "Failed to fetch offerings" }), {
        status: 500,
        headers,
      });
    }

    if (!offeringsData || offeringsData.length === 0) {
      return new Response(JSON.stringify({ offerings: [], page, pageSize }), {
        status: 200,
        headers,
      });
    }

    // Collect unique facilitator IDs and offering IDs
    const facilitatorIds = [...new Set(offeringsData.map((o: any) => o.facilitator_id))];
    const offeringIds = offeringsData.map((o: any) => o.id);

    // Fetch facilitator profiles - only visible ones with completed onboarding
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, professional_title, username, is_visible, onboarding_completed")
      .in("id", facilitatorIds)
      .eq("is_visible", true)
      .eq("onboarding_completed", true);

    // Build a set of visible facilitator IDs
    const visibleFacilitatorIds = new Set((profilesData || []).map((p: any) => p.id));

    // Filter offerings to only include those from visible facilitators
    const visibleOfferingsData = offeringsData.filter((o: any) => visibleFacilitatorIds.has(o.facilitator_id));
    const visibleOfferingIds = visibleOfferingsData.map((o: any) => o.id);

    // Fetch gallery images for visible offerings only
    const { data: galleryData } = await supabase
      .from("offering_images")
      .select("id, offering_id, image_url, alt_text, sort_order")
      .in("offering_id", visibleOfferingIds)
      .order("sort_order", { ascending: true });

    // Build lookup maps
    const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
    const galleryMap = new Map<string, any[]>();
    for (const img of galleryData || []) {
      const list = galleryMap.get(img.offering_id) || [];
      list.push({ id: img.id, image_url: img.image_url, alt_text: img.alt_text, sort_order: img.sort_order });
      galleryMap.set(img.offering_id, list);
    }

    // Merge data - only visible offerings
    const offerings = visibleOfferingsData.map((o: any) => ({
      ...o,
      facilitator: profilesMap.get(o.facilitator_id) || null,
      gallery: galleryMap.get(o.id) || [],
    }));

    return new Response(JSON.stringify({ offerings, page, pageSize }), {
      status: 200,
      headers,
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
