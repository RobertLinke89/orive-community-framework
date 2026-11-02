import crypto from "crypto";

/**
 * Signed booking access token (S2/S9). Replaces "knowing the booking id is enough".
 * Format: base64url(bookingId).exp.hmac  — HMAC-SHA256 with BOOKING_TOKEN_SECRET.
 */
const DEFAULT_TTL_MS = 180 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.BOOKING_TOKEN_SECRET || "";
  if (value.length < 32) throw new Error("BOOKING_TOKEN_SECRET missing or too short (>= 32 chars).");
  return value;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createBookingToken(bookingId: string, ttlMs = DEFAULT_TTL_MS, now = Date.now()): string {
  const id = Buffer.from(bookingId, "utf8").toString("base64url");
  const exp = Math.floor((now + ttlMs) / 1000).toString(36);
  const payload = `${id}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyBookingToken(token: string | null | undefined, bookingId: string, now = Date.now()): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, exp, mac] = parts;
  let expected: string;
  try {
    expected = sign(`${id}.${exp}`);
  } catch {
    return false;
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  if (Buffer.from(id, "base64url").toString("utf8") !== bookingId) return false;
  return parseInt(exp, 36) * 1000 > now;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function tokenFromRequest(req: Request): string | null {
  const header = req.headers.get("x-booking-token");
  if (header) return header.trim();
  return new URL(req.url).searchParams.get("t");
}
