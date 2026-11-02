import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-orive-client-token",
};

const CANONICAL_ORIGIN = "https://orive.app";

function xmlEscape(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toIsoDate(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

function renderSitemap(urls: UrlEntry[]): string {
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : "";
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority =
        typeof u.priority === "number" ? `<priority>${u.priority.toFixed(1)}</priority>` : "";
      return `<url><loc>${xmlEscape(u.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response("Server misconfigured", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ---- Static, high-value public routes ----
    const urls: UrlEntry[] = [
      { loc: `${CANONICAL_ORIGIN}/`, changefreq: "weekly", priority: 1.0 },
      { loc: `${CANONICAL_ORIGIN}/profiles`, changefreq: "daily", priority: 0.9 },
      { loc: `${CANONICAL_ORIGIN}/blog`, changefreq: "weekly", priority: 0.8 },
      { loc: `${CANONICAL_ORIGIN}/shop`, changefreq: "weekly", priority: 0.7 },
      { loc: `${CANONICAL_ORIGIN}/for-facilitators`, changefreq: "monthly", priority: 0.6 },
      { loc: `${CANONICAL_ORIGIN}/about`, changefreq: "monthly", priority: 0.5 },
      { loc: `${CANONICAL_ORIGIN}/formation`, changefreq: "monthly", priority: 0.5 },
    ];

    // ---- Profiles (public) ----
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, updated_at")
      .eq("is_visible", true)
      .limit(5000);

    if (profilesError) throw profilesError;
    for (const p of profiles ?? []) {
      const lastmod = toIsoDate((p as any).updated_at) ?? undefined;
      const username = ((p as any).username ?? "").toString().trim();
      const loc = username ? `${CANONICAL_ORIGIN}/${encodeURIComponent(username)}` : `${CANONICAL_ORIGIN}/p/${p.id}`;
      urls.push({ loc, lastmod, changefreq: "weekly", priority: 0.7 });
    }

    // ---- Blog (published) ----
    const { data: articles, error: articlesError } = await supabase
      .from("blog_articles")
      .select("id, updated_at, published_at")
      .eq("is_published", true)
      .limit(5000);

    if (articlesError) throw articlesError;
    for (const a of articles ?? []) {
      const lastmod =
        toIsoDate((a as any).updated_at) ?? toIsoDate((a as any).published_at) ?? undefined;
      urls.push({ loc: `${CANONICAL_ORIGIN}/blog/${a.id}`, lastmod, changefreq: "monthly", priority: 0.6 });
    }

    // ---- Events (public) ----
    const { data: events, error: eventsError } = await supabase
      .from("offerings")
      .select("id, updated_at, start_at, status, type")
      .eq("type", "event")
      .eq("status", "active")
      .limit(5000);

    if (eventsError) throw eventsError;
    for (const e of events ?? []) {
      const lastmod = toIsoDate((e as any).updated_at) ?? toIsoDate((e as any).start_at) ?? undefined;
      urls.push({ loc: `${CANONICAL_ORIGIN}/event/${e.id}`, lastmod, changefreq: "daily", priority: 0.7 });
    }

    const xml = renderSitemap(urls);
    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        // Cache briefly; crawlers can refresh and still get timely updates.
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("sitemap error", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
