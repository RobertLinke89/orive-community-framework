import { optOut } from "@/lib/claim/service";
import { guard, json, captcha } from "../_shared";

export const dynamic = "force-dynamic";

/** POST { token } – GDPR: delete the prepared draft and suppress re-import. No login needed (link = proof). */
export async function POST(req: Request) {
  const blocked = await guard(req, "claim-optout", 5);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  const failed = await captcha(req, body, "optout");
  if (failed) return failed;
  const ok = await optOut(typeof body?.token === "string" ? body.token : "").catch(() => false);
  // Same answer for unknown tokens: no enumeration.
  return json({ ok: true, deleted: ok });
}
