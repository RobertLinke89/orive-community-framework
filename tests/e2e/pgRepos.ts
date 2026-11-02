import { Client } from "pg";
import type { PayoutRepo, SessionBookingRecord, SessionBookingRepo, StripeEventRepo } from "@/lib/paymentRepo";
import { RepoError } from "@/lib/paymentRepo";

/**
 * Repos against a LOCAL Postgres that has both migrations applied (same SQL triggers/RPCs as Supabase).
 * Connects as the server role (service-role semantics). Never points at the live project.
 */
export async function createPgRepos(connectionString: string) {
  if (/supabase\.(co|com)/.test(connectionString)) throw new Error("refusing non-local database");
  const db = new Client({ connectionString });
  await db.connect();
  const q = async (sql: string, params: unknown[] = []) => {
    try {
      return await db.query(sql, params);
    } catch (e: any) {
      throw new RepoError(e.code || "db_error", e.message);
    }
  };
  const norm = (r: any): SessionBookingRecord | null =>
    r ? { ...r, price_amount: Number(r.price_amount), platform_fee_amount: Number(r.platform_fee_amount),
          start_at: new Date(r.start_at).toISOString(), end_at: new Date(r.end_at).toISOString(),
          hold_expires_at: r.hold_expires_at ? new Date(r.hold_expires_at).toISOString() : null } : null;

  const sessions: SessionBookingRepo = {
    async insert(input) {
      const keys = Object.keys(input).filter((k) => (input as any)[k] !== undefined);
      const cols = [...keys, "facilitator_id", "end_at"];
      const vals = [...keys.map((k) => (input as any)[k]), "00000000-0000-0000-0000-000000000000", input.start_at];
      const r = await q(`INSERT INTO public.session_bookings(${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`, vals);
      return norm(r.rows[0])!;
    },
    async get(id) { return norm((await q("SELECT * FROM public.session_bookings WHERE id=$1", [id])).rows[0]); },
    async getByCheckoutSession(id) { return norm((await q("SELECT * FROM public.session_bookings WHERE stripe_checkout_session_id=$1", [id])).rows[0]); },
    async getByPaymentIntent(id) { return norm((await q("SELECT * FROM public.session_bookings WHERE stripe_payment_intent_id=$1", [id])).rows[0]); },
    async update(id, patch, where = {}) {
      const set = Object.keys(patch);
      const params: unknown[] = [id, ...set.map((k) => (patch as any)[k])];
      const conds = Object.entries(where).map(([k, v]) => {
        if (v === null) return `${k} IS NULL`;
        params.push(v);
        return `${k} = $${params.length}`;
      });
      const r = await q(`UPDATE public.session_bookings SET ${set.map((k, i) => `${k}=$${i + 2}`).join(",")} WHERE id=$1 ${conds.map((c) => `AND ${c}`).join(" ")} RETURNING *`, params);
      return norm(r.rows[0]);
    },
    async listDueIds(nowIso) {
      const r = await q("SELECT id FROM public.session_bookings WHERE status='confirmed' AND payment_status IN ('card_saved','failed') AND settle_attempts<3 AND end_at<=$1", [nowIso]);
      return r.rows.map((x: any) => x.id);
    },
    async claimForSettlement(id) { return norm((await q("SELECT * FROM public.claim_session_booking_for_settlement($1)", [id])).rows[0]); },
    async expireHolds() { return Number((await q("SELECT public.expire_session_holds() n")).rows[0].n); },
  };
  const payouts: PayoutRepo = {
    async getByKey(k) { return (await q("SELECT * FROM public.facilitator_payout_accounts WHERE facilitator_key=$1", [k])).rows[0] || null; },
    async getByUserId(u) { return (await q("SELECT * FROM public.facilitator_payout_accounts WHERE user_id=$1 LIMIT 1", [u])).rows[0] || null; },
    async getByEmail(e) { return (await q("SELECT * FROM public.facilitator_payout_accounts WHERE lower(email)=lower($1) LIMIT 1", [e])).rows[0] || null; },
    async upsert(a) {
      const r = await q(`INSERT INTO public.facilitator_payout_accounts(facilitator_key,user_id,email,name,stripe_account_id,charges_enabled,payouts_enabled,details_submitted)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (facilitator_key) DO UPDATE SET user_id=EXCLUDED.user_id,email=EXCLUDED.email,name=EXCLUDED.name,
        stripe_account_id=EXCLUDED.stripe_account_id,charges_enabled=EXCLUDED.charges_enabled,payouts_enabled=EXCLUDED.payouts_enabled,details_submitted=EXCLUDED.details_submitted,updated_at=now() RETURNING *`,
        [a.facilitator_key, a.user_id ?? null, a.email, a.name ?? null, a.stripe_account_id ?? null, a.charges_enabled, a.payouts_enabled, a.details_submitted]);
      return r.rows[0];
    },
    async updateFlagsByStripeAccount(acct, f) {
      await q("UPDATE public.facilitator_payout_accounts SET charges_enabled=$2,payouts_enabled=$3,details_submitted=$4,updated_at=now() WHERE stripe_account_id=$1", [acct, f.charges_enabled, f.payouts_enabled, f.details_submitted]);
    },
  };
  const events: StripeEventRepo = {
    async claim(id, type) {
      try { await db.query("INSERT INTO public.stripe_events(id,type) VALUES ($1,$2)", [id, type]); return true; }
      catch (e: any) { if (e.code === "23505") return false; throw e; }
    },
    async markProcessed(id) { await q("UPDATE public.stripe_events SET processed_at=now() WHERE id=$1", [id]); },
    async release(id) { await q("DELETE FROM public.stripe_events WHERE id=$1", [id]); },
  };
  return { db, q, sessions, payouts, events };
}
