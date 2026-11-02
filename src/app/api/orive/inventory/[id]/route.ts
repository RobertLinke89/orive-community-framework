import { NextResponse } from 'next/server';
import { getInventoryItem } from '@/lib/oriveStore';
import { toPublicOffering } from '@/lib/orivePublic';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = await getInventoryItem(params.id);
  if (!item) {
    return NextResponse.json({ error: 'Not an ORIVE-sold listing.' }, { status: 404 });
  }
  return NextResponse.json({
    offering: toPublicOffering(item.offering, item.slots),
    raw: item.offering,
    slots: item.slots,
  });
}
