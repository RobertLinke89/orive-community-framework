import { NextResponse } from 'next/server';
import { catalogOfferings } from '@/data/catalogOfferings';
import type { PublicOffering } from '@/hooks/usePublicOfferings';
import { resolveViewer } from '@/lib/geo';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { toPublicOffering } from '@/lib/orivePublic';
import { listInventory } from '@/lib/oriveStore';
import { rankNearbySimilar } from '@/lib/similarOfferings';

export const dynamic = 'force-dynamic';

function parseType(value: string | null): PublicOffering['type'] {
  if (value === 'individual' || value === 'group' || value === 'event') return value;
  return 'event';
}

function seedFromRequest(url: URL, pool: PublicOffering[]): PublicOffering {
  const exclude = url.searchParams.get('exclude') || '';
  const found = pool.find((item) => item.id === exclude);
  if (found) return found;
  return {
    id: exclude || 'seed',
    title: url.searchParams.get('title') || '',
    description: null,
    type: parseType(url.searchParams.get('type')),
    price: null,
    duration: null,
    location: url.searchParams.get('location'),
    is_online: false,
    image_url: null,
    capacity: null,
    start_at: null,
    tags: (url.searchParams.get('tags') || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    facilitator_id: '',
  };
}

async function nearbyPool(): Promise<PublicOffering[]> {
  const seen = new Set<string>();
  const orive = (await listInventory())
    .filter((item) => item.slots.some((slot) => slot.spots > 0 && new Date(slot.startAt).getTime() > Date.now()))
    .map((item) => toPublicOffering(item.offering, item.slots));

  const catalog = catalogOfferings.filter((item) => isListableOfferingImage(item.image_url));
  const out: PublicOffering[] = [];
  for (const item of [...orive, ...catalog]) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(12, Math.max(4, Number(url.searchParams.get('limit') || 10) || 10));
  const viewer = await resolveViewer(req);
  const pool = await nearbyPool();
  const seed = seedFromRequest(url, pool);
  const offerings = rankNearbySimilar(pool, seed, viewer, limit);

  return NextResponse.json(
    {
      viewer: viewer
        ? { city: viewer.city || null, country: viewer.country || null }
        : null,
      offerings,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
