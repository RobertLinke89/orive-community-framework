/**
 * ORIVE Centralized Email Service
 * Supports Resend API with automated graceful fallback for testing & local development.
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  mode: 'resend' | 'simulated';
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from,
}: SendEmailParams): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toAddresses = Array.isArray(to) ? to : [to];

  // Default from address. If using resend domain in sandbox, use onboarding@resend.dev
  const sender = from || process.env.EMAIL_FROM || 'ORIVE Concierge <onboarding@resend.dev>';

  if (apiKey && !apiKey.startsWith('re_placeholder') && !apiKey.startsWith('test_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: toAddresses,
          subject,
          html,
          text: text || subject,
          reply_to: replyTo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Email Service] Successfully dispatched email via Resend to ${toAddresses.join(', ')} (ID: ${data?.id})`);
        return { success: true, messageId: data?.id, mode: 'resend' };
      } else {
        const errorText = await response.text();
        console.warn(`[Email Service] Resend API error: ${errorText}`);
        return { success: false, mode: 'resend', error: errorText };
      }
    } catch (err: any) {
      console.warn(`[Email Service] Network error during dispatch: ${err.message}`);
      return { success: false, mode: 'resend', error: err.message };
    }
  }

  // Graceful simulation fallback for local / testing environments
  const simId = `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[Email Service - Simulated] To: ${toAddresses.join(', ')} | Subject: "${subject}" | (SimID: ${simId})`);
  return {
    success: true,
    messageId: simId,
    mode: 'simulated',
  };
}

/**
 * Customer Booking Pass Email Template
 */
