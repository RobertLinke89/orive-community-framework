import { NextResponse } from 'next/server';
import {
  appendChatMessages,
  createChatSession,
  deleteChatSession,
  getChatSession,
  type ChatSessionOffering,
} from '@/lib/chatSessions';
import { normalizeVisitorKey } from '@/lib/chatCredits';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

function visitorFrom(req: Request, body?: { visitorKey?: string }) {
  return normalizeVisitorKey(
    body?.visitorKey || req.headers.get('x-orive-client-token')
  );
}

export async function GET(req: Request, { params }: Ctx) {
  const visitorKey = visitorFrom(req);
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }
  const session = getChatSession(params.id, visitorKey);
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function POST(req: Request, { params }: Ctx) {
  const body = await req.json().catch(() => ({}));
  const visitorKey = visitorFrom(req, body);
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }

  let session = getChatSession(params.id, visitorKey);
  if (!session) {
    session = createChatSession({ id: params.id, visitorKey }) || null;
  }
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return NextResponse.json({ session });
  }

  const normalized = messages
    .slice(0, 4)
    .map((item: {
      role?: string;
      text?: string;
      offerings?: ChatSessionOffering[];
      directory?: unknown;
      whatsapp?: string | null;
    }) => ({
      role: item.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      text: String(item.text || '').slice(0, 4000),
      offerings: Array.isArray(item.offerings) ? item.offerings : undefined,
      directory: item.role === 'assistant' && item.directory && typeof item.directory === 'object' ? item.directory : undefined,
      whatsapp: item.whatsapp || null,
    }))
    .filter((item) => item.text.trim());

  const updated = appendChatMessages(params.id, visitorKey, normalized);
  if (!updated) {
    return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  }
  return NextResponse.json({ session: updated });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const visitorKey = visitorFrom(req);
  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }
  const ok = deleteChatSession(params.id, visitorKey);
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
