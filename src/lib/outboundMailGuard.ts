// Outbound mail guard. Default remains internal_only (robert.linke@me.com only).
// Mode directory_inquiries also allows a single enquiry-resolved facilitator address
// when the caller passes enquiryResolvedTo matching that To recipient.
const ALLOWED_ONLY = "robert.linke@me.com";

/** Internal notification recipient: ORIVE_INTERNAL_MAIL_TO (default robert.linke@me.com). */
export function internalRecipient(): string {
  return bareAddress(process.env.ORIVE_INTERNAL_MAIL_TO || ALLOWED_ONLY);
}

export function outboundMailMode(): "internal_only" | "directory_inquiries" {
  const v = (process.env.ORIVE_OUTBOUND_MAIL || "internal_only").trim().toLowerCase();
  if (v === "directory_inquiries") return "directory_inquiries";
  if (v !== "internal_only") {
    console.warn("[mail-guard] ORIVE_OUTBOUND_MAIL=" + v + " unsupported; internal_only");
  }
  return "internal_only";
}

/** Extracts the bare address from "Name <a@b.c>" / "a@b.c", lowercased. */
export function bareAddress(v: string): string {
  const s = String(v || "").trim();
  const m = /<([^<>]+)>\s*$/.exec(s);
  return (m ? m[1] : s).trim().toLowerCase();
}

/**
 * ok only if every recipient is allowed.
 * - internal_only: only robert.linke@me.com
 * - directory_inquiries: internal always; facilitator only if enquiryResolvedTo matches
 */
export function checkRecipients(
  to: string[],
  opts?: { enquiryResolvedTo?: string }
): { ok: boolean; blocked: number } {
  const mode = outboundMailMode();
  const list = (to || []).map(bareAddress).filter(Boolean);
  if (!list.length) return { ok: false, blocked: 1 };

  if (mode === "internal_only") {
    const blocked = list.filter((a) => a !== ALLOWED_ONLY).length;
    return { ok: blocked === 0, blocked: blocked || 0 };
  }

  const resolved = bareAddress(opts?.enquiryResolvedTo || "");
  const blocked = list.filter((a) => {
    if (a === ALLOWED_ONLY) return false;
    if (resolved && a === resolved) return false;
    return true;
  }).length;
  return { ok: blocked === 0, blocked };
}
