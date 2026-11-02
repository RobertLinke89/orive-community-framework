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

function normalizeText(input: unknown, maxLen: number): string | null {
  if (typeof input !== "string") return null;
  const s = input.trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function normalizeLimit(input: unknown, def = 200, max = 200): number {
  const n = typeof input === "number" ? input : typeof input === "string" ? Number(input) : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(1, Math.floor(n)));
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

    const maxPerIp = bot ? 60 : 600; // requests/hour
    const rl = await checkRateLimit(
      supabase,
      `ip:${ip}:tok:${token || "none"}`,
      "public_blog_list",
      maxPerIp,
      60 * 60 * 1000
    );
    const rlIp = await checkRateLimit(
      supabase,
      `ip:${ip}`,
      "public_blog_list_ip",
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
    const category = normalizeText(body?.category, 40);
    const excludeId = normalizeText(body?.excludeId, 64);
    const limit = normalizeLimit(body?.limit, 200, 200);

    let q = supabase
      .from("blog_articles")
      .select(
        "id, title, excerpt, content, category, author, published_at, read_time, image_url"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category) q = q.eq("category", category);
    if (excludeId) q = q.neq("id", excludeId);

    const { data: articles, error } = await q;
    if (error) {
      console.error("List blog articles error:", error);
      return new Response(JSON.stringify({ error: "Failed to load articles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = (articles ?? []).map((a: any) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      author: a.author,
      date: a.published_at,
      readTime: a.read_time,
      image: a.image_url,
    }));

    const remaining = Math.min(rl.remaining, rlIp.remaining);
    return new Response(
      JSON.stringify({
        articles: normalized,
        rateLimit: { remaining, botHeuristic: bot },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Policy": "token+ip,ip; window=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-blog-articles:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
