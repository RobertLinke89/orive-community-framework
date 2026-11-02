import crypto from "crypto";

/** S3: CRON_SECRET is mandatory (fail closed) and compared in constant time. */
export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET || "";
  if (secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

