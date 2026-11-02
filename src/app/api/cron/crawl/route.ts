import { NextResponse } from 'next/server';
import { runCrawler } from '../../../../../scripts/crawler/index.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleCrawl(request);
}

export async function POST(request: Request) {
  return handleCrawl(request);
}

async function handleCrawl(request: Request) {
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
    const result = await runCrawler();
    return NextResponse.json({
      message: 'ORIVE Crawler sync completed successfully.',
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Crawler execution failed', details: err.message },
      { status: 500 }
    );
  }
}
