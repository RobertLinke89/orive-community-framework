import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/appOrigin";
import { clientKey } from "@/lib/rateLimit";
import { rateLimitShared } from "@/lib/rateLimitShared";
import { verifyTurnstile, clientIp, turnstileTokenFrom } from "@/lib/turnstile";
import { parseHealthConsent, buildConsentRecord, consentStore } from "@/lib/consent";
import { logError } from "@/lib/safeLog";
import { createSessionCheckout } from "@/lib/sessionPayments";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/session-bookings/checkout — create a 35-min hold and a Stripe setup Checkout. Price is derived in the DB. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!(await rateLimitShared(`session-checkout:${clientKey(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const captcha = await verifyTurnstile(turnstileTokenFrom(req, body), { ip: clientIp(req), action: "booking" });
  if (!captcha.ok) return NextResponse.json({ error: "Captcha check failed." }, { status: 403 });
  const hasIntake = body.intake !== undefined && body.intake !== null;
  const consent = parseHealthConsent(body.healthConsent);
  if (hasIntake && !consent) {
    return NextResponse.json({ error: "Explicit consent for health-related intake answers is required." }, { status: 400 });
  }
  const offeringId = String(body.offeringId || "");
  const startAt = String(body.startAt || "");
  const customerName = String(body.customerName || "").trim().slice(0, 100);
  const customerEmail = String(body.customerEmail || "").trim().toLowerCase().slice(0, 255);
  if (!UUID_RE.test(offeringId) || Number.isNaN(Date.parse(startAt)) || customerName.length < 2 || !EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }
  const result = await createSessionCheckout({
    offeringId,
    startAt: new Date(startAt).toISOString(),
    customerName,
    customerEmail,
    customerPhone: body.customerPhone ? String(body.customerPhone).slice(0, 20) : null,
    notes: body.notes ? String(body.notes).slice(0, 500) : null,
    intake: body.intake ?? null,
    healthDataConsent: hasIntake && !!consent,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  if (hasIntake && consent) {
    try { await consentStore()?.insert(buildConsentRecord(result.bookingId, consent, req)); }
    catch (e) { logError("consent.record", e, { bookingId: result.bookingId }); }
  }
  return NextResponse.json({ bookingId: result.bookingId, url: result.url, token: result.token, holdExpiresAt: result.holdExpiresAt });
}
