import fs from "fs";
import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (req: Request) =>
    req.headers.get("authorization") === "Bearer fac-jwt"
      ? { id: "fac-host-example-de", email: "host@example.de", name: "Host", userId: "44444444-4444-4444-8444-444444444444" }
      : null,
}));

import { setReposForTests } from "@/lib/paymentRepo";
import { setStripeForTests } from "@/lib/stripeClient";
import { createBookingToken, verifyBookingToken } from "@/lib/bookingToken";
import { allowStripeSimulation } from "@/lib/payments";
import { formationTotalCents } from "@/lib/formationPricing";
import { createMemoryRepos } from "./support/memoryRepos";
import { createMockStripe } from "./support/mockStripe";
import { GET as legacyBookingGET } from "@/app/api/booking/[bookingId]/route";
import { POST as legacyCancelPOST } from "@/app/api/booking/[bookingId]/cancel/route";
import { GET as cronGET } from "@/app/api/cron/settle/route";
import { GET as connectGET, POST as connectPOST } from "@/app/api/facilitator/connect/route";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";
import { POST as formationPOST } from "@/app/api/create-stripe-checkout/route";
import { GET as sessionPassGET } from "@/app/api/session-bookings/[bookingId]/route";

const APP = "https://orive.test";
const BOOKING_ID = "book-legacy-1";
let stripe: ReturnType<typeof createMockStripe>;

function seedLegacyStore() {
  const start = new Date(Date.now() + 5 * 86400_000).toISOString();
  fs.writeFileSync(process.env.ORIVE_STORE_FILE as string, JSON.stringify({
    offerings: [], slots: [], intakeForms: [],
    bookings: [{
      id: BOOKING_ID, offeringId: "o1", slotId: "s1", sessionTitle: "Atem", facilitatorName: "Host", facilitatorEmail: "host@example.de",
      customerName: "Gast Geheim", customerEmail: "gast@example.de", startAt: start, priceCents: 8000, feeCents: 100, currency: "eur",
      location: null, status: "reserved", paymentStatus: "card_saved", createdAt: new Date().toISOString(), spotHeld: true,
    }],
  }));
}

beforeEach(async () => {
  seedLegacyStore();
  vi.resetModules();
  const repos = createMemoryRepos([]);
  setReposForTests({ sessions: repos.sessions, payouts: repos.payouts, events: repos.events });
  stripe = createMockStripe();
  setStripeForTests(stripe.client);
});
afterEach(() => {
  setReposForTests(null);
  setStripeForTests(undefined);
});

describe("S2 – Buchungsdaten nur mit Token", () => {
  it("ohne/mit falschem Token 404, mit Token 200 (ohne Facilitator-E-Mail)", async () => {
    const bare = await legacyBookingGET(new Request(`${APP}/api/booking/${BOOKING_ID}`), { params: { bookingId: BOOKING_ID } });
    expect(bare.status).toBe(404);
    expect(JSON.stringify(await bare.json())).not.toContain("gast@example.de");
    const wrong = createBookingToken("other-id");
    expect((await legacyBookingGET(new Request(`${APP}/api/booking/${BOOKING_ID}?t=${wrong}`), { params: { bookingId: BOOKING_ID } })).status).toBe(404);
    const t = createBookingToken(BOOKING_ID);
    const ok = await legacyBookingGET(new Request(`${APP}/api/booking/${BOOKING_ID}?t=${t}`), { params: { bookingId: BOOKING_ID } });
    expect(ok.status).toBe(200);
    const body = await ok.json();
    expect(body.booking.clientEmail).toBe("gast@example.de");
    expect(body.booking.facilitatorEmail).toBeUndefined();
    const fac = await legacyBookingGET(new Request(`${APP}/api/booking/${BOOKING_ID}`, { headers: { authorization: "Bearer fac-jwt" } }), { params: { bookingId: BOOKING_ID } });
    expect(fac.status).toBe(200);
  });
  it("Token: abgelaufen / manipuliert wird abgelehnt", () => {
    const t = createBookingToken("b1", 1000, Date.now() - 5000);
    expect(verifyBookingToken(t, "b1")).toBe(false);
    const good = createBookingToken("b1");
    expect(verifyBookingToken(good.slice(0, -2) + "xx", "b1")).toBe(false);
    expect(verifyBookingToken(good, "b1")).toBe(true);
  });
  it("Session-Booking-Pass ohne Token 404", async () => {
    const res = await sessionPassGET(new Request(`${APP}/api/session-bookings/x`), { params: { bookingId: "x" } });
    expect(res.status).toBe(404);
  });
});

describe("S3 – Cron fail-closed", () => {
  it("ohne Header 401, falsches Secret 401, ohne CRON_SECRET 503", async () => {
    expect((await cronGET(new Request(`${APP}/api/cron/settle`))).status).toBe(401);
    expect((await cronGET(new Request(`${APP}/api/cron/settle`, { headers: { authorization: "Bearer nope" } }))).status).toBe(401);
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    expect((await cronGET(new Request(`${APP}/api/cron/settle`))).status).toBe(503);
    process.env.CRON_SECRET = saved;
  });
});

