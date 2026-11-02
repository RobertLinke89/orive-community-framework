import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (req: Request) => {
    const auth = req.headers.get("authorization") || "";
    if (auth === "Bearer fac-a-jwt") return { id: "fac-anna-example-de", email: "anna@example.de", name: "Anna", userId: FAC_A };
    if (auth === "Bearer fac-b-jwt") return { id: "fac-ben-example-de", email: "ben@example.de", name: "Ben", userId: FAC_B };
    return null;
  },
}));

const FAC_A = "11111111-1111-4111-8111-111111111111";
const FAC_B = "22222222-2222-4222-8222-222222222222";
const OFFERING = "33333333-3333-4333-8333-333333333333";

import { setReposForTests } from "@/lib/paymentRepo";
import { setStripeForTests } from "@/lib/stripeClient";
import { setMailerForTests } from "@/lib/sessionPayments";
import { resetRateLimits } from "@/lib/rateLimit";
import { decryptField } from "@/lib/fieldCrypto";
import { createMemoryRepos } from "./support/memoryRepos";
import { createMockStripe } from "./support/mockStripe";
import { POST as checkoutPOST } from "@/app/api/session-bookings/checkout/route";
import { GET as passGET } from "@/app/api/session-bookings/[bookingId]/route";
import { POST as guestCancelPOST } from "@/app/api/session-bookings/[bookingId]/cancel/route";
import { PATCH as decisionPATCH } from "@/app/api/facilitator/session-bookings/[bookingId]/route";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";
import { GET as cronGET } from "@/app/api/cron/settle/route";
import { GET as connectGET, POST as connectPOST } from "@/app/api/facilitator/connect/route";

const APP = "https://orive.test";
let now = Date.parse("2026-11-02T08:00:00Z");
const clock = () => now;
let repos: ReturnType<typeof createMemoryRepos>;
let stripe: ReturnType<typeof createMockStripe>;
const mails: Array<{ to: string; subject: string }> = [];
const signer = new Stripe("sk_test_signing_only", { apiVersion: "2024-06-20" as any });

function json(url: string, body: unknown, headers: Record<string, string> = {}, method = "POST") {
  return new Request(url, { method, headers: { "content-type": "application/json", origin: APP, ...headers }, body: JSON.stringify(body) });
}

function signedEvent(type: string, object: Record<string, unknown>, id = `evt_${Math.random().toString(36).slice(2)}`) {
  const payload = JSON.stringify({ id, object: "event", type, data: { object } });
  // signed at send time (Stripe rejects signatures older than 5 min)
  return () => {
    const header = signer.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET as string, timestamp: Math.floor(Date.now() / 1000) });
    return new Request(`${APP}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": header }, body: payload });
  };
}

const SLOT = "2026-11-05T09:00:00.000Z"; // session 09:00-10:00 UTC

async function book(email = "gast@example.de", startAt = SLOT) {
  const res = await checkoutPOST(json(`${APP}/api/session-bookings/checkout`, { offeringId: OFFERING, startAt, customerName: "Gast Test", customerEmail: email }, { "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` }));
  return { res, body: await res.json() };
}

async function completeSetup(bookingId: string) {
  const row = repos.rows.get(bookingId)!;
  const send = signedEvent("checkout.session.completed", {
    id: row.stripe_checkout_session_id, object: "checkout.session", mode: "setup", status: "complete",
    setup_intent: "seti_test_1", metadata: { bookingId, type: "orive_session_setup" },
  });
  return send;
}

beforeEach(() => {
  now = Date.parse("2026-11-02T08:00:00Z");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  repos = createMemoryRepos([{ id: OFFERING, facilitatorId: FAC_A, priceEuro: 80.5, durationMin: 60 }], clock);
  setReposForTests({ sessions: repos.sessions, payouts: repos.payouts, events: repos.events });
  stripe = createMockStripe();
  setStripeForTests(stripe.client);
  mails.length = 0;
  setMailerForTests(async (to, subject) => { mails.push({ to, subject }); });
  resetRateLimits();
});
afterEach(() => {
  vi.useRealTimers();
  setReposForTests(null);
  setStripeForTests(undefined);
  setMailerForTests(null);
});

