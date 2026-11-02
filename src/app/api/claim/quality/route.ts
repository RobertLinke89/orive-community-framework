import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { isAdmin } from "@/lib/claim/admin";
import { claimRepo } from "@/lib/claim/repo";
import { verifyClaimToken } from "@/lib/claim/claimToken";
import { tierFor } from "@/lib/claim/quality";
import { guard, json } from "../_shared";

export const dynamic = "force-dynamic";

/** POST { token } – quality score/tier of a draft, ADMIN ONLY (has_role admin). Everyone else gets 404. */
export async function POST(req: Request) {
  const blocked = await guard(req, "claim-quality", 30);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user || !(await isAdmin(user.userId))) return json({ error: "not_found" }, 404);
  const body = await req.json().catch(() => null);
  const v = verifyClaimToken(typeof body?.token === "string" ? body.token : "", Date.now(), { allowExpired: true });
  if (!v.ok) return json({ error: "not_found" }, 404);
  const row = await claimRepo().byTokenHash(v.hash);
  const score = row?.profile.quality_score;
  if (typeof score !== "number") return json({ score: null }, 200);
  return json({ score, tier: tierFor(score) });
}
