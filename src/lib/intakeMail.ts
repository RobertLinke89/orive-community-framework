import { renderFacilitatorIntakeEmail, sendEmail } from "@/lib/email";
import type { OriveBooking } from "@/lib/orivePublic";

function canMail(email?: string | null) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (/@partner\.orive\.co$/i.test(value)) return false;
  return true;
}

export async function notifyFacilitatorOfIntake(booking: OriveBooking) {
  if (!canMail(booking.facilitatorEmail) || !booking.intake?.length) return { sent: false };
  const template = renderFacilitatorIntakeEmail({
    sessionTitle: booking.sessionTitle,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    startAt: booking.startAt,
    location: booking.location,
    reference: booking.id,
    // D1: health-related answers stay in the dashboard; the e-mail only says they exist.
    intake: process.env.INTAKE_MAIL_INCLUDE_ANSWERS === "true"
      ? booking.intake
      : [{ questionId: "notice", prompt: "Intake", answer: "Antworten liegen vor – bitte im ORIVE-Dashboard ansehen." }],
  });
  const result = await sendEmail({
    to: booking.facilitatorEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: canMail(booking.customerEmail) ? booking.customerEmail : undefined,
  });
  return { sent: result.success, mode: result.mode };
}
