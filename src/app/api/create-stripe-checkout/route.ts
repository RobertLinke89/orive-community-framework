import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      tier,
      amount,
      founderEmail,
      founderName,
      addons,
      isReverseCharge,
      vatNumber,
      country
    } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If a live/test secret key is provided in environment variables:
    if (stripeSecretKey && !stripeSecretKey.startsWith('sk_test_placeholder')) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-06-20' as any,
      });

      const origin = req.headers.get('origin') || 'http://localhost:8089';

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `EU Inc. Formation - ${tier.toUpperCase()}`,
              description: `Digital Company Formation for ${companyName} (${country?.toUpperCase() || 'EU'}) under Directive (EU) 2019/1151`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: founderEmail,
        metadata: {
          companyName,
          founderName,
          tier,
          vatNumber: vatNumber || 'N/A',
          isReverseCharge: isReverseCharge ? 'true' : 'false',
        },
        success_url: `${origin}/formation/confirmation?id=EU-{CHECKOUT_SESSION_ID}&name=${encodeURIComponent(companyName)}&tier=${tier}&amount=${amount}`,
        cancel_url: `${origin}/formation/checkout?name=${encodeURIComponent(companyName)}&tier=${tier}`,
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      return NextResponse.json(
        { error: 'Payments are not configured.' },
        { status: 503 }
      );
    }
    if (process.env.ALLOW_STRIPE_SIMULATION !== 'true') {
      return NextResponse.json(
        { error: 'Payments are not configured.' },
        { status: 503 }
      );
    }

    const trackingId = `EU-${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({
      success: true,
      mode: 'direct_simulation',
      trackingId,
      message: 'Local Stripe simulation only.',
    });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
