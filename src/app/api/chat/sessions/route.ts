import { NextResponse } from 'next/server';
import {
  createChatSession,
  listChatSessions,
  isChatSessionId,
} from '@/lib/chatSessions';
import { normalizeVisitorKey } from '@/lib/chatCredits';

export const dynamic = 'force-dynamic';

function visitorFrom(req: Request, body?: { visitorKey?: string }) {
  return normalizeVisitorKey(
    body?.visitorKey || req.headers.get('x-orive-client-token')
  );
}

export async function GET(req: Request) {
  const visitorKey = visitorFrom(req);
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }
  return NextResponse.json({ sessions: listChatSessions(visitorKey) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const visitorKey = visitorFrom(req, body);
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }
  const id = String(body.id || crypto.randomUUID());
  if (!isChatSessionId(id)) {
    return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  }
  const session = createChatSession({
    id,
    visitorKey,
    title: typeof body.title === 'string' ? body.title : undefined,
  });
  if (!session) {
    return NextResponse.json({ error: 'Could not create session' }, { status: 403 });
  }
  return NextResponse.json({ session });
}
