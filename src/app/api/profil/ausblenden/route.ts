import { NextResponse } from "next/server";
import { deleteByOptOutToken, hideByOptOutToken } from "@/lib/claim/publication";
import { clientKey } from "@/lib/rateLimit";
import { rateLimitShared } from "@/lib/rateLimitShared";
import { guard } from "../../claim/_shared";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };

/**
 * Two callers:
 * 1) RFC 8058 one-click unsubscribe from mail clients: POST /api/profil/ausblenden?token=… with body
 *    "List-Unsubscribe=One-Click". Cross-origin by nature -> NO origin check, only rate limit; HIDE ONLY, never delete;
 *    answers 200 (no redirect) – mail providers don't follow redirects.
 * 2) Form POST from /profil/ausblenden (same origin, checked): action=hide (default) | delete (needs confirm=1),
 *    303 back to the page with a neutral status (no token enumeration).
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.text().catch(() => "");
  const form = new URLSearchParams(body);
  if (form.get("List-Unsubscribe") === "One-Click") {
    if (!(await rateLimitShared(`profil-optout-1click:${clientKey(req)}`, 20))) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: NO_STORE });
    await hideByOptOutToken(url.searchParams.get("token") || "").catch(() => ({ ok: false }));
    return NextResponse.json({ ok: true }, { headers: NO_STORE });   // same answer for unknown tokens
  }
  const blocked = await guard(req, "profil-optout", 10);
  if (blocked) return blocked;
  const token = form.get("token") || url.searchParams.get("token") || "";
  const action = form.get("action") || "hide";
  const lang = (form.get("lang") || "").replace(/[^a-z]/g, "").slice(0, 3);
  let state: string;
  if (action === "delete") {
    state = form.get("confirm") === "1" ? ((await deleteByOptOutToken(token).catch(() => false)) ? "deleted" : "invalid") : "confirm";
  } else {
    state = (await hideByOptOutToken(token).catch(() => ({ ok: false }))).ok ? "hidden" : "invalid";
  }
  const q = new URLSearchParams({ status: state, ...(state === "hidden" || state === "confirm" ? { token } : {}), ...(lang ? { lang } : {}) });
  return NextResponse.redirect(new URL(`/profil/ausblenden?${q}`, req.url), { status: 303, headers: NO_STORE });
}
