import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { completeClaim } from "@/lib/claim/service";
import { ClaimError } from "@/lib/claim/types";
import { guard, json, captcha } from "../_shared";
import { clientHash } from "@/lib/consent";
import { accountConsentStore } from "@/lib/accountConsent";
import { ACCOUNT_CONSENT_VERSION } from "@/lib/account-consent-text";

export const dynamic = "force-dynamic";

const STATUS: Record<string, number> = { claim_invalid: 404, claim_expired: 410, claim_used: 409, claim_user_has_profile: 409, consent_required: 422, unavailable: 503 };

/** POST { token } with Authorization: Bearer <supabase access token>. Draft -> live. */
export async function POST(req: Request) {
  const blocked = await guard(req, "claim-complete", 10);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user) return json({ error: "unauthenticated" }, 401);
  const body = await req.json().catch(() => null);
  const failed = await captcha(req, body, "claim");
  if (failed) return failed;
  const token = typeof body?.token === "string" ? body.token : "";
  try {
    // consent either sent with this request (ticked on the claim page) or already recorded via /auth/callback
    let consent = body?.accountConsent;
    if (!consent) {
      const rec = await accountConsentStore()?.get(user.userId, ACCOUNT_CONSENT_VERSION).catch(() => null);
      if (rec) consent = { granted: true, version: ACCOUNT_CONSENT_VERSION, lang: rec.lang };
    }
    const r = await completeClaim(token, { id: user.userId, name: user.name.includes("@") ? "" : user.name }, consent, clientHash(req));
    return json({ ok: true, slug: r.slug, category: r.category, path: r.path, shareUrl: r.shareUrl });
  } catch (e) {
    const code = e instanceof ClaimError ? e.code : "unavailable";
    return json({ error: code }, STATUS[code] ?? 500);
  }
}
