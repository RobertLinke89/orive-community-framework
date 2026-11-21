export type EnquiryMailInput = {
  facilitatorName: string;
  offerTitle: string;
  profileUrl: string;
  seekerName: string;
  seekerEmail: string;
  message: string;
  preferredDate: string | null;
  lang: string;
};

export function resolveEnquiryRecipient(
  facilitatorEmail: string | null,
  fallback: string
): { to: string; routedToFacilitator: boolean } {
  const toFac = facilitatorEmail && facilitatorEmail.trim() ? facilitatorEmail.trim().toLowerCase() : null;
  if (toFac) return { to: toFac, routedToFacilitator: true };
  return { to: fallback.trim().toLowerCase(), routedToFacilitator: false };
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDirectoryEnquiryEmail(input: EnquiryMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Neue Anfrage über ORIVE: ${input.offerTitle} – ${input.facilitatorName}`.slice(0, 180);
  const dateLine = input.preferredDate ? `Wunschtermin: ${input.preferredDate}` : "Wunschtermin: —";
  const text = [
    `Neue Anfrage über ORIVE`,
    ``,
    `Facilitator: ${input.facilitatorName}`,
    `Angebot: ${input.offerTitle}`,
    `Profil: ${input.profileUrl}`,
    ``,
    `Name: ${input.seekerName}`,
    `E-Mail: ${input.seekerEmail}`,
    dateLine,
    ``,
    `Nachricht:`,
    input.message,
    ``,
    `— ORIVE Concierge`,
  ].join("\n");
  const html = `<!DOCTYPE html><html lang="de"><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#01223F">
<p><strong>Neue Anfrage über ORIVE</strong></p>
<p>Facilitator: ${esc(input.facilitatorName)}<br/>
Angebot: ${esc(input.offerTitle)}<br/>
Profil: <a href="${esc(input.profileUrl)}">${esc(input.profileUrl)}</a></p>
<p>Name: ${esc(input.seekerName)}<br/>
E-Mail: ${esc(input.seekerEmail)}<br/>
${esc(dateLine)}</p>
<p><strong>Nachricht</strong><br/>${esc(input.message).replace(/\n/g, "<br/>")}</p>
<p style="color:#64748b;font-size:12px">Du kannst direkt auf diese Mail antworten (Reply-To = Anfragende*r).</p>
</body></html>`;
  return { subject, html, text };
}
