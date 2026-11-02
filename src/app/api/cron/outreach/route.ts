import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cronAuth";
import { serverDb } from "@/lib/serverDb";
import { computeOutreachDue, type Outreach } from "@/lib/claim/publication";

export const dynamic = "force-dynamic";

/**
 * Outreach lifecycle job (GET/POST, Bearer CRON_SECRET). DEFAULT = DRY RUN: returns due reminders + unpublishes.
 * ?apply=unpublish executes ONLY the day-28 unpublishes (rpc unpublish_outreach_due, no mail).
 * This route NEVER sends mail: reminders are listed for the explicit, separately approved Resend send step,
 * which must stamp reminderN_sent_at via rpc mark_outreach_sent after a successful send.
 * Runs on Vercel Cron, Hostinger crontab (curl) or Supabase pg_cron + pg_net alike.
 */
async function handle(req: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = serverDb();
  if (!db) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  const { data, error } = await db.from("facilitator_outreach").select("*").is("responded_at", null).is("unpublished_at", null).not("activation_sent_at", "is", null).limit(5000);
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 });
  const rows = (data || []) as Outreach[];
  const loc = new Map(rows.map((r) => [r.claimable_profile_id, r.locale || null]));
  const due = computeOutreachDue(rows).map((a) => ({ ...a, locale: loc.get(a.id) ?? null }));
  const apply = new URL(req.url).searchParams.get("apply") === "unpublish";
  let unpublished = 0;
  if (apply) {
    const ids = due.filter((d) => d.kind === "unpublish").map((d) => d.id);
    if (ids.length) { const r = await db.rpc("unpublish_outreach_due", { p_ids: ids }); unpublished = typeof r.data === "number" ? r.data : 0; }
  }
  return NextResponse.json({ dryRun: !apply, due, unpublished, mailsSent: 0 }, { headers: { "Cache-Control": "no-store" } });
}
export const GET = handle;
export const POST = handle;
