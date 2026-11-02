import { NextResponse } from 'next/server';
import { answerConcierge } from '@/lib/sofiaConcierge';
import {
  normalizeVisitorKey,
  evaluateChatCreditAccess,
  consumeChatCredits,
  type ChatCreditBalance,
} from '@/lib/chatCredits';
import {
  attachLowBalanceNudge,
  creditExhaustedMessage,
} from '@/lib/chatCreditEngine';
import { geminiConciergeReply } from '@/lib/geminiConcierge';

export const dynamic = 'force-dynamic';

const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || row.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  row.count += 1;
  return row.count <= 20;
}

async function sofiaUpstream(message: string, language: 'de' | 'en') {
  const base = process.env.SOFIA_SERVER_URL?.replace(/\/$/, '');
  if (!base) return null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.SOFIA_API_KEY) headers['x-api-key'] = process.env.SOFIA_API_KEY;
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, language: language.toUpperCase(), voiceId: 'sofia' }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const text = data?.reply || data?.message || data?.content;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

function serializeBalance(balance: ChatCreditBalance) {
  return {
    remaining: Number.isFinite(balance.remaining) ? balance.remaining : null,
    freeRemaining: balance.freeRemaining,
    prepaid: balance.prepaid,
    lifetime: balance.lifetime,
    graceUsed: balance.graceUsed,
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || '').slice(0, 4000);
  const languageHint = body.language === 'de' || body.language === 'en' ? body.language : undefined;
  const visitorKey = normalizeVisitorKey(
    body.visitorKey || req.headers.get('x-orive-client-token')
  );

  if (!visitorKey) {
    return NextResponse.json({ error: 'Missing visitor key' }, { status: 400 });
  }

  const { balance: before, priced, decision } = evaluateChatCreditAccess(visitorKey, message);
  const lang: 'de' | 'en' = languageHint || (/[äöüß]|(\b(ich|und|oder|suche|bitte)\b)/i.test(message) ? 'de' : 'en');

  if (!decision.canProceed) {
    return NextResponse.json(
      {
        error: 'credits_exhausted',
        needsCredits: true,
        creditCost: priced.creditCost,
        habitType: priced.habitType,
        balance: serializeBalance(before),
        reply: creditExhaustedMessage(lang, priced.habitType),
      },
      { status: 402 }
    );
  }

  const local = await answerConcierge(message, languageHint);

  if (!local.crisis) {
    try {
      const gemini = await geminiConciergeReply({
        message,
        language: local.language,
        offerings: local.offerings,
      });
      if (gemini) {
        local.reply = local.offerings.length
          ? `${gemini}\n\n${local.reply}`.trim()
          : gemini;
      } else {
        const upstream = await sofiaUpstream(message, local.language);
        if (upstream) {
          local.reply = `${upstream}\n\n${local.offerings.length ? local.reply : ''}`.trim();
        }
      }
    } catch {
      // Local catalog match is enough when Gemini / Sofia are offline.
    }
  }

  const consumed = consumeChatCredits(visitorKey, decision.isGrace ? 0 : priced.creditCost, {
    isGrace: decision.isGrace,
  });
  if (!consumed.ok) {
    return NextResponse.json(
      {
        error: 'credits_exhausted',
        needsCredits: true,
        balance: serializeBalance(consumed.balance),
        reply: creditExhaustedMessage(local.language, priced.habitType),
      },
      { status: 402 }
    );
  }

  const remaining = Number.isFinite(consumed.balance.remaining)
    ? consumed.balance.remaining
    : 999999;
  local.reply = attachLowBalanceNudge(
    local.reply,
    remaining,
    consumed.balance.lifetime,
    consumed.usedGrace,
    local.language,
  );

  const whatsapp = process.env.NEXT_PUBLIC_SOFIA_WHATSAPP?.replace(/\D/g, '') || '';
  return NextResponse.json({
    ...local,
    creditCost: decision.isGrace ? 0 : priced.creditCost,
    habitType: priced.habitType,
    usedGrace: consumed.usedGrace,
    balance: serializeBalance(consumed.balance),
    whatsapp: whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message || 'Breathwork Berlin')}`
      : null,
  });
}
