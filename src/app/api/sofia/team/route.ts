import { NextResponse } from 'next/server';
import { answerTeam, teamRoster } from '@/lib/sofiaTeam';
import { normalizeExpertId } from '@/lib/sofiaExperts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDe = url.searchParams.get('lang') !== 'en';
  return NextResponse.json(await teamRoster(isDe));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = String(body.message || '').slice(0, 800);
  const language = body.language === 'de' || body.language === 'en' ? body.language : undefined;
  const expert = body.expert ? normalizeExpertId(body.expert) : undefined;
  return NextResponse.json(await answerTeam({ message, expert, language }));
}