describe("S8 – Connect nur für eingeloggte Facilitatoren", () => {
  it("GET/POST ohne JWT 401; E-Mail-Fallback existiert nicht mehr; fremde Origin 403", async () => {
    expect((await connectGET(new Request(`${APP}/api/facilitator/connect?facilitatorId=fac-host-example-de`))).status).toBe(401);
    const anon = await connectPOST(new Request(`${APP}/api/facilitator/connect`, { method: "POST", headers: { origin: APP }, body: JSON.stringify({ facilitatorId: "fac-host-example-de", email: "host@example.de" }) }));
    expect(anon.status).toBe(401);
    expect(stripe.calls.filter((c) => c.method.startsWith("account"))).toHaveLength(0);
    const evil = await connectPOST(new Request(`${APP}/api/facilitator/connect`, { method: "POST", headers: { origin: "https://evil.example", authorization: "Bearer fac-jwt" } }));
    expect(evil.status).toBe(403);
    const ok = await connectPOST(new Request(`${APP}/api/facilitator/connect`, { method: "POST", headers: { origin: APP, authorization: "Bearer fac-jwt" } }));
    expect(ok.status).toBe(200);
    // second call reuses the stored account (DB, not JSON file)
    await connectPOST(new Request(`${APP}/api/facilitator/connect`, { method: "POST", headers: { origin: APP, authorization: "Bearer fac-jwt" } }));
    expect(stripe.calls.filter((c) => c.method === "accounts.create")).toHaveLength(1);
    const status = await connectGET(new Request(`${APP}/api/facilitator/connect`, { headers: { authorization: "Bearer fac-jwt" } }));
    expect(await status.json()).toMatchObject({ ready: true, chargesEnabled: true });
  });
});

describe("S9 – Legacy-Gast-Storno nur mit Token, keine Sofortabbuchung", () => {
  it("E-Mail allein reicht nicht", async () => {
    const res = await legacyCancelPOST(new Request(`${APP}/api/booking/${BOOKING_ID}/cancel`, { method: "POST", headers: { origin: APP }, body: JSON.stringify({ email: "gast@example.de" }) }), { params: { bookingId: BOOKING_ID } });
    expect(res.status).toBe(404);
    const t = createBookingToken(BOOKING_ID);
    const ok = await legacyCancelPOST(new Request(`${APP}/api/booking/${BOOKING_ID}/cancel?t=${t}`, { method: "POST", headers: { origin: APP }, body: "{}" }), { params: { bookingId: BOOKING_ID } });
    expect(ok.status).toBe(200);
    expect(stripe.charged).toHaveLength(0);
  });
});

describe("S5/S6 – Webhook", () => {
  it("unsigniert 400 (auch mit ALLOW_STRIPE_SIMULATION auf Vercel-Preview), falsche Signatur 400", async () => {
    const payload = JSON.stringify({ id: "evt_x", type: "checkout.session.completed", data: { object: { metadata: { bookingId: BOOKING_ID } } } });
    expect((await webhookPOST(new Request(`${APP}/api/stripe/webhook`, { method: "POST", body: payload }))).status).toBe(400);
    process.env.ALLOW_STRIPE_SIMULATION = "true";
    process.env.VERCEL_ENV = "preview";
    expect(allowStripeSimulation()).toBe(false);
    delete process.env.VERCEL_ENV;
    delete process.env.ALLOW_STRIPE_SIMULATION;
    const bad = await webhookPOST(new Request(`${APP}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": "t=1,v1=deadbeef" }, body: payload }));
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ error: "Invalid signature." }); // S13: no internals
  });
  it("Verarbeitungsfehler gibt Event-Claim frei (Stripe-Retry wird verarbeitet)", async () => {
    const signer = new Stripe("sk_test_x", { apiVersion: "2024-06-20" as any });
    const repos = createMemoryRepos([]);
    repos.payouts.updateFlagsByStripeAccount = async () => { throw new Error("db down"); };
    setReposForTests({ sessions: repos.sessions, payouts: repos.payouts, events: repos.events });
    const payload = JSON.stringify({ id: "evt_fail", object: "event", type: "account.updated", data: { object: { id: "acct_1" } } });
    const header = signer.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET as string });
    const res = await webhookPOST(new Request(`${APP}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": header }, body: payload }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Processing failed." });
    expect(repos.eventRows.has("evt_fail")).toBe(false);
  });
});

describe("S7 – Formation-Preis serverseitig", () => {
  it("Client-Betrag wird ignoriert", async () => {
    const res = await formationPOST(new Request(`${APP}/api/create-stripe-checkout`, {
      method: "POST", headers: { origin: APP, "x-forwarded-for": "9.9.9.9" },
      body: JSON.stringify({ companyName: "ACME", tier: "premium", amount: 0.01, founderEmail: "f@example.de", founderName: "F", addons: { eucc: true, bogus: true } }),
    }));
    expect(res.status).toBe(200);
    const call = stripe.calls.find((c) => c.method === "checkout.sessions.create")!;
    expect(call.params.line_items[0].price_data.unit_amount).toBe(formationTotalCents({ tier: "premium", addons: { eucc: true } }));
    expect(call.params.line_items[0].price_data.unit_amount).toBe((999 + 149 + Math.round(1148 * 0.19)) * 100);
    expect(JSON.stringify(call.params.metadata)).not.toMatch(/ACME|F"/);
    const bad = await formationPOST(new Request(`${APP}/api/create-stripe-checkout`, { method: "POST", headers: { origin: APP, "x-forwarded-for": "9.9.9.8" }, body: JSON.stringify({ companyName: "X", tier: "gold", founderEmail: "f@example.de" }) }));
    expect(bad.status).toBe(400);
  });
});
