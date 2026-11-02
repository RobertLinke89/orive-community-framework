import { NextResponse } from 'next/server';
import { getFacilitatorById } from '@/data/facilitatorsData';
import { sendEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface BookingInquiryPayload {
  facilitatorId: string;
  facilitatorName?: string;
  sessionTitle: string;
  sessionPrice?: string;
  sessionDuration?: number;
  preferredDate: string;
  preferredTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  sourceUrl?: string;
}

const OUTREACH_LOG_FILE = path.resolve(process.cwd(), 'src/data/outreachLog.json');

function appendOutreachLog(entry: unknown) {
  try {
    let logs: unknown[] = [];
    if (fs.existsSync(OUTREACH_LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(OUTREACH_LOG_FILE, 'utf-8') || '[]');
    }
    logs.unshift(entry);
    if (logs.length > 200) logs = logs.slice(0, 200);
    fs.writeFileSync(OUTREACH_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Inquiry] Could not persist log:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body: BookingInquiryPayload = await request.json();
    const {
      facilitatorId,
      sessionTitle,
      preferredDate,
      preferredTime,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = body;

    if (!facilitatorId || !sessionTitle || !preferredDate || !preferredTime || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required inquiry fields.' },
        { status: 400 }
      );
    }

    const fac = getFacilitatorById(facilitatorId);
    const facilitatorName = body.facilitatorName || fac?.name || 'Facilitator';
    const inquiryId = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const opsEmail = process.env.ORIVE_OPS_EMAIL;

    let notified = false;
    let emailStatus = 'not_sent';

    if (opsEmail) {
      const result = await sendEmail({
        to: opsEmail,
        subject: `ORIVE inquiry · ${sessionTitle}`,
        html: `<p>${clientName} (${clientEmail}) asked about "${sessionTitle}" with ${facilitatorName} on ${preferredDate} ${preferredTime}.</p>${notes ? `<p>${notes}</p>` : ''}${clientPhone ? `<p>Phone: ${clientPhone}</p>` : ''}`,
        from: 'ORIVE <onboarding@resend.dev>',
      });
      notified = result.success && result.mode === 'resend';
      emailStatus = result.mode === 'resend' && result.success ? 'sent_to_ops' : 'ops_email_failed';
    }

    const logEntry = {
      inquiryId,
      timestamp: new Date().toISOString(),
      facilitatorId,
      facilitatorName,
      sessionTitle,
      preferredDate,
      preferredTime,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      notes: notes || null,
      emailStatus,
      status: 'inquiry_only',
    };
    appendOutreachLog(logEntry);

    return NextResponse.json({
      success: true,
      inquiryId,
      notified,
      emailStatus,
      message: notified
        ? 'Inquiry recorded and forwarded to ORIVE.'
        : 'Inquiry recorded. This is not a booking. The facilitator was not notified automatically.',
    });
  } catch (error: any) {
    console.error('[Inquiry] handler error:', error);
    return NextResponse.json(
      { error: 'Failed to record inquiry', details: error.message },
      { status: 500 }
    );
  }
}