export function renderCustomerBookingPassEmail(booking: {
  reference: string;
  sessionTitle: string;
  date: string;
  time: string;
  duration: number;
  sessionPrice: string;
  clientName: string;
  facilitatorName: string;
  location?: string;
  bookingPassUrl: string;
}): { subject: string; html: string } {
  const subject = `Dein ORIVE Buchungspass: ${booking.sessionTitle} (${booking.reference})`;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1528; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #0f1d32; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .header { background: linear-gradient(135deg, #021d37 0%, #002b4e 100%); padding: 36px 28px; text-align: center; border-bottom: 1px solid rgba(0,205,172,0.2); }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #00CDAC; margin-bottom: 10px; }
    .ref-badge { display: inline-block; background: rgba(0,205,172,0.15); color: #00CDAC; border: 1px solid rgba(0,205,172,0.3); font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; letter-spacing: 1px; }
    .body { padding: 32px 28px; background: #0c182a; }
    .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; }
    .details { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .value { color: #f8fafc; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: linear-gradient(135deg, #00CDAC 0%, #02AAB0 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; margin: 24px 0 12px 0; text-align: center; }
    .footer { padding: 20px 28px; background: #08111e; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">ORIVE</div>
      <div class="ref-badge">PASS: ${booking.reference}</div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 16px 0 4px 0;">Buchung bestätigt</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Kein Login oder Passwort nötig · Minimaler Buchungspass</p>
    </div>
    <div class="body">
      <p style="color: #cbd5e1; font-size: 15px; margin-top: 0;">
        Hallo <strong>${booking.clientName}</strong>, deine Session mit <strong>${booking.facilitatorName}</strong> wurde verbindlich eingetragen.
      </p>
      
      <div class="details">
        <div class="row">
          <span class="label">Session</span>
          <span class="value">${booking.sessionTitle}</span>
        </div>
        <div class="row">
          <span class="label">Termin</span>
          <span class="value">${booking.date} · ${booking.time} Uhr</span>
        </div>
        <div class="row">
          <span class="label">Dauer</span>
          <span class="value">${booking.duration} Minuten</span>
        </div>
        <div class="row">
          <span class="label">Facilitator</span>
          <span class="value">${booking.facilitatorName}</span>
        </div>
        <div class="row">
          <span class="label">Ort / Modus</span>
          <span class="value">${booking.location || 'Studio & Online HD Stream'}</span>
        </div>
        <div class="row">
          <span class="label">Gesamtbetrag</span>
          <span class="value" style="color: #00CDAC;">${booking.sessionPrice} (Inkl. MwSt.)</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${booking.bookingPassUrl}" class="btn">
          🎫 Zum Live-Buchungspass (.ics Kalender)
        </a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 8px 0 0 0;">
        Über deinen Pass kannst du den Termin direkt in deinen Apple-, Google- oder Outlook-Kalender importieren sowie Nachrichten an deinen Facilitator senden.
      </p>
    </div>
    <div class="footer">
      ORIVE · Europäische Plattform für Wellbeing & Transformation<br>
      Stiftsgasse 17, 07407 Rudolstadt · contact@orive.app
    </div>
  </div>
</body>
</html>
`;
  return { subject, html };
}

/**
 * Payment Receipt Email Template (Tax and VAT compliant)
 */
export function renderPaymentReceiptEmail(receipt: {
  receiptNumber: string;
  bookingReference: string;
  sessionTitle: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  sessionAmount?: number;
  feeAmount?: number;
  currency?: string;
  date: string;
  bookingPassUrl: string;
}): { subject: string; html: string } {
  const currency = receipt.currency?.toUpperCase() || 'EUR';
  const fee = receipt.feeAmount ?? 1;
  const sessionAmount = receipt.sessionAmount ?? Math.max(receipt.amount - fee, 0);
  const totalGross = (sessionAmount + fee).toFixed(2);

  const subject = `Zahlungsbeleg ${receipt.receiptNumber} · ORIVE (${receipt.bookingReference})`;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #021d37; color: #ffffff; padding: 28px; text-align: center; }
    .content { padding: 28px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { text-align: left; padding: 8px 0; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #e2e8f0; border-bottom: none; }
    .btn { display: inline-block; background: #00CDAC; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 10px; font-size: 14px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px; letter-spacing: 2px; color: #00CDAC;">ORIVE</h2>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">Offizieller Zahlungsbeleg · ${receipt.receiptNumber}</p>
    </div>
    <div class="content">
      <p>Hallo ${receipt.clientName},</p>
      <p style="font-size: 14px; line-height: 1.5; color: #475569;">
        Die Session ist vorbei. Der Betrag wurde über Stripe abgebucht: der Satz geht an den Facilitator, 1,00 € an ORIVE.
      </p>

      <table class="table">
        <thead>
          <tr>
            <th>POSITION</th>
            <th style="text-align: right;">BETRAG</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${receipt.sessionTitle}<br><small style="color: #64748b;">Ref: ${receipt.bookingReference} · an den Facilitator</small></td>
            <td style="text-align: right;">${sessionAmount.toFixed(2)} ${currency}</td>
          </tr>
          <tr>
            <td>ORIVE Concierge</td>
            <td style="text-align: right;">${fee.toFixed(2)} ${currency}</td>
          </tr>
          <tr class="total-row">
            <td>Gesamt</td>
            <td style="text-align: right; color: #00A88F;">${totalGross} ${currency}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${receipt.bookingPassUrl}" class="btn">Pass aufrufen & Kalender sync</a>
      </div>
    </div>
    <div class="footer">
      heybotti · Robert Linke · Stiftsgasse 17, 07407 Rudolstadt · USt-IdNr gemäß § 27 a UStG<br>
      Dieser Beleg wurde elektronisch erstellt und ist ohne Unterschrift gültig.
    </div>
  </div>
</body>
</html>
`;
  return { subject, html };
}

export function renderReservationEmail(booking: {
  sessionTitle: string;
  clientName: string;
  whenLabel: string;
  sessionAmount: string;
  bookingPassUrl: string;
}): { subject: string; html: string } {
  const subject = `Platz reserviert · ${booking.sessionTitle}`;
  const html = `<!DOCTYPE html>
<html lang="de"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;padding:24px;">
  <p>Hallo ${escapeHtml(booking.clientName)},</p>
  <p>dein Platz für <strong>${escapeHtml(booking.sessionTitle)}</strong> am ${escapeHtml(booking.whenLabel)} ist reserviert.</p>
  <p>Deine Karte ist gespeichert. Abgebucht wird nach der Session: ${escapeHtml(booking.sessionAmount)} plus 1,00 € ORIVE Concierge. Bis 24 Stunden vor Beginn kannst du kostenfrei stornieren.</p>
  <p><a href="${booking.bookingPassUrl}">Buchung ansehen</a></p>
</body></html>`;
  return { subject, html };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderFacilitatorIntakeEmail(booking: {
  sessionTitle: string;
  customerName: string;
  customerEmail: string;
  startAt: string;
  location?: string | null;
  reference: string;
  intake: { prompt: string; answer: string }[];
}): { subject: string; html: string; text: string } {
  const when = new Date(booking.startAt);
  const whenLabel = Number.isNaN(when.getTime())
    ? booking.startAt
    : when.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  const subject = `Intake · ${booking.sessionTitle} · ${booking.customerName || booking.customerEmail}`;
  const text = [
    booking.sessionTitle,
    whenLabel,
    booking.location || "",
    "",
    booking.customerName,
    booking.customerEmail,
    `Ref ${booking.reference}`,
    "",
    ...booking.intake.flatMap((item) => [item.prompt, item.answer, ""]),
  ].join("\n");

  const answers = booking.intake.map((item) => `
    <p style="margin:16px 0 4px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#64748b;">${escapeHtml(item.prompt)}</p>
    <p style="margin:0;font-size:15px;line-height:1.5;color:#0f172a;white-space:pre-wrap;">${escapeHtml(item.answer)}</p>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:24px;background:#f4f6f8;font-family:Inter,Helvetica,Arial,sans-serif;color:#01223F;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;padding:28px;">
    <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#017F80;">ORIVE</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;">${escapeHtml(booking.sessionTitle)}</h1>
    <p style="margin:8px 0 0;font-size:14px;color:#64748b;">${escapeHtml(whenLabel)}${booking.location ? ` · ${escapeHtml(booking.location)}` : ""}</p>
    <p style="margin:20px 0 0;font-size:15px;">${escapeHtml(booking.customerName)}<br>${escapeHtml(booking.customerEmail)}</p>
    <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Ref ${escapeHtml(booking.reference)}</p>
    <div style="margin-top:8px;border-top:1px solid #e2e8f0;padding-top:8px;">${answers}</div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export function renderReminderEmail(booking: {
  sessionTitle: string;
  clientName: string;
  whenLabel: string;
  location?: string | null;
  bookingPassUrl: string;
}): { subject: string; html: string } {
  const place = booking.location ? ` Ort: ${escapeHtml(booking.location)}.` : "";
  const subject = `Morgen · ${booking.sessionTitle}`;
  const html = `<!DOCTYPE html>
<html lang="de"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;padding:24px;">
  <p>Hallo ${escapeHtml(booking.clientName)},</p>
  <p><strong>${escapeHtml(booking.sessionTitle)}</strong> ist am ${escapeHtml(booking.whenLabel)}.${place}</p>
  <p>Deine Karte ist gespeichert. Abgebucht wird nach der Session. Bis 24 Stunden vor Beginn kannst du kostenfrei stornieren.</p>
  <p><a href="${booking.bookingPassUrl}">Buchung ansehen</a></p>
</body></html>`;
  return { subject, html };
}

export function renderCancellationEmail(input: {
  to: "guest" | "facilitator";
  late: boolean;
  sessionTitle: string;
  who: string;
  whenLabel: string;
}): { subject: string; html: string } {
  const title = escapeHtml(input.sessionTitle);
  const when = escapeHtml(input.whenLabel);
  const who = escapeHtml(input.who);
  if (input.late) {
    return {
      subject: `Storno zu spät · ${input.sessionTitle}`,
      html: `<p>Die Stornierung für <strong>${title}</strong> am ${when} liegt innerhalb von 24 Stunden. Die Karte wird für die Session belastet.</p>`,
    };
  }
  if (input.to === "guest") {
    return {
      subject: `Termin abgesagt · ${input.sessionTitle}`,
      html: `<p>Hallo ${who},</p><p><strong>${title}</strong> am ${when} ist abgesagt. Es wird nichts belastet.</p>`,
    };
  }
  return {
    subject: `Storno · ${input.sessionTitle}`,
    html: `<p>${who} hat <strong>${title}</strong> am ${when} storniert. Der Platz ist wieder frei. Es wird nichts belastet.</p>`,
  };
}
