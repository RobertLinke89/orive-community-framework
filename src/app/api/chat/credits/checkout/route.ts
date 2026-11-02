import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { resolveChatCreditPlan, normalizeVisitorKey } from '@/lib/chatCredits';
import { allowStripeSimulation, isStripeKeyUsable } from '@/lib/payments';
import { grantChatCredits } from '@/lib/chatCredits';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorKey = normalizeVisitorKey(
      body.visitorKey || req.headers.get('x-orive-client-token')
    );
    const plan = resolveChatCreditPlan(body.plan);
    if (!visitorKey) {
      return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
    }
    if (!plan) {
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://orive.co';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (isStripeKeyUsable(stripeSecretKey)) {
      const stripe = new Stripe(stripeSecretKey as string, {
        apiVersion: '2024-06-20' as Stripe.StripeConfig['apiVersion'],
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: plan.amountCents,
              product_data: {
                name: plan.nameEn,
                description: plan.isLifetime
                  ? 'Unlimited ORIVE concierge replies'
                  : `${plan.credits} ORIVE concierge credits (never expire)`,
              },
            },
          },
        ],
        metadata: {
          type: 'orive_chat_credits',
          plan: plan.id,
          visitorKey,
        },
        success_url: `${origin}/chat?credits=ok&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/chat?credits=cancelled`,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    }

    if (!allowStripeSimulation()) {
      return NextResponse.json(
        { error: 'Payments are not configured.' },
        { status: 503 }
      );
    }

    const simulatedId = `sim_credits_${plan.id}_${Date.now()}`;
    const balance = grantChatCredits({
      visitorKey,
      plan,
      stripeSessionId: simulatedId,
    });

    return NextResponse.json({
      success: true,
      simulated: true,
      balance: {
        remaining: Number.isFinite(balance.remaining) ? balance.remaining : null,
        freeRemaining: balance.freeRemaining,
        prepaid: balance.prepaid,
        lifetime: balance.lifetime,
        graceUsed: balance.graceUsed,
      },
    });
  } catch (err) {
    console.error('[chat/credits/checkout]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
