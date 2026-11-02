import crypto from "crypto";
import type { NewSessionBooking, PayoutAccount, PayoutRepo, SessionBookingRecord, SessionBookingRepo, StripeEventRepo } from "@/lib/paymentRepo";
import { RepoError } from "@/lib/paymentRepo";

/**
 * In-memory stand-in for the Supabase tables. Mirrors the DB rules of the migrations:
 * price/fee/facilitator derived from the offering, 35-min hold, lazy hold expiry,
 * overlap exclusion (pending-not-expired | confirmed), 3 open holds per e-mail/hour,
 * atomic settlement claim (max 3 attempts), CAS updates.
 */
export type Offering = { id: string; facilitatorId: string; priceEuro: number; durationMin: number };

export function createMemoryRepos(offerings: Offering[], clock: () => number = Date.now) {
  const rows = new Map<string, SessionBookingRecord>();
  const payoutRows = new Map<string, PayoutAccount>();
  const eventRows = new Map<string, { type: string; processed: boolean }>();

  const blocks = (b: SessionBookingRecord) =>
    b.status === "confirmed" ||
    (b.status === "pending" && (b.payment_status !== "awaiting_card" || !b.hold_expires_at || Date.parse(b.hold_expires_at) >= clock()));

  const expireStale = (facilitatorId?: string) => {
    let n = 0;
    for (const b of rows.values()) {
      if ((facilitatorId && b.facilitator_id !== facilitatorId) || b.status !== "pending" || b.payment_status !== "awaiting_card") continue;
      if (b.hold_expires_at && Date.parse(b.hold_expires_at) < clock()) {
        b.status = "expired";
        b.payment_status = "released";
        n += 1;
      }
    }
    return n;
  };

  const sessions: SessionBookingRepo = {
    async insert(input: NewSessionBooking) {
      const offering = offerings.find((o) => o.id === input.offering_id);
      if (!offering) throw new RepoError("P0002", "Offering not found");
      expireStale(offering.facilitatorId);
      const recent = [...rows.values()].filter(
        (b) => b.customer_email.toLowerCase() === input.customer_email.toLowerCase() && b.status === "pending" && b.payment_status === "awaiting_card",
      ).length;
      if (recent >= 3) throw new RepoError("53400", "Too many open booking holds");
      const start = Date.parse(input.start_at);
      const end = start + offering.durationMin * 60_000;
      const overlap = [...rows.values()].some(
        (b) => b.facilitator_id === offering.facilitatorId && blocks(b) && Date.parse(b.start_at) < end && start < Date.parse(b.end_at),
      );
      if (overlap) throw new RepoError("23P01", "Requested slot is not available");
      const row: SessionBookingRecord = {
        id: crypto.randomUUID(),
        offering_id: offering.id,
        facilitator_id: offering.facilitatorId,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone ?? null,
        notes: input.notes ?? null,
        start_at: new Date(start).toISOString(),
        end_at: new Date(end).toISOString(),
        status: "pending",
        payment_status: "awaiting_card",
        payout_status: "none",
        hold_expires_at: new Date(clock() + 35 * 60_000).toISOString(),
        price_amount: offering.priceEuro,
        platform_fee_amount: 1.0,
        currency: "EUR",
        settle_attempts: 0,
        intake_ciphertext: input.intake_ciphertext ?? null,
        health_data_consent_at: input.health_data_consent_at ?? null,
      };
      rows.set(row.id, row);
      return { ...row };
    },
    async get(id) {
      const row = rows.get(id);
      return row ? { ...row } : null;
    },
    async getByCheckoutSession(id) {
      const row = [...rows.values()].find((b) => b.stripe_checkout_session_id === id);
      return row ? { ...row } : null;
    },
    async getByPaymentIntent(id) {
      const row = [...rows.values()].find((b) => b.stripe_payment_intent_id === id);
      return row ? { ...row } : null;
    },
    async update(id, patch, where = {}) {
      const row = rows.get(id);
      if (!row) return null;
      for (const [k, v] of Object.entries(where)) if ((row as Record<string, unknown>)[k] !== v) return null;
      if (patch.status === "confirmed" && (patch.payment_status ?? row.payment_status) !== "card_saved") {
        throw new RepoError("P0001", "Booking cannot be confirmed before the card is saved");
      }
      Object.assign(row, patch);
      return { ...row };
    },
    async listDueIds(nowIso) {
      return [...rows.values()]
        .filter((b) => b.status === "confirmed" && ["card_saved", "failed"].includes(b.payment_status) && b.settle_attempts < 3 && b.end_at <= nowIso)
        .map((b) => b.id);
    },
    async claimForSettlement(id) {
      const b = rows.get(id);
      if (!b || b.status !== "confirmed" || !["card_saved", "failed"].includes(b.payment_status) || b.settle_attempts >= 3) return null;
      if (Date.parse(b.end_at) > clock()) return null;
      b.payment_status = "processing";
      b.settle_attempts += 1;
      return { ...b };
    },
    async expireHolds() {
      return expireStale();
    },
  };

  const payouts: PayoutRepo = {
    async getByKey(key) { return payoutRows.get(key) || null; },
    async getByUserId(uid) { return [...payoutRows.values()].find((a) => a.user_id === uid) || null; },
    async getByEmail(email) { return [...payoutRows.values()].find((a) => a.email.toLowerCase() === email.toLowerCase()) || null; },
    async upsert(account) { payoutRows.set(account.facilitator_key, { ...account }); return { ...account }; },
    async updateFlagsByStripeAccount(acct, flags) {
      for (const a of payoutRows.values()) if (a.stripe_account_id === acct) Object.assign(a, flags);
    },
  };

  const events: StripeEventRepo = {
    async claim(id, type) {
      if (eventRows.has(id)) return false;
      eventRows.set(id, { type, processed: false });
      return true;
    },
    async markProcessed(id) { const e = eventRows.get(id); if (e) e.processed = true; },
    async release(id) { eventRows.delete(id); },
  };

  return { sessions, payouts, events, rows, payoutRows, eventRows };
}
