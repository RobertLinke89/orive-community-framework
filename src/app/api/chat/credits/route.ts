import { NextResponse } from 'next/server';
import { getChatCreditBalance, normalizeVisitorKey } from '@/lib/chatCredits';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const visitorKey = normalizeVisitorKey(
    req.headers.get('x-orive-client-token') || new URL(req.url).searchParams.get('visitor')
  );
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }
  const balance = getChatCreditBalance(visitorKey);
  return NextResponse.json({
    remaining: Number.isFinite(balance.remaining) ? balance.remaining : null,
    freeRemaining: balance.freeRemaining,
    prepaid: balance.prepaid,
    lifetime: balance.lifetime,
    freeMonth: balance.freeMonth,
    graceUsed: balance.graceUsed,
  });
}
