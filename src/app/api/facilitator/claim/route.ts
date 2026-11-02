import { NextResponse } from 'next/server';
import { getFacilitatorById } from '@/data/facilitatorsData';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CLAIMED_FILE = path.resolve(process.cwd(), 'src/data/claimedFacilitators.json');
const OUTREACH_LOG_FILE = path.resolve(process.cwd(), 'src/data/outreachLog.json');

function getClaimedList(): Record<string, any> {
  try {
    if (fs.existsSync(CLAIMED_FILE)) {
      const data = fs.readFileSync(CLAIMED_FILE, 'utf-8');
      return JSON.parse(data || '{}');
    }
  } catch (e) {
    console.warn('[Claim] Error reading claimed list:', e);
  }
  return {};
}

function saveClaimed(id: string, record: any) {
  try {
    const list = getClaimedList();
    list[id] = {
      ...record,
      claimedAt: new Date().toISOString(),
      calendarActive: true,
    };
    fs.writeFileSync(CLAIMED_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Claim] Error saving claimed record:', e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    const allClaimed = getClaimedList();
    return NextResponse.json({ claimed: allClaimed });
  }

  const fac = getFacilitatorById(id);
  const claimedList = getClaimedList();
  const isClaimed = Boolean(claimedList[id] || fac?.isClaimed);

  // Fetch pending inquiries for this facilitator
  let pendingInquiries: any[] = [];
  try {
    if (fs.existsSync(OUTREACH_LOG_FILE)) {
      const content = fs.readFileSync(OUTREACH_LOG_FILE, 'utf-8');
      const allLogs = JSON.parse(content || '[]');
      pendingInquiries = allLogs.filter((log: any) => log.facilitatorId === id);
    }
  } catch {}

  return NextResponse.json({
    id,
    name: fac?.name || 'Facilitator',
    isClaimed,
    calendarActive: isClaimed,
    facilitator: fac,
    pendingInquiries,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facilitatorId, email, name } = body;

    if (!facilitatorId) {
      return NextResponse.json({ error: 'Missing facilitatorId' }, { status: 400 });
    }

    const claimEmail = String(email || '').trim();
    if (!claimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claimEmail) || /@partner\.orive\.co$/i.test(claimEmail)) {
      return NextResponse.json({ error: 'A real email is required to claim.' }, { status: 400 });
    }

    const fac = getFacilitatorById(facilitatorId);
    const facilitatorName = name || fac?.name || 'Facilitator';

    saveClaimed(facilitatorId, {
      facilitatorId,
      name: facilitatorName,
      email: claimEmail,
      status: 'claimed',
    });

    // Update any logs for this facilitator
    try {
      if (fs.existsSync(OUTREACH_LOG_FILE)) {
        const content = fs.readFileSync(OUTREACH_LOG_FILE, 'utf-8');
        let allLogs = JSON.parse(content || '[]');
        allLogs = allLogs.map((log: any) => {
          if (log.facilitatorId === facilitatorId) {
            return { ...log, status: 'claimed_calendar_unlocked' };
          }
          return log;
        });
        fs.writeFileSync(OUTREACH_LOG_FILE, JSON.stringify(allLogs, null, 2), 'utf-8');
      }
    } catch {}

    console.log(`[ORIVE Facilitator Claim] Facilitator "${facilitatorName}" (${facilitatorId}) successfully claimed profile and activated calendar!`);

    return NextResponse.json({
      success: true,
      message: `Profil für ${facilitatorName} beansprucht. Termine im dezk veröffentlichen.`,
      facilitatorId,
      calendarActive: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to claim facilitator profile', details: error.message },
      { status: 500 }
    );
  }
}
