
import fs from "fs";
import path from "path";
import { getRepos, type PayoutAccount } from "@/lib/paymentRepo";

const CLAIMED_FILE = path.resolve(process.cwd(), "src/data/claimedFacilitators.json");

type ClaimedRecord = {
  facilitatorId?: string;
  name?: string;
  email?: string;
  city?: string;
  practice?: string;
  onboardingComplete?: boolean;
  [key: string]: unknown;
};

export function facilitatorIdForEmail(email: string) {
  const slug = email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `fac-${slug || "host"}`.slice(0, 64);
}

export function profileByEmail(email: string) {
  const needle = email.trim().toLowerCase();
  if (!needle) return null;
  return Object.values(readClaimed()).find((record) => String(record.email || "").toLowerCase() === needle) || null;
}

export function upsertProfile(input: {
  facilitatorId: string;
  email: string;
  name?: string;
  city?: string;
  practice?: string;
  onboardingComplete?: boolean;
}) {
  const list = readClaimed();
  const current = list[input.facilitatorId] || { facilitatorId: input.facilitatorId };
  list[input.facilitatorId] = {
    ...current,
    facilitatorId: input.facilitatorId,
    email: input.email || current.email,
    name: input.name || current.name,
    city: input.city ?? current.city,
    practice: input.practice ?? current.practice,
    onboardingComplete: input.onboardingComplete ?? current.onboardingComplete ?? false,
  };
  writeClaimed(list);
  return list[input.facilitatorId];
}

function readClaimed(): Record<string, ClaimedRecord> {
  try {
    if (!fs.existsSync(CLAIMED_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(CLAIMED_FILE, "utf-8") || "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeClaimed(list: Record<string, ClaimedRecord>) {
  fs.writeFileSync(CLAIMED_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function claimedFacilitator(facilitatorId: string) {
  return readClaimed()[facilitatorId] || null;
}

/**
 * Stripe Connect accounts live in Supabase (public.facilitator_payout_accounts), not in the
 * JSON file (read-only/ephemeral on Vercel). Profile claims above remain file-based (legacy, see README).
 */
export async function payoutAccountFor(input: { facilitatorId?: string; email?: string; userId?: string }): Promise<PayoutAccount | null> {
  const { payouts } = getRepos();
  if (input.userId) {
    const byUser = await payouts.getByUserId(input.userId);
    if (byUser) return byUser;
  }
  if (input.facilitatorId) {
    const byKey = await payouts.getByKey(input.facilitatorId);
    if (byKey) return byKey;
  }
  const email = String(input.email || "").trim().toLowerCase();
  return email ? payouts.getByEmail(email) : null;
}

/** Destination for a charge: only accounts that can actually accept charges. */
export async function findStripeAccount(facilitatorId?: string, email?: string): Promise<string | null> {
  const account = await payoutAccountFor({ facilitatorId, email });
  return account?.stripe_account_id && account.charges_enabled ? account.stripe_account_id : null;
}

export async function saveStripeAccount(input: { facilitatorId: string; userId?: string; stripeAccountId: string; email: string; name?: string }) {
  const { payouts } = getRepos();
  const existing = await payouts.getByKey(input.facilitatorId);
  return payouts.upsert({
    facilitator_key: input.facilitatorId,
    user_id: input.userId || existing?.user_id || null,
    email: input.email,
    name: input.name || existing?.name || null,
    stripe_account_id: input.stripeAccountId,
    charges_enabled: existing?.charges_enabled ?? false,
    payouts_enabled: existing?.payouts_enabled ?? false,
    details_submitted: existing?.details_submitted ?? false,
  });
}
