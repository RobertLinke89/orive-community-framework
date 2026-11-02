import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/appOrigin";
import { clientKey } from "@/lib/rateLimit";
import { rateLimitShared } from "@/lib/rateLimitShared";
import { verifyTurnstile, clientIp } from "@/lib/turnstile";

export const NO_STORE = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });

export async function guard(req: Request, bucket: string, limit = 10): Promise<NextResponse | null> {
  if (!isSameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (!(await rateLimitShared(`${bucket}:${clientKey(req)}`, limit))) return json({ error: "rate_limited" }, 429);
  return null;
}

/** Turnstile check for claim activation / opt-out. Token: body.turnstileToken. */
export async function captcha(req: Request, body: any, action: string): Promise<NextResponse | null> {
  const r = await verifyTurnstile(body?.turnstileToken, { ip: clientIp(req), action });
  return r.ok ? null : json({ error: "captcha_failed" }, 403);
}
