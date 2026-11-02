import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { facilitatorFromRequest } from '@/lib/facilitatorAuth';
import { upsertProfile } from '@/lib/facilitatorPayout';
import { listInventory, publishOffering, resolveIntakeChoice } from '@/lib/oriveStore';
import { toPublicOffering } from '@/lib/orivePublic';
import { assertOfferingDescription } from '@/lib/offeringDescription';

export const dynamic = 'force-dynamic';

const CLAIMED_FILE = path.resolve(process.cwd(), 'src/data/claimedFacilitators.json');

function isRealEmail(email?: string | null) {
  const value = String(email || '').trim();
  if (!value) return false;
  if (/@partner\.orive\.co$/i.test(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isClaimed(facilitatorId: string) {
  try {
    if (!fs.existsSync(CLAIMED_FILE)) return false;
    const list = JSON.parse(fs.readFileSync(CLAIMED_FILE, 'utf-8') || '{}');
    return Boolean(list[facilitatorId]);
  } catch {
    return false;
  }
}

export async function GET() {
  const items = (await listInventory())
    .filter((item) => item.slots.some((slot) => slot.spots > 0 && new Date(slot.startAt).getTime() > Date.now()))
    .map((item) => ({
      ...toPublicOffering(item.offering, item.slots),
      slots: item.slots,
    }));
  return NextResponse.json({ offerings: items });
}

export async function POST(req: Request) {
  try {
    const publishKey = process.env.ORIVE_PUBLISH_KEY;
    const keyOk = Boolean(publishKey) && req.headers.get('x-orive-publish-key') === publishKey;
    const actor = await facilitatorFromRequest(req);
    if (!keyOk && !actor) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = await req.json();
    const title = String(body.title || '').trim();
    const facilitatorName = String(body.facilitatorName || actor?.name || '').trim();
    const facilitatorEmail = String(body.facilitatorEmail || actor?.email || '').trim().toLowerCase();
    const facilitatorId = String(body.facilitatorId || actor?.id || '').trim();
    if (actor && facilitatorEmail !== actor.email) {
      return NextResponse.json({ error: 'Publish with the signed-in email.' }, { status: 403 });
    }
    const startAt = String(body.startAt || '').trim();
    const priceEuros = Number(body.priceEuros ?? body.price);
    const spots = Number(body.spots);
    const start = new Date(startAt);

    if (!title || !facilitatorName || !facilitatorId) {
      return NextResponse.json({ error: 'Title, facilitator name and id are required.' }, { status: 400 });
    }
    if (!isRealEmail(facilitatorEmail)) {
      return NextResponse.json({ error: 'A real facilitator email is required.' }, { status: 400 });
    }
    if (!isClaimed(facilitatorId) && !actor) {
      return NextResponse.json({ error: 'Publish after the facilitator profile is claimed.' }, { status: 403 });
    }
    if (actor && !isClaimed(facilitatorId)) {
      upsertProfile({
        facilitatorId,
        email: facilitatorEmail,
        name: facilitatorName,
      });
    }
    const repeatWeeks = Math.min(8, Math.max(1, Math.floor(Number(body.repeatWeeks) || 1)));
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Start time must be a future date.' }, { status: 400 });
    }
    if (!Number.isFinite(priceEuros) || priceEuros <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0.' }, { status: 400 });
    }
    if (!Number.isFinite(spots) || spots < 1) {
      return NextResponse.json({ error: 'At least one spot is required.' }, { status: 400 });
    }

    const intake = await resolveIntakeChoice(
      body.intakeFormId ? String(body.intakeFormId) : null,
      body.lang === 'de',
    );
    if ('error' in intake) {
      return NextResponse.json({ error: intake.error }, { status: 400 });
    }

    let description: string;
    try {
      description = assertOfferingDescription(body.description, body.lang === 'de');
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Description too short.' }, { status: 400 });
    }

    const published = await publishOffering({
      title,
      description,
      type: body.type === 'individual' ? 'individual' : body.type === 'group' ? 'group' : 'event',
      location: body.location || null,
      is_online: Boolean(body.isOnline),
      tags: Array.isArray(body.tags) ? body.tags : body.category ? [String(body.category)] : [],
      facilitator_id: facilitatorId,
      facilitator_name: facilitatorName,
      facilitator_email: facilitatorEmail,
      duration: Number.isFinite(Number(body.duration)) ? Number(body.duration) : null,
      startAt: start.toISOString(),
      spots: Math.floor(spots),
      priceCents: Math.round(priceEuros * 100),
      intakeFormId: intake.id,
      intakeQuestions: intake.questions,
      repeatWeeks,
    });

    return NextResponse.json({
      success: true,
      offering: toPublicOffering(published.offering, published.slots),
      slots: published.slots,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to publish.' }, { status: 500 });
  }
}
