import { NextResponse } from 'next/server';
import { appOrigin, isSameOrigin } from '@/lib/appOrigin';
import { allowStripeSimulation } from '@/lib/payments';
import { clientKey } from '@/lib/rateLimit';
import { rateLimitShared } from '@/lib/rateLimitShared';
import { verifyTurnstile, clientIp, turnstileTokenFrom } from '@/lib/turnstile';
import { GENERIC_ERROR, logError } from '@/lib/safeLog';
import { getStripe } from '@/lib/stripeClient';
import { formationTotalCents } from '@/lib/formationPricing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  if (!(await rateLimitShared(`formation:${clientKey(req)}`, 5, 60_000))) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  try {
    const body = await req.json().catch(() => ({}));
    const captcha = await verifyTurnstile(turnstileTokenFrom(req, body), { ip: clientIp(req), action: 'checkout' });
    if (!captcha.ok) return NextResponse.json({ error: 'Captcha check failed.' }, { status: 403 });
    const companyName = String(body.companyName || '').trim().slice(0, 120);
    const tier = String(body.tier || '');
    const founderEmail = String(body.founderEmail || '').trim().slice(0, 255);
    const vatNumber = String(body.vatNumber || '').trim().slice(0, 20);
    const country = String(body.country || '').trim().slice(0, 2);
    // Reverse charge only with a plausible VAT id (format check; VIES validation still TODO).
    const isReverseCharge = body.isReverseCharge === true && /^[A-Z]{2}[A-Z0-9]{6,14}$/i.test(vatNumber);
    const amountCents = formationTotalCents({ tier, addons: body.addons, isReverseCharge });
    if (!companyName || amountCents === null || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founderEmail)) {
      return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
    }

    const stripe = getStripe();
    if (stripe) {
      const origin = appOrigin();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `EU Inc. Formation - ${tier.toUpperCase()}` },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: founderEmail,
        // D3: no names/company/VAT in Stripe metadata — only what reconciliation needs.
        metadata: { type: 'orive_formation', tier, reverseCharge: isReverseCharge ? 'true' : 'false', country: country.toUpperCase() },
        success_url: `${origin}/formation/confirmation?id=EU-{CHECKOUT_SESSION_ID}&tier=${encodeURIComponent(tier)}`,
        cancel_url: `${origin}/formation/checkout?tier=${encodeURIComponent(tier)}`,
      });
      return NextResponse.json({ url: session.url, sessionId: session.id, amountCents });
    }

    if (!allowStripeSimulation()) {
      return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });
    }
    const trackingId = `EU-${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({ success: true, mode: 'direct_simulation', trackingId, amountCents, message: 'Local Stripe simulation only.' });
  } catch (error) {
    logError('formation.checkout', error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
