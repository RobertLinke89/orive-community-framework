/** Fixed app origin for redirect/return URLs (S12). Never derived from the request's Origin header. */
export function appOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(configured)) return configured;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/i.test(configured)) return configured;
  return "https://orive.co";
}

/** Same-origin check for state-changing browser requests (CSRF defence in depth). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (no cookies are used for auth)
  return origin.replace(/\/$/, "") === appOrigin();
}