function setNow(iso: string) {
  now = Date.parse(iso);
  vi.setSystemTime(now);
}

describe("Kunde: Buchung -> Setup-Checkout -> Webhook -> Bestätigung -> Abrechnung -> Erstattung", () => {
  it("läuft komplett im Testmodus durch", async () => {
    // Connect onboarding of facilitator A (auth required)
    const onboard = await connectPOST(json(`${APP}/api/facilitator/connect`, {}, { authorization: "Bearer fac-a-jwt" }));
    expect(onboard.status).toBe(200);
    expect((await onboard.json()).url).toMatch(/^https:\/\/connect\.stripe\.test\/acct_test_/);
    const accountCall = stripe.calls.find((c) => c.method === "accountLinks.create")!;
    expect(accountCall.params.return_url).toBe(`${APP}/dezk/start?connect=return`);

    // 1. booking -> setup checkout (server price, fee, 35-min hold)
    const { res, body } = await book();
    expect(res.status).toBe(200);
    expect(body.url).toMatch(/checkout\.stripe\.test/);
    const row = repos.rows.get(body.bookingId)!;
    expect(row.price_amount).toBe(80.5);
    expect(row.platform_fee_amount).toBe(1);
    expect(Date.parse(row.hold_expires_at!) - now).toBe(35 * 60_000);
    const cs = stripe.calls.find((c) => c.method === "checkout.sessions.create")!;
    expect(cs.params.mode).toBe("setup");
    expect(cs.params.metadata).toEqual({ bookingId: body.bookingId, type: "orive_session_setup" }); // D3: ids only
    expect(cs.idempotencyKey).toBe(`session-setup-${body.bookingId}`);
    expect(cs.params.success_url).toContain(`?t=`);

    // same slot is blocked for a second guest while the hold is active
    const second = await book("zweite@example.de");
    expect(second.res.status).toBe(409);

    // Confirm before the card is saved -> refused
    const early = await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    expect(early.status).toBe(409);

    // 2. signed webhook + replayed duplicate
    const send = await completeSetup(body.bookingId);
    const first = await webhookPOST(send());
    expect(first.status).toBe(200);
    expect((await first.json()).outcome).toBe("card_saved");
    const replay = await webhookPOST(send());
    expect(await replay.json()).toMatchObject({ received: true, duplicate: true });
    expect(mails.filter((m) => m.subject === "Termin angefragt")).toHaveLength(1);
    expect(repos.rows.get(body.bookingId)!.payment_status).toBe("card_saved");
    expect(repos.rows.get(body.bookingId)!.hold_expires_at).toBeNull();

    // 3. facilitator confirm: blocked until Connect charges_enabled, then OK (via account.updated webhook)
    const blocked = await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    expect(blocked.status).toBe(409);
    const acct = [...repos.payoutRows.values()][0].stripe_account_id!;
    const upd = await webhookPOST(signedEvent("account.updated", { id: acct, object: "account", charges_enabled: true, payouts_enabled: true, details_submitted: true })());
    expect((await upd.json()).outcome).toBe("account_updated");
    const other = await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-b-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    expect(other.status).toBe(404); // not B's booking
    const ok = await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    expect(ok.status).toBe(200);
    expect(repos.rows.get(body.bookingId)!.status).toBe("confirmed");

    // booking pass with token (customer view)
    const pass = await passGET(new Request(`${APP}/api/session-bookings/${body.bookingId}?t=${body.token}`), { params: { bookingId: body.bookingId } });
    const passBody = await pass.json();
    expect(passBody.booking).toMatchObject({ status: "confirmed", paymentStatus: "card_saved", totalCents: 8150, feeCents: 100 });

    // 4. cron before session end -> nothing charged; after end -> destination charge with fee
    const cronAuth = { authorization: `Bearer ${process.env.CRON_SECRET}` };
    await cronGET(new Request(`${APP}/api/cron/settle`, { headers: cronAuth }));
    expect(stripe.charged).toHaveLength(0);
    setNow("2026-11-05T10:05:00Z");
    const [c1, c2] = await Promise.all([
      cronGET(new Request(`${APP}/api/cron/settle`, { headers: cronAuth })),
      cronGET(new Request(`${APP}/api/cron/settle`, { headers: cronAuth })),
    ]);
    expect(c1.status).toBe(200);
    expect(c2.status).toBe(200);
    expect(stripe.charged).toHaveLength(1); // concurrent crons -> exactly one charge
    const charge = stripe.calls.find((c) => c.method === "paymentIntents.create")!;
    expect(charge.params).toMatchObject({ amount: 8150, currency: "eur", application_fee_amount: 100, transfer_data: { destination: acct }, off_session: true, confirm: true });
    expect(charge.idempotencyKey).toBe(`session-settle-${body.bookingId}-a1`);
    expect(repos.rows.get(body.bookingId)!.payment_status).toBe("paid");
    await cronGET(new Request(`${APP}/api/cron/settle`, { headers: cronAuth }));
    expect(stripe.charged).toHaveLength(1); // re-run: no double charge

    // payment_intent.succeeded replay is harmless
    const pi = repos.rows.get(body.bookingId)!.stripe_payment_intent_id!;
    const piEvt = signedEvent("payment_intent.succeeded", { id: pi, object: "payment_intent", metadata: { bookingId: body.bookingId, type: "orive_session_charge" } });
    expect((await (await webhookPOST(piEvt())).json()).outcome).toBe("noop");

    // 5. facilitator cancels after charge -> refund with reverse_transfer + refund_application_fee
    const cancel = await decisionPATCH(json(`${APP}/x`, { action: "cancel" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    expect(cancel.status).toBe(200);
    expect((await cancel.json()).refunded).toBe(true);
    const refund = stripe.calls.find((c) => c.method === "refunds.create")!;
    expect(refund.params).toMatchObject({ payment_intent: pi, reverse_transfer: true, refund_application_fee: true });
    expect(refund.idempotencyKey).toBe(`session-refund-${body.bookingId}`);
    expect(repos.rows.get(body.bookingId)!).toMatchObject({ payment_status: "refunded", payout_status: "reversed", status: "cancelled" });

    // charge.refunded webhook keeps state consistent (idempotent)
    const refEvt = signedEvent("charge.refunded", { id: "ch_test_1", object: "charge", payment_intent: pi, refunded: true });
    expect((await (await webhookPOST(refEvt())).json()).outcome).toBe("refunded");
  });

  it("Hold läuft ab: unbezahlte Reservierung gibt den Slot frei; späte Kartenspeicherung wird zurückgerollt", async () => {
    const { body } = await book();
    const send = await completeSetup(body.bookingId);
    setNow("2026-11-02T08:36:00Z"); // 36 min later
    const res = await cronGET(new Request(`${APP}/api/cron/settle`, { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }));
    expect((await res.json()).expiredHolds).toBe(1);
    expect(repos.rows.get(body.bookingId)!).toMatchObject({ status: "expired", payment_status: "released" });
    // slot bookable again
    const again = await book("neu@example.de");
    expect(again.res.status).toBe(200);
    // the late webhook does not resurrect the old booking; card is detached, guest informed
    const late = await webhookPOST(send());
    expect((await late.json()).outcome).toBe("hold_expired");
    expect(stripe.calls.some((c) => c.method === "paymentMethods.detach")).toBe(true);
    expect(mails.some((m) => m.subject.includes("abgelaufen"))).toBe(true);
  });

  it("Webhook-Signatur älter als 5 Minuten (Replay) wird abgelehnt", async () => {
    const { body } = await book();
    const row = repos.rows.get(body.bookingId)!;
    const payload = JSON.stringify({ id: "evt_old", object: "event", type: "checkout.session.expired", data: { object: { id: row.stripe_checkout_session_id, metadata: { bookingId: body.bookingId, type: "orive_session_setup" } } } });
    const header = signer.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET as string, timestamp: Math.floor(Date.now() / 1000) - 600 });
    const res = await webhookPOST(new Request(`${APP}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": header }, body: payload }));
    expect(res.status).toBe(400);
    expect(repos.rows.get(body.bookingId)!.status).toBe("pending");
  });

  it("checkout.session.expired gibt den Hold sofort frei", async () => {
    const { body } = await book();
    const row = repos.rows.get(body.bookingId)!;
    const evt = signedEvent("checkout.session.expired", { id: row.stripe_checkout_session_id, object: "checkout.session", metadata: { bookingId: body.bookingId, type: "orive_session_setup" } });
    expect((await (await webhookPOST(evt())).json()).outcome).toBe("expired");
    expect((await book("x@example.de")).res.status).toBe(200);
  });

  it("Abgelehnte Karte: failed, max. 3 Versuche, neue Idempotency-Keys je Versuch", async () => {
    await connectPOST(json(`${APP}/api/facilitator/connect`, {}, { authorization: "Bearer fac-a-jwt" }));
    for (const a of repos.payoutRows.values()) a.charges_enabled = true;
    const { body } = await book();
    await webhookPOST((await completeSetup(body.bookingId))());
    await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    stripe.state.declineCharges = true;
    setNow("2026-11-05T11:00:00Z");
    const auth = { authorization: `Bearer ${process.env.CRON_SECRET}` };
    for (let i = 0; i < 5; i += 1) await cronGET(new Request(`${APP}/api/cron/settle`, { headers: auth }));
    const attempts = stripe.calls.filter((c) => c.method === "paymentIntents.create");
    expect(attempts.map((c) => c.idempotencyKey)).toEqual([1, 2, 3].map((n) => `session-settle-${body.bookingId}-a${n}`));
    expect(repos.rows.get(body.bookingId)!).toMatchObject({ payment_status: "failed", settle_attempts: 3 });
  });

  it("Rate-Limit + Missbrauchsschutz: max. 3 offene Holds je E-Mail", async () => {
    const slots = ["2026-11-05T09:00:00Z", "2026-11-05T11:00:00Z", "2026-11-05T13:00:00Z", "2026-11-05T15:00:00Z"];
    const results: number[] = [];
    for (const s of slots) results.push((await book("spam@example.de", s)).res.status);
    expect(results).toEqual([200, 200, 200, 429]);
  });

  it("Gesundheitsdaten im Intake nur mit Einwilligung und nur verschlüsselt gespeichert (D1)", async () => {
    const { createSessionCheckout } = await import("@/lib/sessionPayments");
    const noConsent = await createSessionCheckout({ offeringId: OFFERING, startAt: SLOT, customerName: "A B", customerEmail: "a@example.de", intake: [{ q: "Beschwerden", a: "Rücken" }] });
    expect(noConsent.ok).toBe(false);
    const ok = await createSessionCheckout({ offeringId: OFFERING, startAt: SLOT, customerName: "A B", customerEmail: "a@example.de", intake: [{ q: "Beschwerden", a: "Rücken" }], healthDataConsent: true });
    expect(ok.ok).toBe(true);
    const row = repos.rows.get((ok as any).bookingId)!;
    expect(row.intake_ciphertext).toMatch(/^v1\./);
    expect(row.intake_ciphertext).not.toContain("Rücken");
    expect(JSON.parse(decryptField(row.intake_ciphertext!))[0].a).toBe("Rücken");
    expect(row.health_data_consent_at).toBeTruthy();
  });

  it("Gast-Storno: nur mit Token; kostenlos >24h vorher; danach keine Sofortabbuchung", async () => {
    await connectPOST(json(`${APP}/api/facilitator/connect`, {}, { authorization: "Bearer fac-a-jwt" }));
    for (const a of repos.payoutRows.values()) a.charges_enabled = true;
    const { body } = await book();
    await webhookPOST((await completeSetup(body.bookingId))());
    await decisionPATCH(json(`${APP}/x`, { action: "confirm" }, { authorization: "Bearer fac-a-jwt" }, "PATCH"), { params: { bookingId: body.bookingId } });
    const url = `${APP}/api/session-bookings/${body.bookingId}/cancel`;
    const noToken = await guestCancelPOST(json(url, {}), { params: { bookingId: body.bookingId } });
    expect(noToken.status).toBe(404);
    setNow("2026-11-04T12:00:00Z"); // < 24h before
    const late = await guestCancelPOST(json(url, {}, { "x-booking-token": body.token }), { params: { bookingId: body.bookingId } });
    expect(late.status).toBe(409);
    expect(stripe.charged).toHaveLength(0);
  });
});
