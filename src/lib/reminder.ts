import { renderReminderEmail, sendEmail } from "@/lib/email";
import { listReminderBookings, markReminderSent } from "@/lib/oriveStore";

function canMail(email?: string | null) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (/@partner\.orive\.co$/i.test(value) || /@example\.com$/i.test(value)) return false;
  return true;
}

export async function sendDueReminders() {
  const due = await listReminderBookings();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://orive.co";
  const results: { id: string; sent: boolean }[] = [];
  for (const booking of due) {
    if (!canMail(booking.customerEmail)) {
      await markReminderSent(booking.id);
      results.push({ id: booking.id, sent: false });
      continue;
    }
    const when = new Date(booking.startAt);
    const letter = renderReminderEmail({
      sessionTitle: booking.sessionTitle,
      clientName: booking.customerName || "Gast",
      whenLabel: Number.isNaN(when.getTime())
        ? booking.startAt
        : when.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }),
      location: booking.location,
      bookingPassUrl: `${origin}/booking/${encodeURIComponent(booking.id)}`,
    });
    const sent = await sendEmail({
      to: booking.customerEmail,
      subject: letter.subject,
      html: letter.html,
    });
    if (!sent.success) {
      results.push({ id: booking.id, sent: false });
      continue;
    }
    await markReminderSent(booking.id);
    results.push({ id: booking.id, sent: true });
  }
  return results;
}
