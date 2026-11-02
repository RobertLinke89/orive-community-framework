import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RETENTION } from "@/lib/retention";
import { HEALTH_CONSENT_TEXT, HEALTH_CONSENT_VERSION, parseHealthConsent, consentTextHash, setConsentStoreForTests, type ConsentRecord } from "@/lib/consent";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimitShared, setSharedRateLimitForTests, hashKey } from "@/lib/rateLimitShared";
import { resetRateLimits } from "@/lib/rateLimit";
import { resolveSender, sendEmail } from "@/lib/email";
import { setReposForTests } from "@/lib/paymentRepo";
import { setStripeForTests } from "@/lib/stripeClient";
import { setMailerForTests } from "@/lib/sessionPayments";
import { createMemoryRepos } from "./support/memoryRepos";
import { createMockStripe } from "./support/mockStripe";
import { POST as checkoutPOST } from "@/app/api/session-bookings/checkout/route";
import { POST as withdrawPOST } from "@/app/api/session-bookings/[bookingId]/withdraw-consent/route";
import { POST as optoutPOST } from "@/app/api/claim/optout/route";

const APP = "https://orive.test";
const OFFERING = "33333333-3333-4333-8333-333333333333";
const FAC_A = "11111111-1111-4111-8111-111111111111";
const SQL = fs.readFileSync("supabase/migrations/20261029000000_compliance_step5.sql", "utf8");
const PRIVACY = fs.readFileSync("src/views/Datenschutz.tsx", "utf8");
const req = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json", origin: APP, "x-forwarded-for": `10.1.0.${Math.floor(Math.random() * 250)}`, ...headers }, body: JSON.stringify(body) });

describe("(c) Löschfristen: SQL == retention.ts == Datenschutz", () => {
  it("every RETENTION key has a matching marker in the migration", () => {
    for (const [k, v] of Object.entries(RETENTION)) expect(SQL, k).toContain(`RETENTION:${k}=${v}`);
  });
  it("SQL intervals next to markers use the same numbers", () => {
    const pairs = [...SQL.matchAll(/RETENTION:(\w+)=(\d+)[^\n]*\n(?:[^\n]*\n){0,4}?[^\n]*interval '(\d+) (days|years|hours)'/g)];
    expect(pairs.length).toBeGreaterThanOrEqual(7);
    for (const m of pairs) expect(m[3], m[1]).toBe(m[2]);
  });
  it("privacy notice renders the values from retention.ts (no hard-coded numbers)", () => {
    for (const k of ["hold_minutes", "unpaid_booking_days", "stale_pending_days", "anonymise_after_session_days", "accounting_years", "stripe_events_days", "unclaimed_draft_days", "claim_token_days", "rate_limit_hours"])
      expect(PRIVACY, k).toContain(`R.${k}`);
    expect(PRIVACY).toContain("Resend");
    expect(PRIVACY).toContain("Art. 14");
    expect(PRIVACY).toContain("Cloudflare");
    expect(PRIVACY).toContain('id="gesundheitsdaten"');
  });
  it("pg_cron jobs are scheduled", () => {
    expect(SQL).toContain("cron.schedule('orive-expire-holds'");
    expect(SQL).toContain("cron.schedule('orive-compliance-retention'");
  });
});

describe("(a) Art. 9 consent", () => {
  it("texts in DE/EN mention explicit, withdrawable, deletion", () => {
    expect(HEALTH_CONSENT_TEXT.de).toMatch(/ausdrücklich.*widerrufen/s);
    expect(HEALTH_CONSENT_TEXT.en).toMatch(/explicitly.*withdraw/s);
    expect(HEALTH_CONSENT_TEXT.de).toContain(`${RETENTION.anonymise_after_session_days} Tage`);
    expect(consentTextHash("de")).not.toBe(consentTextHash("en"));
  });
  it("only accepts the current structured consent", () => {
    expect(parseHealthConsent(true)).toBeNull();
    expect(parseHealthConsent({ granted: true, version: "old", lang: "de" })).toBeNull();
    expect(parseHealthConsent({ granted: false, version: HEALTH_CONSENT_VERSION, lang: "de" })).toBeNull();
    expect(parseHealthConsent({ granted: true, version: HEALTH_CONSENT_VERSION, lang: "en" })).toEqual({ granted: true, version: HEALTH_CONSENT_VERSION, lang: "en" });
  });
});

