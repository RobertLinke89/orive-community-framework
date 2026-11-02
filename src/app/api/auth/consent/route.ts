import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { accountConsentStore, buildAccountConsent } from "@/lib/accountConsent";
import { ACCOUNT_CONSENT_VERSION, parseAccountConsent } from "@/lib/account-consent-text";
import { guard, json } from "../../claim/_shared";

export const dynamic = "force-dynamic";

/** GET -> { consented } for the signed-in user (Bearer). Used by /auth/callback after every OAuth / e-mail sign-in. */
export async function GET(req: Request) {
  const blocked = await guard(req, "auth-consent", 30);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user) return json({ error: "unauthenticated" }, 401);
  const store = accountConsentStore();
  if (!store) return json({ error: "unavailable" }, 503);
  return json({ consented: !!(await store.get(user.userId, ACCOUNT_CONSENT_VERSION)), version: ACCOUNT_CONSENT_VERSION });
}

/** POST { consent: { granted: true, version, lang } } – records the account consent (terms + Art. 9) server-side. */
export async function POST(req: Request) {
  const blocked = await guard(req, "auth-consent", 10);
  if (blocked) return blocked;
  const user = await facilitatorFromRequest(req);
  if (!user) return json({ error: "unauthenticated" }, 401);
  const body = await req.json().catch(() => null);
  const c = parseAccountConsent(body?.consent);
  if (!c) return json({ error: "consent_required" }, 422);
  const store = accountConsentStore();
  if (!store) return json({ error: "unavailable" }, 503);
  await store.insert(buildAccountConsent(user.userId, c, req));
  return json({ ok: true, consented: true });
}
