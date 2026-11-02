import type { SupabaseClient } from "@supabase/supabase-js";
import { serverDb } from "@/lib/serverDb";

/** Row of public.session_bookings as used by the payment flow (see migrations 20261027*). */
export type SessionBookingRecord = {
  id: string;
  offering_id: string;
  facilitator_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  notes?: string | null;
  start_at: string;
  end_at: string;
  status: "pending" | "confirmed" | "declined" | "cancelled" | "expired";
  payment_status: "awaiting_card" | "card_saved" | "processing" | "paid" | "failed" | "refunded" | "released";
  payout_status: "none" | "transferred" | "reversed";
  hold_expires_at: string | null;
  price_amount: number;
  platform_fee_amount: number;
  currency: string;
  access_token_hash?: string | null;
  stripe_customer_id?: string | null;
  stripe_payment_method_id?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_destination_account?: string | null;
  settle_attempts: number;
  intake_ciphertext?: string | null;
  health_data_consent_at?: string | null;
  paid_at?: string | null;
  refunded_at?: string | null;
};

export type NewSessionBooking = Pick<SessionBookingRecord, "offering_id" | "customer_name" | "customer_email" | "start_at"> & {
  customer_phone?: string | null;
  notes?: string | null;
  intake_ciphertext?: string | null;
  health_data_consent_at?: string | null;
};

export class RepoError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export interface SessionBookingRepo {
  /** DB trigger derives facilitator, price, fee, end_at, hold_expires_at; throws RepoError 23P01 / 53400. */
  insert(input: NewSessionBooking): Promise<SessionBookingRecord>;
  get(id: string): Promise<SessionBookingRecord | null>;
  getByCheckoutSession(sessionId: string): Promise<SessionBookingRecord | null>;
  getByPaymentIntent(intentId: string): Promise<SessionBookingRecord | null>;
  /** Compare-and-set update: applies `patch` only when every `where` field still matches. */
  update(id: string, patch: Partial<SessionBookingRecord>, where?: Partial<SessionBookingRecord>): Promise<SessionBookingRecord | null>;
  listDueIds(nowIso: string): Promise<string[]>;
  claimForSettlement(id: string): Promise<SessionBookingRecord | null>;
  expireHolds(): Promise<number>;
}

export type PayoutAccount = {
  facilitator_key: string;
  user_id?: string | null;
  email: string;
  name?: string | null;
  stripe_account_id?: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
};

export interface PayoutRepo {
  getByKey(key: string): Promise<PayoutAccount | null>;
  getByUserId(userId: string): Promise<PayoutAccount | null>;
  getByEmail(email: string): Promise<PayoutAccount | null>;
  upsert(account: PayoutAccount): Promise<PayoutAccount>;
  updateFlagsByStripeAccount(stripeAccountId: string, flags: Pick<PayoutAccount, "charges_enabled" | "payouts_enabled" | "details_submitted">): Promise<void>;
}

