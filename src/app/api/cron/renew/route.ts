import { NextResponse } from 'next/server';
import { renewAllOfferings } from '../../../../../scripts/renew-offerings.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleRenew(request);
}

export async function POST(request: Request) {
  return handleRenew(request);
}

async function handleRenew(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, enforce Bearer authentication
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid or missing CRON_SECRET token.' },
      { status: 401 }
    );
  }

  try {
    const stats = renewAllOfferings();
    return NextResponse.json({
      message: 'ORIVE Offerings schedule renewed successfully.',
      timestamp: new Date().toISOString(),
      ...stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Offerings renewal failed', details: err.message },
      { status: 500 }
    );
  }
}
