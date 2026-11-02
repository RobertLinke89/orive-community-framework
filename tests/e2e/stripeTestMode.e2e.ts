/**
 * End-to-end in Stripe TEST MODE against a local Postgres with both migrations applied.
 * Key: read from STRIPE_TEST_ENV_FILE (default ~/.secrets/orive_stripe_test.env) into process.env only.
 * Never printed or written; all recorded messages are scrubbed. Aborts unless the key is rk_test_/sk_test_.
 * Every created Stripe object gets metadata test_run=tikko.
 */
import fs from "fs";
import os from "os";
import path from "path";
import Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const FAC = "11111111-1111-4111-8111-111111111111";
const OFFERING = "33333333-3333-4333-8333-333333333333";
const APP = "https://orive.test";
const LABEL = { test_run: "tikko" };

vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (req: Request) =>
    req.headers.get("authorization") === "Bearer fac-jwt"
      ? { id: "fac-e2e-facilitator", email: "e2e-facilitator@example.com", name: "E2E Facilitator", userId: FAC }
      : null,
}));

import { scrub } from "@/lib/safeLog";
import { setReposForTests } from "@/lib/paymentRepo";
import { setMailerForTests, settleSessionBooking } from "@/lib/sessionPayments";
import { resetRateLimits } from "@/lib/rateLimit";
import { createPgRepos } from "./pgRepos";

type Rec = { step: string; status: "pass" | "fail" | "denied" | "skipped" | "note"; detail?: string; permission?: string };
const results: Rec[] = [];
const created: { type: string; id: string }[] = [];
let stripe: Stripe;
let pg: Awaited<ReturnType<typeof createPgRepos>>;
const mails: string[] = [];

function permissionOf(e: any): string | undefined {
  const m = String(e?.raw?.message || e?.message || "");
  // Stripe: "...does not have the required permissions for this endpoint ... Having the 'rak_xxx_write' permission would allow..."
  const hit = m.match(/Enabling (.+?) \('([a-z_]+)'\)/);
  if (hit) return `${hit[1].trim()} (${hit[2]})`;
  if (/not available for use by restricted keys/.test(m)) return "nicht per Restricted Key verfügbar (laut Stripe-Meldung)";
  if (e?.code === "account_invalid") return "inconclusive: account_invalid (Probe-Konto existiert nicht)";
  return undefined;
}

async function step<T>(name: string, fn: () => Promise<T>): Promise<T | undefined> {
  try {
    const v = await fn();
    results.push({ step: name, status: "pass" });
    return v;
  } catch (e: any) {
    const denied = e?.type === "StripePermissionError" || e?.statusCode === 403 || /required permissions/i.test(String(e?.message));
    results.push({ step: name, status: denied ? "denied" : "fail", permission: denied ? permissionOf(e) : undefined, detail: scrub(`${e?.type || ""} ${e?.code || ""} ${e?.message || e}`) });
    return undefined;
  }
}
const note = (step: string, detail: string) => results.push({ step, status: "note", detail: scrub(detail) });
const track = (type: string, id?: string | null) => { if (id) created.push({ type, id }); };

function signed(type: string, object: unknown, id = `evt_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) {
  const payload = JSON.stringify({ id, object: "event", type, data: { object } });
  return () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET as string });
    return new Request(`${APP}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": header }, body: payload });
  };
}

