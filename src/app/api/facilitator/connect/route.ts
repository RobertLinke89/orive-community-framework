import { NextResponse } from "next/server";
import Stripe from "stripe";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { claimedFacilitator, profileByEmail, saveStripeAccount, upsertProfile } from "@/lib/facilitatorPayout";
import { isStripeKeyUsable } from "@/lib/payments";

export const dynamic = "force-dynamic";

function client() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isStripeKeyUsable(key)) return null;
  return new Stripe(key as string, { apiVersion: "2024-06-20" as any });
}

export async function GET(request: Request) {
  const facilitatorId = new URL(request.url).searchParams.get("facilitatorId") || "";
  const record = facilitatorId ? claimedFacilitator(facilitatorId) : null;
  const stripe = client();
  if (!stripe) {
    return NextResponse.json({
      ready: false,
      reason: "stripe_not_configured",
      payoutsEnabled: false,
    });
  }
  if (!record?.stripeAccountId) {
    return NextResponse.json({ ready: false, reason: "not_connected", payoutsEnabled: false });
  }
  const account = await stripe.accounts.retrieve(record.stripeAccountId);
  return NextResponse.json({
    ready: Boolean(account.payouts_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const actor = await facilitatorFromRequest(request);
  const facilitatorId = actor?.id || String(body.facilitatorId || "");
  const email = (actor?.email || String(body.email || "")).trim().toLowerCase();
  if (!facilitatorId || !email) {
    return NextResponse.json({ error: "Facilitator id and email are required." }, { status: 400 });
  }
  let record = claimedFacilitator(facilitatorId) || profileByEmail(email);
  if (!actor && (!record || String(record.email || "").toLowerCase() !== email)) {
    return NextResponse.json({ error: "Claim the profile with this email first." }, { status: 403 });
  }
  if (actor && !record) {
    record = upsertProfile({ facilitatorId, email, name: actor.name });
  }
  const stripe = client();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured for payouts yet." }, { status: 503 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://orive.co";
  let accountId = record?.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { facilitatorId },
    });
    accountId = account.id;
    saveStripeAccount(facilitatorId, accountId, email, record?.name || actor?.name);
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dezk/start`,
    return_url: `${origin}/app`,
    type: "account_onboarding",
  });
  return NextResponse.json({ url: link.url });
}
