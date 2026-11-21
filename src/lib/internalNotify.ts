// Internal notifications (inquiries, claim requests, removal requests) -> internalRecipient() ONLY (robert.linke@me.com).
// Nobody else is ever mailed from here: the recipient is fixed and lib/email.ts enforces the allowlist again.
import { sendEmail } from "@/lib/email";
import { internalRecipient } from "@/lib/outboundMailGuard";

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function notifyInternal(opts: {
  kind: "Anfrage" | "Profil-Übernahme" | "Profil-Entfernung";
  title: string;
  rows: [string, string | null | undefined][];
  link?: string;
  replyTo?: string | null;
  host?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const staging = !!opts.host && !/(^|\.)orive\.co$/i.test(opts.host.split(":")[0]);
  const subject = `${staging ? "[staging] " : ""}[Orive intern] ${opts.kind}: ${opts.title}`.slice(0, 200);
  const rows = opts.rows.filter(([, v]) => v != null && String(v).trim() !== "") as [string, string][];
  const text = [
    `${opts.kind} – nur intern, niemand sonst wurde benachrichtigt.`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    opts.link ? `\nProfil: ${opts.link}` : "",
    "\nÜbersicht: https://orive.co/admin/anfragen",
  ].join("\n");
  const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Inter,Helvetica,Arial,sans-serif;color:#01223F;">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;padding:24px;">
<p style="margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#017F80;">ORIVE · intern</p>
<h1 style="margin:8px 0 4px;font-size:20px;font-weight:600;">${esc(opts.kind)}: ${esc(opts.title)}</h1>
<p style="margin:0 0 16px;font-size:13px;color:#64748b;">Nur an ${esc(internalRecipient())}. Der Facilitator und die absendende Person wurden nicht automatisch benachrichtigt.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 8px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap;">${esc(v)}</td></tr>`)
    .join("")}</table>
${opts.link ? `<p style="margin:18px 0 0;"><a href="${esc(opts.link)}" style="color:#017F80;">Profil ansehen</a> · <a href="https://orive.co/admin/anfragen" style="color:#017F80;">Interne Übersicht</a></p>` : `<p style="margin:18px 0 0;"><a href="https://orive.co/admin/anfragen" style="color:#017F80;">Interne Übersicht</a></p>`}
</div></body></html>`;
  try {
    const r = await sendEmail({
      to: internalRecipient(),
      subject,
      html,
      text,
      from: process.env.ORIVE_NOTIFY_FROM || "ORIVE intern <notify@orive.co>",
    });
    if (!r.success) console.error("[internal-notify] not sent:", r.error || r.mode);
    return { ok: r.success && r.mode === "resend", id: r.messageId, error: r.error };
  } catch (e: any) {
    console.error("[internal-notify] error");
    return { ok: false, error: "exception" };
  }
}