beforeAll(async () => {
  const file = process.env.STRIPE_TEST_ENV_FILE || path.join(os.homedir(), ".secrets/orive_stripe_test.env");
  const line = fs.readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("STRIPE_SECRET_KEY="));
  const key = (line || "").slice("STRIPE_SECRET_KEY=".length).trim().replace(/^["']|["']$/g, "");
  if (!/^(rk|sk)_test_/.test(key)) throw new Error("ABORT: key is not a TEST key (rk_test_/sk_test_).");
  process.env.STRIPE_SECRET_KEY = key;
  stripe = new Stripe(key, { apiVersion: "2024-06-20" as any });
  pg = await createPgRepos(process.env.E2E_PG_URL || "postgresql://postgres@%2Ftmp:54329/orive_e2e");
  setReposForTests({ sessions: pg.sessions, payouts: pg.payouts, events: pg.events });
  setMailerForTests(async (_to, subject) => { mails.push(subject); });
  resetRateLimits();
});

afterAll(async () => {
  // label + clean up test objects
  for (const o of created) {
    await step(`cleanup ${o.type} ${o.id.slice(0, 8)}…`, async () => {
      if (o.type === "customer") return stripe.customers.del(o.id);
      if (o.type === "account") return stripe.accounts.del(o.id);
      return null;
    });
  }
  delete process.env.STRIPE_SECRET_KEY;
  await pg?.db.end();
  const out = { run_at: new Date().toISOString(), mode: "stripe_test_mode", results, created: created.map((c) => ({ type: c.type, id: c.id })), mails };
  const text = JSON.stringify(out, null, 2);
  if (/(sk|rk)_(test|live)_[A-Za-z0-9]{6,}/.test(text)) throw new Error("refusing to write: key-like string in output");
  fs.writeFileSync(path.join(__dirname, "RESULT-e2e.json"), text);
});

/**
 * Permission probe without side effects: each write is sent with a deliberately invalid parameter.
 * 403 = key lacks the permission; 400/404 = permission present (request rejected only by validation).
 */
const PROBES: Array<[string, () => Promise<unknown>]> = [
  ["customers.create", () => stripe.customers.create({ email: "not-an-email" } as any)],
  ["customers.del", () => stripe.customers.del("cus_doesnotexist_probe")],
  ["checkout.sessions.create", () => stripe.checkout.sessions.create({ mode: "setup" } as any)],
  ["checkout.sessions.retrieve", () => stripe.checkout.sessions.retrieve("cs_test_doesnotexist")],
  ["setupIntents.create", () => stripe.setupIntents.create({ usage: "invalid" } as any)],
  ["setupIntents.retrieve", () => stripe.setupIntents.retrieve("seti_doesnotexist")],
  ["paymentMethods.attach", () => stripe.paymentMethods.attach("pm_card_visa", { customer: "cus_doesnotexist_probe" })],
  ["paymentMethods.detach", () => stripe.paymentMethods.detach("pm_doesnotexist")],
  ["paymentIntents.create", () => stripe.paymentIntents.create({ amount: -1, currency: "eur" })],
  ["paymentIntents.retrieve", () => stripe.paymentIntents.retrieve("pi_doesnotexist")],
  ["refunds.create", () => stripe.refunds.create({ payment_intent: "pi_doesnotexist" })],
  ["refunds.list", () => stripe.refunds.list({ limit: 1 })],
  ["charges.retrieve", () => stripe.charges.retrieve("ch_doesnotexist")],
  ["applicationFees.list", () => stripe.applicationFees.list({ limit: 1 })],
  ["transfers.list", () => stripe.transfers.list({ limit: 1 })],
  ["accounts.create", () => stripe.accounts.create({ type: "invalid" } as any)],
  ["accounts.retrieve(connected)", () => stripe.accounts.retrieve("acct_doesnotexist0")],
  ["accounts.del", () => stripe.accounts.del("acct_doesnotexist0")],
  ["accountLinks.create", () => stripe.accountLinks.create({ account: "acct_doesnotexist0", type: "account_onboarding" } as any)],
  ["webhookEndpoints.list (für stripe listen/Produktion)", () => stripe.webhookEndpoints.list({ limit: 1 })],
];

describe("Stripe Testmodus E2E", () => {
  it("0. Berechtigungs-Probe (ohne Seiteneffekte)", async () => {
    for (const [name, fn] of PROBES) {
      try {
        await fn();
        results.push({ step: `probe ${name}`, status: "pass", detail: "erlaubt (unerwartet erfolgreich)" });
      } catch (e: any) {
        if (e?.type === "StripePermissionError" || e?.statusCode === 403) {
          results.push({ step: `probe ${name}`, status: "denied", permission: permissionOf(e) });
        } else {
          results.push({ step: `probe ${name}`, status: "pass", detail: `erlaubt (Validierung: ${e?.statusCode} ${e?.code || ""})` });
        }
      }
    }
  });

  let connectAccount: string | undefined;
  let bookingA: { id: string; token: string } | undefined;
  let customerA: string | undefined;

  it("1. Connect Express: Konto + Account-Link über die echte Route", async () => {
    const { POST, GET } = await import("@/app/api/facilitator/connect/route");
    const res = await step("connect POST (accounts.create express + accountLinks.create)", async () => {
      const r = await POST(new Request(`${APP}/api/facilitator/connect`, { method: "POST", headers: { origin: APP, authorization: "Bearer fac-jwt" } }));
      const b = await r.json();
      if (r.status !== 200 || !String(b.url).startsWith("https://connect.stripe.com/")) throw new Error(`status ${r.status}: ${b.error || ""}`);
      return b.url as string;
    });
    const acc = await pg.payouts.getByUserId(FAC);
    track("account", acc?.stripe_account_id);
    if (acc?.stripe_account_id) await step("label express account", () => stripe.accounts.update(acc.stripe_account_id!, { metadata: LABEL }));
    if (res) note("express onboarding", "Account-Link erzeugt; Onboarding (KYC-UI) ist headless nicht abschließbar → charges_enabled bleibt false.");
    await step("connect GET status", async () => {
      const r = await GET(new Request(`${APP}/api/facilitator/connect`, { headers: { authorization: "Bearer fac-jwt" } }));
      const b = await r.json();
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      note("express status", `chargesEnabled=${b.chargesEnabled} payoutsEnabled=${b.payoutsEnabled}`);
    });
  });

  it("2. Connect Custom-Testkonto mit charges_enabled (API-Testdaten) als Ziel", async () => {
    const account = await step("accounts.create custom (DE, Testdaten)", () =>
      stripe.accounts.create({
        type: "custom",
        country: "DE",
        email: "e2e-facilitator@example.com",
        business_type: "individual",
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_profile: { mcc: "8099", url: "https://orive.co", product_description: "Wellbeing sessions (test)" },
        individual: {
          first_name: "Test", last_name: "Facilitator", email: "e2e-facilitator@example.com", phone: "+4915123456789",
          dob: { day: 1, month: 1, year: 1901 },
          address: { line1: "address_full_match", city: "Berlin", postal_code: "10115", country: "DE" },
        },
        external_account: { object: "bank_account", country: "DE", currency: "eur", account_number: "DE89370400440532013000" } as any,
        tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: "127.0.0.1" },
        metadata: LABEL,
      }),
    );
    if (!account) return;
    track("account", account.id);
    let current: Stripe.Account = account;
    for (let i = 0; i < 15 && !current.charges_enabled; i += 1) {
      await new Promise((r) => setTimeout(r, 2000));
      current = (await step(`accounts.retrieve poll ${i}`, () => stripe.accounts.retrieve(account.id))) || current;
    }
    note("custom account", `charges_enabled=${current.charges_enabled} payouts_enabled=${current.payouts_enabled} requirements_due=${(current.requirements?.currently_due || []).join(",")}`);
    // replace the facilitator's destination with the custom account; flags arrive via signed account.updated webhook
    const existing = await pg.payouts.getByUserId(FAC);
    await pg.payouts.upsert({ facilitator_key: "fac-e2e-facilitator", user_id: FAC, email: "e2e-facilitator@example.com", name: "E2E", stripe_account_id: account.id,
      charges_enabled: false, payouts_enabled: false, details_submitted: false });
    if (existing?.stripe_account_id && existing.stripe_account_id !== account.id) note("express account", `ersetzt durch Custom ${account.id.slice(0, 10)}…`);
    const { POST } = await import("@/app/api/stripe/webhook/route");
    await step("webhook account.updated (echtes Account-Objekt, signiert)", async () => {
      const r = await POST(signed("account.updated", current)());
      if ((await r.json()).outcome !== "account_updated") throw new Error("unexpected outcome");
    });
    if (current.charges_enabled) connectAccount = account.id;
  });

  it("3. Buchung → Setup-Checkout (echte Session) → SetupIntent pm_card_visa → signierter Webhook + Replay", async () => {
    const { POST: checkout } = await import("@/app/api/session-bookings/checkout/route");
    const { POST: webhook } = await import("@/app/api/stripe/webhook/route");
    const slot = await pg.q("SELECT slot_start FROM public.get_free_slots($1,$2, now()+interval '2 days', now()+interval '9 days') ORDER BY 1 LIMIT 1", [FAC, OFFERING]);
    const body = await step("POST /api/session-bookings/checkout (customers.create + checkout.sessions.create setup)", async () => {
      const r = await checkout(new Request(`${APP}/api/session-bookings/checkout`, { method: "POST", headers: { origin: APP, "content-type": "application/json", "x-forwarded-for": "10.1.1.1" },
        body: JSON.stringify({ offeringId: OFFERING, startAt: new Date(slot.rows[0].slot_start).toISOString(), customerName: "E2E Gast", customerEmail: "e2e-gast@example.com" }) }));
      const b = await r.json();
      if (r.status !== 200 || !String(b.url).startsWith("https://checkout.stripe.com/")) throw new Error(`status ${r.status}: ${b.error || ""}`);
      return b;
    });
    if (!body) return;
    bookingA = { id: body.bookingId, token: body.token };
    const row = (await pg.sessions.get(body.bookingId))!;
    customerA = row.stripe_customer_id!;
    track("customer", customerA);
    await step("label customer", () => stripe.customers.update(customerA!, { metadata: { ...LABEL, bookingId: row.id } }));
    const session = await step("checkout.sessions.retrieve", () => stripe.checkout.sessions.retrieve(row.stripe_checkout_session_id!));
    expect(session?.mode).toBe("setup");
    expect(Number(row.price_amount)).toBe(80.5);
    note("checkout UI", "Hosted Checkout ist headless nicht ausfüllbar → Abschluss per SetupIntent(pm_card_visa) + signiertem checkout.session.completed mit echter Session-ID.");
    const si = await step("setupIntents.create+confirm pm_card_visa (off_session)", () =>
      stripe.setupIntents.create({ customer: customerA, payment_method: "pm_card_visa", confirm: true, usage: "off_session", payment_method_types: ["card"], metadata: { ...LABEL, bookingId: row.id } }));
    if (!si || !session) return;
    const send = signed("checkout.session.completed", { ...session, status: "complete", setup_intent: si.id });
    await step("webhook checkout.session.completed → card_saved", async () => {
      const b = await (await webhook(send())).json();
      if (b.outcome !== "card_saved") throw new Error(`outcome ${b.outcome}`);
    });
    await step("webhook replay (gleiche Event-ID) → duplicate, keine Wirkung", async () => {
      const b = await (await webhook(send())).json();
      if (!b.duplicate) throw new Error("not deduplicated");
    });
    expect((await pg.sessions.get(row.id))!.payment_status).toBe("card_saved");
  });

  it("4. Bestätigen → Destination-Charge (fee=100, transfer_data) → Idempotenz-Replay → Refund mit reverse_transfer", async () => {
    if (!bookingA) return void results.push({ step: "4 übersprungen", status: "skipped", detail: "keine Buchung" });
    if (!connectAccount) {
      results.push({ step: "4 Destination-Charge", status: "skipped", detail: "kein Connect-Konto mit charges_enabled" });
      return;
    }
    const { PATCH } = await import("@/app/api/facilitator/session-bookings/[bookingId]/route");
    await step("facilitator confirm (prüft charges_enabled)", async () => {
      const r = await PATCH(new Request(`${APP}/x`, { method: "PATCH", headers: { origin: APP, authorization: "Bearer fac-jwt", "content-type": "application/json" }, body: JSON.stringify({ action: "confirm" }) }), { params: { bookingId: bookingA!.id } });
      if (r.status !== 200) throw new Error(`status ${r.status}: ${(await r.json()).error}`);
    });
    // session time -> past (test only, trigger bypass on local DB)
    await pg.q("ALTER TABLE public.session_bookings DISABLE TRIGGER session_bookings_before_update");
    await pg.q("UPDATE public.session_bookings SET start_at=now()-interval '2 hours', end_at=now()-interval '1 hour' WHERE id=$1", [bookingA.id]);
    await pg.q("ALTER TABLE public.session_bookings ENABLE TRIGGER session_bookings_before_update");
    const [s1, s2] = await Promise.all([settleSessionBooking(bookingA.id), settleSessionBooking(bookingA.id)]);
    const paid = (await pg.sessions.get(bookingA.id))!;
    results.push({ step: "settle (2 parallel) → genau 1 Charge", status: paid.payment_status === "paid" && [s1, s2].filter((s: any) => s.skipped).length === 1 ? "pass" : "fail", detail: scrub(JSON.stringify([s1, s2])) });
    if (paid.payment_status !== "paid") return;
    const pi = await step("paymentIntents.retrieve", () => stripe.paymentIntents.retrieve(paid.stripe_payment_intent_id!, { expand: ["latest_charge"] }));
    results.push({ step: "PI: amount 8150, application_fee_amount 100, transfer_data.destination", status: pi && pi.amount === 8150 && pi.application_fee_amount === 100 && (pi.transfer_data?.destination as string) === connectAccount ? "pass" : "fail",
      detail: pi ? `amount=${pi.amount} fee=${pi.application_fee_amount} dest_ok=${pi.transfer_data?.destination === connectAccount} status=${pi.status}` : "" });
    await step("label PI", () => stripe.paymentIntents.update(pi!.id, { metadata: { ...LABEL, bookingId: bookingA!.id, type: "orive_session_charge" } }));
    // Idempotency replay: same key + same params -> same PI, no second charge
    await step("Idempotenz-Replay paymentIntents.create (gleicher Key) → gleiche PI-ID", async () => {
      const again = await stripe.paymentIntents.create({
        amount: 8150, currency: "eur", customer: paid.stripe_customer_id!, payment_method: paid.stripe_payment_method_id!, off_session: true, confirm: true,
        description: `ORIVE Session ${paid.id.slice(0, 8)}`, metadata: { bookingId: paid.id, type: "orive_session_charge" },
        application_fee_amount: 100, transfer_data: { destination: connectAccount! },
      }, { idempotencyKey: `session-settle-${paid.id}-a1` });
      if (again.id !== pi!.id) throw new Error("different PaymentIntent → idempotency broken");
    });
    const third = await settleSessionBooking(bookingA.id);
    results.push({ step: "erneuter Cron-Lauf → skipped", status: (third as any).skipped ? "pass" : "fail" });
    const { POST: webhook } = await import("@/app/api/stripe/webhook/route");
    await step("webhook payment_intent.succeeded (echtes PI) → noop", async () => {
      const b = await (await webhook(signed("payment_intent.succeeded", pi)())).json();
      if (b.outcome !== "noop") throw new Error(`outcome ${b.outcome}`);
    });
    // refund via facilitator cancel
    await step("facilitator cancel → refunds.create(reverse_transfer, refund_application_fee)", async () => {
      const r = await PATCH(new Request(`${APP}/x`, { method: "PATCH", headers: { origin: APP, authorization: "Bearer fac-jwt", "content-type": "application/json" }, body: JSON.stringify({ action: "cancel" }) }), { params: { bookingId: bookingA!.id } });
      const b = await r.json();
      if (r.status !== 200 || !b.refunded) throw new Error(`status ${r.status}: ${b.error || ""}`);
    });
    const refunds = await step("refunds.list", () => stripe.refunds.list({ payment_intent: pi!.id }));
    const refund = refunds?.data[0];
    if (refund) await step("label refund", () => stripe.refunds.update(refund.id, { metadata: { ...LABEL, bookingId: bookingA!.id } }));
    const charge = await step("charges.retrieve (transfer/app fee refunded?)", () => stripe.charges.retrieve((pi!.latest_charge as Stripe.Charge).id, { expand: ["transfer", "application_fee"] }));
    const transfer = charge?.transfer as Stripe.Transfer | undefined;
    const fee = charge?.application_fee as Stripe.ApplicationFee | undefined;
    results.push({ step: "Refund: Charge erstattet, Transfer reversed, App-Fee erstattet", status: charge?.refunded && transfer?.reversed && fee?.refunded ? "pass" : "fail",
      detail: `charge.refunded=${charge?.refunded} transfer.reversed=${transfer?.reversed} amount_reversed=${transfer?.amount_reversed} fee.refunded=${fee?.refunded}` });
    if (charge) await step("webhook charge.refunded (echte Charge)", async () => {
      const b = await (await webhook(signed("charge.refunded", charge)())).json();
      if (b.outcome !== "refunded") throw new Error(`outcome ${b.outcome}`);
    });
    expect((await pg.sessions.get(bookingA.id))!.payment_status).toBe("refunded");
  });

  for (const [label, pm, expectCode] of [
    ["5. Abgelehnte Karte pm_card_chargeDeclined", "pm_card_chargeDeclined", "card_declined"],
    ["6. SCA-Karte pm_card_authenticationRequired (off-session)", "pm_card_authenticationRequired", "authentication_required"],
  ] as const) {
    it(label, async () => {
      if (!connectAccount) return void results.push({ step: label, status: "skipped", detail: "kein Connect-Konto mit charges_enabled" });
      const slot = await pg.q("SELECT slot_start FROM public.get_free_slots($1,$2, now()+interval '2 days', now()+interval '9 days') ORDER BY 1 LIMIT 1", [FAC, OFFERING]);
      const b = await pg.sessions.insert({ offering_id: OFFERING, start_at: new Date(slot.rows[0].slot_start).toISOString(), customer_name: "E2E Karte", customer_email: `e2e-${pm}@example.com` });
      const cus = await step(`${label}: customers.create`, () => stripe.customers.create({ email: `e2e-${pm}@example.com`, metadata: { ...LABEL, bookingId: b.id } }));
      if (!cus) return;
      track("customer", cus.id);
      const pmObj = await step(`${label}: paymentMethods.attach`, () => stripe.paymentMethods.attach(pm, { customer: cus.id }));
      if (!pmObj) return;
      await pg.q("ALTER TABLE public.session_bookings DISABLE TRIGGER session_bookings_before_update");
      await pg.q("UPDATE public.session_bookings SET stripe_customer_id=$2, stripe_payment_method_id=$3, payment_status='card_saved', hold_expires_at=NULL, status='confirmed', start_at=now()-interval '2 hours', end_at=now()-interval '1 hour' WHERE id=$1", [b.id, cus.id, pmObj.id]);
      await pg.q("ALTER TABLE public.session_bookings ENABLE TRIGGER session_bookings_before_update");
      const r = await settleSessionBooking(b.id);
      const after = (await pg.sessions.get(b.id))!;
      const pis = await step(`${label}: paymentIntents.list`, () => stripe.paymentIntents.list({ customer: cus.id, limit: 3 }));
      const last = pis?.data[0];
      if (last) await step(`${label}: label PI`, () => stripe.paymentIntents.update(last.id, { metadata: { ...LABEL, bookingId: b.id } }));
      const code = (last?.last_payment_error?.code || last?.last_payment_error?.decline_code || "") as string;
      results.push({ step: `${label}: Booking → failed, kein Geld bewegt`, status: !r.ok && after.payment_status === "failed" ? "pass" : "fail",
        detail: `pi.status=${last?.status} error=${code} attempts=${after.settle_attempts}` });
      results.push({ step: `${label}: Stripe-Fehlercode ${expectCode}`, status: code.includes(expectCode) || (expectCode === "card_declined" && /declin/.test(code)) ? "pass" : "fail", detail: code });
    });
  }
});
