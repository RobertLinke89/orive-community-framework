import { renderReminderEmail, sendEmail } from "@/lib/email";
import { listReminderBookings, markReminderSent } from "@/lib/oriveStore";
import { bookingPassUrl } from "@/lib/legacyBookingLinks";

function canMail(email?: string | null) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (/@partner\.orive\.co$/i.test(value) || /@example\.com$/i.test(value)) return false;
  return true;
}

export async function sendDueReminders() {
  const due = await listReminderBookings();
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
      bookingPassUrl: bookingPassUrl(booking.id),
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
