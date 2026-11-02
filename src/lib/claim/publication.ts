import crypto from "crypto";
import { serverDb } from "@/lib/serverDb";
import { suppressionKey } from "./claimToken";

/**
 * Batch release + one-click opt-out + outreach lifecycle. SERVER ONLY.
 * - Robert approves a release batch -> publish_release_batch() sets claimable_profiles.published_at/release_batch_id
 *   and facilitator_outreach.published_at; the activation mail goes out in the SAME explicit send step (not automatic).
 * - Every published profile has an opt-out token (only sha256 stored). /profil/ausblenden?token=… hides profile +
 *   offers immediately (hidden_at) and offers full deletion.
 * - computeOutreachDue(): day 7/14/21 reminders while no response; day 28 auto-unpublish. Pure + dry-run friendly.
 */
export const OPTOUT_RE = /^[A-Za-z0-9_-]{43}$/;
export function newOptOutToken() { const token = crypto.randomBytes(32).toString("base64url"); return { token, hash: hashOptOut(token) }; }
export const hashOptOut = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export type OptOutResult = { ok: true; name: string } | { ok: false };
export interface PublicationRepo {
  hideByTokenHash(hash: string): Promise<{ name: string; sourceId: string | null; email: string | null } | null>;
  deleteByTokenHash(hash: string, suppressKeys: string[]): Promise<boolean>;
  peekByTokenHash(hash: string): Promise<{ name: string; sourceId: string | null; email: string | null; hidden: boolean } | null>;
}
let override: PublicationRepo | null = null;
export function setPublicationRepoForTests(r: PublicationRepo | null) { override = r; }
function repo(): PublicationRepo | null {
  if (override) return override;
  const db = serverDb();
  if (!db) return null;
  const one = (d: any) => (Array.isArray(d) ? d[0] : d) || null;
  return {
    async peekByTokenHash(hash) {
      const { data } = await db.from("claimable_profiles").select("display_name,source_facilitator_id,contact_email,hidden_at").eq("opt_out_token_hash", hash).maybeSingle();
      return data ? { name: data.display_name, sourceId: data.source_facilitator_id, email: data.contact_email, hidden: !!data.hidden_at } : null;
    },
    async hideByTokenHash(hash) {
      const { data, error } = await db.rpc("hide_profile_by_optout", { p_token_hash: hash });
      const r = one(data);
      return error || !r ? null : { name: r.display_name, sourceId: r.source_facilitator_id, email: r.contact_email };
    },
    async deleteByTokenHash(hash, keys) {
      const { data, error } = await db.rpc("delete_profile_by_optout", { p_token_hash: hash, p_suppress_keys: keys });
      return !error && data === true;
    },
  };
}

/** One click: hide profile + all offers now. Idempotent. Unknown token -> {ok:false} (same UI, no enumeration). */
export async function hideByOptOutToken(token: string): Promise<OptOutResult> {
  const r = OPTOUT_RE.test(token) ? repo() : null;
  const row = r && (await r.hideByTokenHash(hashOptOut(token)));
  return row ? { ok: true, name: row.name } : { ok: false };
}
/** Full deletion (+ suppression so the crawler import never re-creates it). */
export async function deleteByOptOutToken(token: string): Promise<boolean> {
  const r = OPTOUT_RE.test(token) ? repo() : null;
  if (!r) return false;
  const h = hashOptOut(token);
  const row = await r.peekByTokenHash(h);
  if (!row) return false;
  const keys = [row.sourceId && suppressionKey("source", row.sourceId), row.email && suppressionKey("email", row.email)].filter(Boolean) as string[];
  return r.deleteByTokenHash(h, keys);
}

// ---------------------------------------------------------------------------------------------- outreach lifecycle
export type Outreach = {
  locale?: string | null; website_lang?: string | null;   // 20261104 migration; chosen once by the send step
  claimable_profile_id: string; published_at: string | null; activation_sent_at: string | null;
  reminder1_sent_at: string | null; reminder2_sent_at: string | null; reminder3_sent_at: string | null;
  responded_at: string | null; response_type: "confirmed" | "opt_out" | "deleted" | null;
  unpublished_at: string | null; unpublish_reason: string | null;
};
export type OutreachAction =
  | { kind: "reminder"; n: 1 | 2 | 3; id: string; dueSince: string }
  | { kind: "unpublish"; id: string; reason: "no_response_after_reminder3"; dueSince: string };
const DAY = 864e5;
export const REMINDER_DAYS = [7, 14, 21] as const;
export const UNPUBLISH_DAY = 28;

/**
 * Due actions at `now`. Days count from activation_sent_at (day 0). Rules:
 * - nothing for rows that responded, are unpublished, or never got the activation mail;
 * - reminder n due at day 7n only if reminder n-1 was sent (no skipping, no double sends);
 * - reminder n+1 also needs >= 7 days since reminder n (late cron runs don't bunch mails);
 * - unpublish due once reminder 3 is >= 7 days old AND day >= 28 (i.e. within 7 days after reminder 3).
 */
export function computeOutreachDue(rows: Outreach[], now = Date.now()): OutreachAction[] {
  const out: OutreachAction[] = [];
  const t = (s: string | null) => (s ? +new Date(s) : NaN);
  for (const r of rows) {
    if (r.responded_at || r.unpublished_at || !r.published_at || !r.activation_sent_at) continue;
    const d0 = t(r.activation_sent_at);
    const sent = [r.reminder1_sent_at, r.reminder2_sent_at, r.reminder3_sent_at].map(t);
    const next = sent.findIndex((x) => isNaN(x));
    if (next >= 0) {
      const prev = next === 0 ? d0 : sent[next - 1];
      const due = Math.max(d0 + REMINDER_DAYS[next] * DAY, prev + 7 * DAY);
      if (now >= due) out.push({ kind: "reminder", n: (next + 1) as 1 | 2 | 3, id: r.claimable_profile_id, dueSince: new Date(due).toISOString() });
    } else {
      const due = Math.max(d0 + UNPUBLISH_DAY * DAY, sent[2] + 7 * DAY);
      if (now >= due) out.push({ kind: "unpublish", id: r.claimable_profile_id, reason: "no_response_after_reminder3", dueSince: new Date(due).toISOString() });
    }
  }
  return out;
}
