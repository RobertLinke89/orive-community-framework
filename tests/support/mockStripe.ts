import type Stripe from "stripe";

/**
 * Test-mode Stripe double. Emulates Stripe idempotency (same key -> same result, no new side effect)
 * and records every call so tests can assert amounts, fees, destinations and refund flags.
 */
export function createMockStripe(opts: { declineCharges?: boolean } = {}) {
  const calls: Array<{ method: string; params: any; idempotencyKey?: string }> = [];
  const idem = new Map<string, unknown>();
  let n = 0;
  const id = (p: string) => `${p}_test_${++n}`;
  const charged: any[] = [];

  function wrap<T>(method: string, fn: (params: any) => T) {
    return async (params: any, options?: { idempotencyKey?: string }) => {
      calls.push({ method, params, idempotencyKey: options?.idempotencyKey });
      const key = options?.idempotencyKey ? `${method}:${options.idempotencyKey}` : null;
      if (key && idem.has(key)) return idem.get(key) as T;
      const result = fn(params);
      if (key) idem.set(key, result);
      return result;
    };
  }

  const state = { declineCharges: Boolean(opts.declineCharges) };
  const client = {
    customers: { create: wrap("customers.create", (p) => ({ id: id("cus"), email: p.email })) },
    checkout: {
      sessions: {
        create: wrap("checkout.sessions.create", (p) => ({ id: id("cs"), url: `https://checkout.stripe.test/${n}`, mode: p.mode, metadata: p.metadata })),
      },
    },
    setupIntents: { retrieve: async (sid: string) => ({ id: sid, payment_method: "pm_card_visa" }) },
    paymentMethods: { detach: wrap("paymentMethods.detach", (p) => ({ id: p })) },
    paymentIntents: {
      create: wrap("paymentIntents.create", (p) => {
        if (state.declineCharges) {
          const err: any = new Error("Your card was declined.");
          err.type = "StripeCardError";
          err.code = "card_declined";
          throw err;
        }
        const pi = { id: id("pi"), status: "succeeded", amount: p.amount, metadata: p.metadata };
        charged.push(p);
        return pi;
      }),
    },
    refunds: { create: wrap("refunds.create", (p) => ({ id: id("re"), payment_intent: p.payment_intent, status: "succeeded" })) },
    accounts: {
      create: wrap("accounts.create", () => ({ id: id("acct"), charges_enabled: false, payouts_enabled: false })),
      retrieve: async (acct: string) => ({ id: acct, charges_enabled: true, payouts_enabled: true, details_submitted: true }),
    },
    accountLinks: { create: wrap("accountLinks.create", (p) => ({ url: `https://connect.stripe.test/${p.account}` })) },
  };
  return { client: client as unknown as Stripe, calls, charged, state };
}
