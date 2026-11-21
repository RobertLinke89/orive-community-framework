import { NextResponse } from "next/server";
import { findDirectoryProfile, recordRemoval } from "@/lib/directorySample";
import { notifyInternal } from "@/lib/internalNotify";

export const dynamic = "force-dynamic";
const hits = new Map<string, number[]>();

// POST form from /directory/remove/[slug]. No login (the profile is public-source data), simple per-IP rate limit.
// Mail: one internal notification to robert.linke@me.com only (nobody else is contacted).
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (recent.length >= 20) return new NextResponse("Too many requests", { status: 429 });
  recent.push(now); hits.set(ip, recent);
  const fd = await req.formData().catch(() => null);
  const slug = String(fd?.get("slug") || "").toLowerCase();
  const p = await findDirectoryProfile(slug);
  if (!p) return new NextResponse("Not found", { status: 404 });
  const base = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || base.host;
  const proto = req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "");
  const back = (q: string) => NextResponse.redirect(`${proto}://${host}/directory/remove/${p.slug}?${q}`, 303);
  if (fd?.get("website_url")) return back("done=1"); // honeypot: pretend success, store nothing
  if (fd?.get("confirm") !== "1") return back("err=1");
  const reason = String(fd?.get("reason") || "").trim() || null;
  await recordRemoval(p.slug, reason);
  await notifyInternal({
    kind: "Profil-Entfernung", title: p.name, host, link: `https://orive.co/${p.slug}`,
    rows: [["Facilitator", p.name], ["Slug", p.slug], ["Grund", reason ? reason.slice(0, 1000) : null], ["Status", "sofort ausgeblendet"],
      ["Eingang", new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) + " (Europe/Berlin)"]],
  });
  return back("done=1");
}