describe("(a)+(b) checkout API", () => {
  let repos: ReturnType<typeof createMemoryRepos>;
  const records: ConsentRecord[] = [];
  const withdrawn: string[] = [];
  beforeEach(() => {
    repos = createMemoryRepos([{ id: OFFERING, facilitatorId: FAC_A, priceEuro: 50, durationMin: 60 }], () => Date.now());
    setReposForTests({ sessions: repos.sessions, payouts: repos.payouts, events: repos.events });
    setStripeForTests(createMockStripe().client);
    setMailerForTests(async () => {});
    records.length = 0; withdrawn.length = 0;
    setConsentStoreForTests({ async insert(r) { records.push(r); }, async withdraw(id) { withdrawn.push(id); return true; } });
    resetRateLimits();
  });
  afterEach(() => { setReposForTests(null); setStripeForTests(undefined); setMailerForTests(null); setConsentStoreForTests(null); setSharedRateLimitForTests(null); delete process.env.TURNSTILE_SECRET_KEY; vi.unstubAllGlobals(); });
  const base = { offeringId: OFFERING, startAt: new Date(Date.now() + 3 * 86400_000).toISOString().replace(/:\d\d\.\d+Z$/, ":00.000Z"), customerName: "Gast Test", customerEmail: "g@example.de" };

  it("intake without explicit consent -> 400; legacy boolean no longer enough", async () => {
    const r1 = await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, { ...base, intake: [{ q: "x", a: "y" }] }));
    expect(r1.status).toBe(400);
    const r2 = await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, { ...base, intake: [{ q: "x", a: "y" }], healthDataConsent: true }));
    expect(r2.status).toBe(400);
    expect(records).toHaveLength(0);
  });
  it("with consent -> booking + consent record (hash, version, no health data)", async () => {
    const r = await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, { ...base, intake: [{ q: "Beschwerden", a: "Rücken" }], healthConsent: { granted: true, version: HEALTH_CONSENT_VERSION, lang: "de" } }));
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ session_booking_id: body.bookingId, purpose: "health_data_art9", text_version: HEALTH_CONSENT_VERSION, lang: "de", text_sha256: consentTextHash("de") });
    expect(JSON.stringify(records[0])).not.toContain("Rücken");
    const w = await withdrawPOST(req(`${APP}/api/session-bookings/${body.bookingId}/withdraw-consent?t=${encodeURIComponent(body.token)}`, {}), { params: { bookingId: body.bookingId } });
    expect(w.status).toBe(200);
    expect(withdrawn).toEqual([body.bookingId]);
    const bad = await withdrawPOST(req(`${APP}/api/session-bookings/${body.bookingId}/withdraw-consent?t=nope`, {}), { params: { bookingId: body.bookingId } });
    expect(bad.status).toBe(404);
  });
  it("Turnstile enforced when configured (server-side siteverify)", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    const calls: any[] = [];
    vi.stubGlobal("fetch", async (url: string, init: any) => { calls.push({ url, body: String(init.body) }); return new Response(JSON.stringify({ success: String(init.body).includes("response=good-token-123"), action: "booking" })); });
    expect((await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, base))).status).toBe(403);
    expect((await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, { ...base, turnstileToken: "bad-token-123" }))).status).toBe(403);
    expect((await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, { ...base, turnstileToken: "good-token-123" }))).status).toBe(200);
    expect(calls[0].url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(calls[0].body).toContain("secret=");
    expect((await optoutPOST(req(`${APP}/api/claim/optout`, { token: "x" }))).status).toBe(403);
  });
  it("shared rate limit blocks across instances", async () => {
    const counts = new Map<string, number>();
    setSharedRateLimitForTests(async (k, limit) => { const n = (counts.get(k) || 0) + 1; counts.set(k, n); return n <= limit; });
    const ip = { "x-forwarded-for": "203.0.113.9" };
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) { resetRateLimits(); codes.push((await checkoutPOST(req(`${APP}/api/session-bookings/checkout`, base, ip))).status); }
    expect(codes.slice(0, 5).every((c) => c !== 429)).toBe(true);
    expect(codes[5]).toBe(429);
    expect([...counts.keys()][0]).toBe(hashKey("session-checkout:203.0.113.9"));
    expect([...counts.keys()][0]).not.toContain("203.0.113.9");
  });
});

describe("(b) turnstile + rate limit units", () => {
  afterEach(() => { delete process.env.TURNSTILE_SECRET_KEY; vi.unstubAllEnvs(); setSharedRateLimitForTests(null); });
  it("fail-closed in production without secret, skipped in test", async () => {
    expect(await verifyTurnstile("")).toEqual({ ok: true, skipped: true });
    vi.stubEnv("VERCEL_ENV", "production");
    expect(await verifyTurnstile("abc")).toEqual({ ok: false, reason: "not_configured" });
  });
  it("network error -> fail closed", async () => {
    process.env.TURNSTILE_SECRET_KEY = "s";
    expect(await verifyTurnstile("tok-1234567890", { fetchImpl: async () => { throw new Error("down"); } })).toEqual({ ok: false, reason: "unreachable" });
    expect(await verifyTurnstile("tok-1234567890", { action: "claim", fetchImpl: async () => new Response(JSON.stringify({ success: true, action: "booking" })) })).toEqual({ ok: false, reason: "invalid" });
  });
  it("shared limiter fails open on DB error but keeps local limit", async () => {
    resetRateLimits();
    setSharedRateLimitForTests(async () => { throw new Error("db"); });
    const r: boolean[] = [];
    for (let i = 0; i < 4; i++) r.push(await rateLimitShared("k:1", 3, 60_000));
    expect(r).toEqual([true, true, true, false]);
  });
});

describe("(d) sender domain", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("only Orive's own domain", () => {
    vi.stubEnv("EMAIL_FROM", "ORIVE <hello@mail.orive.co>");
    expect(resolveSender()).toMatchObject({ ok: true, domain: "mail.orive.co" });
    expect(resolveSender("ORIVE <onboarding@resend.dev>").ok).toBe(false);
    expect(resolveSender("x@evil-orive.co").ok).toBe(false);
    expect(resolveSender("x@orive.co").ok).toBe(true);
    vi.stubEnv("EMAIL_FROM", "");
    expect(resolveSender().ok).toBe(false);
  });
  it("refuses a real send with sandbox sender", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_live_xxxxxxxx");
    vi.stubEnv("EMAIL_FROM", "ORIVE <onboarding@resend.dev>");
    const f = vi.fn(); vi.stubGlobal("fetch", f);
    const r = await sendEmail({ to: "a@example.de", subject: "s", html: "h" });
    expect(r).toMatchObject({ success: false, error: "sender_not_configured" });
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
