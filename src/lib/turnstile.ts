/**
 * Cloudflare Turnstile server-side verification.
 * Env: TURNSTILE_SECRET_KEY (server), NEXT_PUBLIC_TURNSTILE_SITE_KEY (client widget).
 * Fail-closed in production when the secret is missing; skipped in dev/test without a secret.
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true; skipped?: boolean } | { ok: false; reason: "missing_token" | "invalid" | "not_configured" | "unreachable" };

const isProd = () => process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

export async function verifyTurnstile(token: unknown, opts: { ip?: string; action?: string; fetchImpl?: typeof fetch } = {}): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return isProd() ? { ok: false, reason: "not_configured" } : { ok: true, skipped: true };
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return { ok: false, reason: "missing_token" };
  const body = new URLSearchParams({ secret, response: token });
  if (opts.ip) body.set("remoteip", opts.ip);
  try {
    const res = await (opts.fetchImpl || fetch)(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { success?: boolean; action?: string; hostname?: string };
    if (!data.success) return { ok: false, reason: "invalid" };
    if (opts.action && data.action && data.action !== opts.action) return { ok: false, reason: "invalid" };
    const expectHost = process.env.TURNSTILE_EXPECTED_HOSTNAME;
    if (expectHost && data.hostname && data.hostname !== expectHost) return { ok: false, reason: "invalid" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

export function clientIp(req: Request) {
  return (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
}

/** Reads the token from the JSON body field `turnstileToken` or header `cf-turnstile-response`. */
export function turnstileTokenFrom(req: Request, body: Record<string, unknown> | null) {
  return (body && body.turnstileToken) || req.headers.get("cf-turnstile-response") || "";
}
