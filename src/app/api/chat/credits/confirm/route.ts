import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  grantChatCredits,
  normalizeVisitorKey,
  resolveChatCreditPlan,
  getChatCreditBalance,
} from '@/lib/chatCredits';
import { allowStripeSimulation, isStripeKeyUsable } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.sessionId || '').trim();
    const visitorKey = normalizeVisitorKey(
      body.visitorKey || req.headers.get('x-orive-client-token')
    );
    if (!sessionId || !visitorKey) {
      return NextResponse.json({ error: 'Missing session or visitor' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!isStripeKeyUsable(stripeSecretKey)) {
      if (!allowStripeSimulation()) {
        return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });
      }
      return NextResponse.json({
        balance: getChatCreditBalance(visitorKey),
      });
    }

    const stripe = new Stripe(stripeSecretKey as string, {
      apiVersion: '2024-06-20' as Stripe.StripeConfig['apiVersion'],
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not complete' }, { status: 409 });
    }
    if (session.metadata?.type !== 'orive_chat_credits') {
      return NextResponse.json({ error: 'Not a credit purchase' }, { status: 400 });
    }
    if (session.metadata?.visitorKey !== visitorKey) {
      return NextResponse.json({ error: 'Visitor mismatch' }, { status: 403 });
    }

    const plan = resolveChatCreditPlan(session.metadata?.plan);
    if (!plan) {
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
    }

    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;

    const balance = grantChatCredits({
      visitorKey,
      plan,
      stripeSessionId: session.id,
      stripeCustomerId: customerId,
    });

    return NextResponse.json({
      balance: {
        remaining: Number.isFinite(balance.remaining) ? balance.remaining : null,
        freeRemaining: balance.freeRemaining,
        prepaid: balance.prepaid,
        lifetime: balance.lifetime,
        graceUsed: balance.graceUsed,
      },
    });
  } catch (err) {
    console.error('[chat/credits/confirm]', err);
    return NextResponse.json({ error: 'Confirm failed' }, { status: 500 });
  }
}
