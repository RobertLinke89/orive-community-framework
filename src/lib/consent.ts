import crypto from "crypto";
import { serverDb } from "@/lib/serverDb";

import { HEALTH_CONSENT_TEXT, HEALTH_CONSENT_VERSION, type ConsentLang } from "@/lib/consent-text";
export { HEALTH_CONSENT_TEXT, HEALTH_CONSENT_VERSION, type ConsentLang };

export function consentTextHash(lang: ConsentLang, version = HEALTH_CONSENT_VERSION) {
  return crypto.createHash("sha256").update(`${version}\n${HEALTH_CONSENT_TEXT[lang]}`, "utf8").digest("hex");
}

export type HealthConsentInput = { granted: true; version: string; lang: ConsentLang };

/** Accepts the new structured payload; the old boolean is NOT enough anymore (no proof of which text). */
export function parseHealthConsent(v: unknown): HealthConsentInput | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o.granted !== true || o.version !== HEALTH_CONSENT_VERSION || (o.lang !== "de" && o.lang !== "en")) return null;
  return { granted: true, version: o.version, lang: o.lang };
}

export function clientHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ua = (req.headers.get("user-agent") || "").slice(0, 200);
  const pepper = process.env.BOOKING_TOKEN_SECRET || "";
  return crypto.createHash("sha256").update(`${ip}|${ua}|${pepper}`, "utf8").digest("hex");
}

export type ConsentRecord = { session_booking_id: string | null; legacy_booking_ref?: string | null; purpose: "health_data_art9"; text_version: string; text_sha256: string; lang: ConsentLang; client_hash: string | null };

export interface ConsentStore { insert(r: ConsentRecord): Promise<void>; withdraw(bookingId: string): Promise<boolean>; }
let override: ConsentStore | null = null;
export function setConsentStoreForTests(s: ConsentStore | null) { override = s; }
export function consentStore(): ConsentStore | null {
  if (override) return override;
  const db = serverDb();
  if (!db) return null;
  return {
    async insert(r) { const { error } = await db.from("consent_records").insert(r); if (error) throw new Error("consent_insert_failed"); },
    async withdraw(bookingId) { const { data, error } = await db.rpc("withdraw_health_consent", { p_booking_id: bookingId }); if (error) throw new Error("consent_withdraw_failed"); return data === true; },
  };
}

export function buildConsentRecord(bookingId: string, c: HealthConsentInput, req: Request, kind: "session" | "legacy" = "session"): ConsentRecord {
  return { session_booking_id: kind === "session" ? bookingId : null, legacy_booking_ref: kind === "legacy" ? bookingId : null, purpose: "health_data_art9", text_version: c.version, text_sha256: consentTextHash(c.lang, c.version), lang: c.lang, client_hash: clientHash(req) };
}
