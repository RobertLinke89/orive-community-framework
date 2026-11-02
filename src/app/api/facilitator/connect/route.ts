import { NextResponse } from "next/server";
import { appOrigin, isSameOrigin } from "@/lib/appOrigin";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { payoutAccountFor, saveStripeAccount } from "@/lib/facilitatorPayout";
import { getRepos } from "@/lib/paymentRepo";
import { GENERIC_ERROR, logError } from "@/lib/safeLog";
import { getStripe } from "@/lib/stripeClient";

export const dynamic = "force-dynamic";

/** GET: onboarding status of the SIGNED-IN facilitator only (S8). Refreshes flags from Stripe. */
export async function GET(request: Request) {
  const actor = await facilitatorFromRequest(request);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ready: false, reason: "stripe_not_configured", payoutsEnabled: false, chargesEnabled: false });
  try {
    const record = await payoutAccountFor({ userId: actor.userId, facilitatorId: actor.id });
    if (!record?.stripe_account_id) return NextResponse.json({ ready: false, reason: "not_connected", payoutsEnabled: false, chargesEnabled: false });
    const account = await stripe.accounts.retrieve(record.stripe_account_id);
    const flags = {
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
      details_submitted: Boolean(account.details_submitted),
    };
    await getRepos().payouts.updateFlagsByStripeAccount(record.stripe_account_id, flags);
    return NextResponse.json({
      ready: flags.charges_enabled && flags.payouts_enabled,
      chargesEnabled: flags.charges_enabled,
      payoutsEnabled: flags.payouts_enabled,
      detailsSubmitted: flags.details_submitted,
    });
  } catch (error) {
    logError("connect.get", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

/** POST: create/continue Express onboarding. Requires the facilitator's Supabase JWT; no e-mail fallback (S8). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const actor = await facilitatorFromRequest(request);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured for payouts yet." }, { status: 503 });

  try {
    const record = await payoutAccountFor({ userId: actor.userId, facilitatorId: actor.id });
    let accountId = record?.stripe_account_id || null;
    if (!accountId) {
      const account = await stripe.accounts.create(
        {
          type: "express",
          country: "DE",
          email: actor.email,
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
          metadata: { facilitatorId: actor.id },
        },
        { idempotencyKey: `connect-account-${actor.userId}` },
      );
      accountId = account.id;
      await saveStripeAccount({ facilitatorId: actor.id, userId: actor.userId, stripeAccountId: accountId, email: actor.email, name: actor.name });
    }
    const origin = appOrigin();
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dezk/start?connect=refresh`,
      return_url: `${origin}/dezk/start?connect=return`,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: link.url });
  } catch (error) {
    logError("connect.post", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