export interface StripeEventRepo {
  /** true = first time we see this event (caller processes it); false = duplicate. */
  claim(id: string, type: string): Promise<boolean>;
  markProcessed(id: string): Promise<void>;
  /** Processing failed: forget the claim so Stripe's retry is processed again. */
  release(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Supabase implementations (service role, server only)
// ---------------------------------------------------------------------------
function db(): SupabaseClient {
  const client = serverDb();
  if (!client) throw new RepoError("not_configured", "Supabase service role is not configured.");
  return client;
}

function fail(error: { code?: string; message?: string } | null) {
  if (error) throw new RepoError(error.code || "db_error", error.message || "Database error");
}

export const supabaseSessionRepo: SessionBookingRepo = {
  async insert(input) {
    const { data, error } = await db().from("session_bookings").insert(input).select("*").single();
    fail(error);
    return data as SessionBookingRecord;
  },
  async get(id) {
    const { data, error } = await db().from("session_bookings").select("*").eq("id", id).maybeSingle();
    fail(error);
    return (data as SessionBookingRecord) || null;
  },
  async getByCheckoutSession(sessionId) {
    const { data, error } = await db().from("session_bookings").select("*").eq("stripe_checkout_session_id", sessionId).maybeSingle();
    fail(error);
    return (data as SessionBookingRecord) || null;
  },
  async getByPaymentIntent(intentId) {
    const { data, error } = await db().from("session_bookings").select("*").eq("stripe_payment_intent_id", intentId).maybeSingle();
    fail(error);
    return (data as SessionBookingRecord) || null;
  },
  async update(id, patch, where = {}) {
    let query = db().from("session_bookings").update(patch).eq("id", id);
    for (const [key, value] of Object.entries(where)) {
      query = value === null ? query.is(key, null) : query.eq(key, value as string);
    }
    const { data, error } = await query.select("*").maybeSingle();
    fail(error);
    return (data as SessionBookingRecord) || null;
  },
  async listDueIds(nowIso) {
    const { data, error } = await db()
      .from("session_bookings")
      .select("id")
      .eq("status", "confirmed")
      .in("payment_status", ["card_saved", "failed"])
      .lt("settle_attempts", 3)
      .lte("end_at", nowIso)
      .limit(100);
    fail(error);
    return (data || []).map((row: { id: string }) => row.id);
  },
  async claimForSettlement(id) {
    const { data, error } = await db().rpc("claim_session_booking_for_settlement", { p_id: id });
    fail(error);
    const rows = (data || []) as SessionBookingRecord[];
    return rows[0] || null;
  },
  async expireHolds() {
    const { data, error } = await db().rpc("expire_session_holds");
    fail(error);
    return Number(data) || 0;
  },
};

export const supabasePayoutRepo: PayoutRepo = {
  async getByKey(key) {
    const { data, error } = await db().from("facilitator_payout_accounts").select("*").eq("facilitator_key", key).maybeSingle();
    fail(error);
    return (data as PayoutAccount) || null;
  },
  async getByUserId(userId) {
    const { data, error } = await db().from("facilitator_payout_accounts").select("*").eq("user_id", userId).limit(1).maybeSingle();
    fail(error);
    return (data as PayoutAccount) || null;
  },
  async getByEmail(email) {
    const { data, error } = await db().from("facilitator_payout_accounts").select("*").ilike("email", email.trim()).limit(1).maybeSingle();
    fail(error);
    return (data as PayoutAccount) || null;
  },
  async upsert(account) {
    const { data, error } = await db()
      .from("facilitator_payout_accounts")
      .upsert({ ...account, updated_at: new Date().toISOString() }, { onConflict: "facilitator_key" })
      .select("*")
      .single();
    fail(error);
    return data as PayoutAccount;
  },
  async updateFlagsByStripeAccount(stripeAccountId, flags) {
    const { error } = await db()
      .from("facilitator_payout_accounts")
      .update({ ...flags, updated_at: new Date().toISOString() })
      .eq("stripe_account_id", stripeAccountId);
    fail(error);
  },
};

export const supabaseEventRepo: StripeEventRepo = {
  async claim(id, type) {
    const { error } = await db().from("stripe_events").insert({ id, type });
    if (error?.code === "23505") return false;
    fail(error);
    return true;
  },
  async markProcessed(id) {
    const { error } = await db().from("stripe_events").update({ processed_at: new Date().toISOString() }).eq("id", id);
    fail(error);
  },
  async release(id) {
    const { error } = await db().from("stripe_events").delete().eq("id", id);
    fail(error);
  },
};

// ---------------------------------------------------------------------------
// Dependency container (tests swap in memory repos / mocks)
// ---------------------------------------------------------------------------
export type Repos = { sessions: SessionBookingRepo; payouts: PayoutRepo; events: StripeEventRepo };

let repos: Repos = { sessions: supabaseSessionRepo, payouts: supabasePayoutRepo, events: supabaseEventRepo };

export function getRepos(): Repos {
  return repos;
}

export function setReposForTests(next: Partial<Repos> | null) {
  repos = next
    ? { ...repos, ...next }
    : { sessions: supabaseSessionRepo, payouts: supabasePayoutRepo, events: supabaseEventRepo };
}
