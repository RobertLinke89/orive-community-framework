import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { claimRepo } from "@/lib/claim/repo";
import { validateOfferPatch } from "@/lib/claim/service";
import { guard, json } from "../../_shared";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: { params: { offerId: string } }) {
  const blocked = await guard(req, "claim-offer", 30);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user) return json({ error: "unauthenticated" }, 401);
  if (!UUID.test(params.offerId)) return json({ error: "not_found" }, 404);
  const patch = validateOfferPatch(await req.json().catch(() => null));
  if (!patch) return json({ error: "invalid" }, 400);
  const offer = await claimRepo().updateOffer(user.userId, params.offerId, patch);
  return offer ? json({ ok: true, offer }) : json({ error: "not_found" }, 404);
}

export async function DELETE(req: Request, { params }: { params: { offerId: string } }) {
  const blocked = await guard(req, "claim-offer", 30);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user) return json({ error: "unauthenticated" }, 401);
  if (!UUID.test(params.offerId)) return json({ error: "not_found" }, 404);
  return (await claimRepo().deleteOffer(user.userId, params.offerId)) ? json({ ok: true }) : json({ error: "not_found" }, 404);
}
