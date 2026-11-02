import crypto from "crypto";

/**
 * Claim tokens: "<id>.<exp>.<sig>"
 *  id  = 24 random bytes (base64url) -> unguessable
 *  exp = unix seconds
 *  sig = HMAC-SHA256(CLAIM_TOKEN_SECRET, "claim.v1.<id>.<exp>") base64url
 * The DB only stores sha256(token) and enforces single use + expiry atomically;
 * the HMAC lets the server reject forged/expired links before touching the DB.
 */
const PREFIX = "claim.v1.";
export const DEFAULT_TTL_DAYS = 30;

function secret(): Buffer {
  const s = process.env.CLAIM_TOKEN_SECRET || "";
  if (s.length < 32) throw new Error("CLAIM_TOKEN_SECRET missing or shorter than 32 chars");
  return Buffer.from(s, "utf8");
}
const b64u = (b: Buffer) => b.toString("base64url");

export function signClaimToken(opts: { ttlDays?: number; now?: number } = {}) {
  const now = opts.now ?? Date.now();
  const exp = Math.floor(now / 1000) + Math.round((opts.ttlDays ?? DEFAULT_TTL_DAYS) * 86400);
  const id = b64u(crypto.randomBytes(24));
  const sig = b64u(crypto.createHmac("sha256", secret()).update(`${PREFIX}${id}.${exp}`).digest());
  const token = `${id}.${exp}.${sig}`;
  return { token, hash: hashClaimToken(token), expiresAt: new Date(exp * 1000) };
}

export type TokenCheck = { ok: true; hash: string; expiresAt: Date } | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyClaimToken(token: string, now = Date.now(), opts: { allowExpired?: boolean } = {}): TokenCheck {
  if (typeof token !== "string" || token.length > 200) return { ok: false, reason: "malformed" };
  const m = /^([A-Za-z0-9_-]{32})\.(\d{9,11})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) return { ok: false, reason: "malformed" };
  const [, id, expS, sig] = m;
  const want = crypto.createHmac("sha256", secret()).update(`${PREFIX}${id}.${expS}`).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return { ok: false, reason: "bad_signature" };
  const expiresAt = new Date(Number(expS) * 1000);
  if (!opts.allowExpired && expiresAt.getTime() <= now) return { ok: false, reason: "expired" };
  return { ok: true, hash: hashClaimToken(token), expiresAt };
}

export function hashClaimToken(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

/** Suppression key for opt-out (no plain PII stored). */
export function suppressionKey(kind: "email" | "source", value: string): string {
  return crypto.createHash("sha256").update(`${kind}:${value.trim().toLowerCase()}`, "utf8").digest("hex");
}

export function claimUrl(token: string, origin = process.env.NEXT_PUBLIC_APP_URL || "https://orive.co") {
  return `${origin.replace(/\/$/, "")}/claim/${token}`;
}
export { profileUrl } from "./slugs";
