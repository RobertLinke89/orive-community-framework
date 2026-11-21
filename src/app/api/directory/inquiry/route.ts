import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getDirectoryProfile } from "@/lib/directorySample";
import { notifyInternal } from "@/lib/internalNotify";
import { fetchFacilitatorContactEmail } from "@/lib/directoryFacilitatorContact";
import { renderDirectoryEnquiryEmail, resolveEnquiryRecipient } from "@/lib/directoryEnquiryMail";
import { sendEmail } from "@/lib/email";
import { internalRecipient } from "@/lib/outboundMailGuard";

export const dynamic = "force-dynamic";

// POST form from a directory profile ("Anfrage senden"). Stores the request in public.directory_inquiries
// (RLS: insert-only for anon). Rate limit per IP + per profile, honeypot + minimum fill time.
// Mail: from hello@orive.co to facilitator crawl email (Reply-To = seeker), or fallback to Robert.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 50000) for (const [k, v] of hits) if (!v.some((t) => now - t < 86400_000)) hits.delete(k);
  return false;
}
const EMAIL = /^[^\s@<>()",;:]{1,64}@[^\s@<>()",;:]{1,190}\.[a-z]{2,24}$/i;
const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);

export async function POST(req: Request) {
  const base = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || base.host;
  const proto = req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "");
  const fd = await req.formData().catch(() => null);
  const slug = String(fd?.get("slug") || "").toLowerCase();
  const p = await getDirectoryProfile(slug);
  if (!p) return new NextResponse("Not found", { status: 404 });
  const back = (r: "ok" | "err" | "rate", routed?: boolean) => {
    const q =
      r === "ok" && typeof routed === "boolean"
        ? `anfrage=ok&routed=${routed ? "1" : "0"}`
        : `anfrage=${r}`;
    return NextResponse.redirect(`${proto}://${host}/${p.slug}?${q}#anfrage-status`, 303);
  };

  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (limited("ip:" + ip, 5, 10 * 60_000) || limited("ipd:" + ip, 20, 86400_000) || limited("p:" + p.slug, 30, 86400_000))
    return back("rate");

  // honeypot or filled in faster than 3 s: pretend success, store nothing
  const ts = Number(fd?.get("ts") || 0);
  if (fd?.get("website_url") || !ts || Date.now() - ts < 3000) return back("ok", false);

  const name = clean(fd?.get("name"), 120),
    email = clean(fd?.get("email"), 254).toLowerCase(),
    message = clean(fd?.get("message"), 4000);
  const dateRaw = clean(fd?.get("date"), 10);
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) &&
    dateRaw >= new Date().toISOString().slice(0, 10) &&
    dateRaw <= "2100-01-01"
      ? dateRaw
      : null;
  const rawOffer = String(fd?.get("offer") ?? "");
  const idx = Number(rawOffer);
  const GENERAL: Record<string, string> = {
    de: "Angebote auf Anfrage",
    en: "Offers on request",
    fr: "Offres sur demande",
    nl: "Aanbod op aanvraag",
  };
  const offer =
    rawOffer === "general" && p.offers.length === 0
      ? { id: null as string | null, title: GENERAL[p.lang] ?? GENERAL.en }
      : rawOffer !== "" && Number.isInteger(idx) && idx >= 0
        ? p.offers[idx]
        : undefined;
  if (fd?.get("consent") !== "1" || !name || !EMAIL.test(email) || message.length < 5 || !offer || (dateRaw && !date))
    return back("err");

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anon) return back("err");
  const salt = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "orive";
  const row = {
    facilitator_id: p.id,
    profile_slug: p.slug,
    offer_id: offer.id && /^[0-9a-f-]{36}$/i.test(offer.id) ? offer.id : null,
    offer_title: offer.title.slice(0, 200),
    name,
    email,
    message,
    preferred_date: date,
    consent: true,
    consent_version: "directory-inquiry-v2-2026-11-12",
    lang: p.lang,
    ip_hash: createHash("sha256")
      .update(salt + "|" + ip)
      .digest("hex")
      .slice(0, 32),
    user_agent: clean(req.headers.get("user-agent"), 300) || null,
  };
  try {
    const r = await fetch(`${url}/rest/v1/directory_inquiries`, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      console.error("[directory-inquiry] insert failed", r.status);
      return back("err");
    }
  } catch {
    console.error("[directory-inquiry] insert error");
    return back("err");
  }

  const fallback = internalRecipient();
  let facilitatorEmail: string | null = null;
  try {
    facilitatorEmail = await fetchFacilitatorContactEmail(String(p.id));
  } catch {
    console.warn("[directory-inquiry] contact lookup failed");
  }
  const { to, routedToFacilitator } = resolveEnquiryRecipient(facilitatorEmail, fallback);
  const letter = renderDirectoryEnquiryEmail({
    facilitatorName: p.name,
    offerTitle: offer.title,
    profileUrl: `https://orive.co/${p.slug}`,
    seekerName: name,
    seekerEmail: email,
    message,
    preferredDate: date,
    lang: p.lang,
  });
  const sent = await sendEmail({
    to,
    subject: letter.subject,
    html: letter.html,
    text: letter.text,
    replyTo: email,
    from: process.env.EMAIL_FROM || "ORIVE <hello@orive.co>",
    enquiryResolvedTo: to,
  });
  if (!sent.success) {
    console.error("[directory-inquiry] send failed", sent.error);
    await notifyInternal({
      kind: "Anfrage",
      title: `Mail-Fehler: ${p.name} – ${offer.title}`.slice(0, 150),
      host,
      replyTo: email,
      link: `https://orive.co/${p.slug}`,
      rows: [
        ["Facilitator", p.name],
        ["Slug", p.slug],
        ["Soll-Empfänger", to],
        ["RoutedToFacilitator", String(routedToFacilitator)],
        ["Fehler", sent.error || "unknown"],
        ["Name", name],
        ["E-Mail", email],
        ["Nachricht", message],
      ],
    });
  }
  return back("ok", routedToFacilitator && sent.success);
}
