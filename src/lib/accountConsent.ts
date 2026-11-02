import crypto from "crypto";
import { serverDb } from "@/lib/serverDb";
import { clientHash } from "@/lib/consent";
import { ACCOUNT_CONSENT_TEXT, ACCOUNT_CONSENT_VERSION, type AccountConsentInput, type AccountConsentLang } from "@/lib/account-consent-text";

export function accountConsentHash(lang: AccountConsentLang, version = ACCOUNT_CONSENT_VERSION) {
  return crypto.createHash("sha256").update(`${version}\n${ACCOUNT_CONSENT_TEXT[lang]}`, "utf8").digest("hex");
}

export type AccountConsentRecord = { user_id: string; purpose: "account_terms_art9"; text_version: string; text_sha256: string; lang: AccountConsentLang; client_hash: string | null };

export function buildAccountConsent(userId: string, c: AccountConsentInput, req: Request): AccountConsentRecord {
  return { user_id: userId, purpose: "account_terms_art9", text_version: c.version, text_sha256: accountConsentHash(c.lang, c.version), lang: c.lang, client_hash: clientHash(req) };
}

export interface AccountConsentStore {
  /** active (not withdrawn) consent for this text version, or null */
  get(userId: string, version: string): Promise<{ lang: AccountConsentLang; text_sha256: string } | null>;
  insert(r: AccountConsentRecord): Promise<void>;
}
let override: AccountConsentStore | null = null;
export function setAccountConsentStoreForTests(s: AccountConsentStore | null) { override = s; }
export function accountConsentStore(): AccountConsentStore | null {
  if (override) return override;
  const db = serverDb();
  if (!db) return null;
  return {
    async get(userId, version) {
      const { data, error } = await db.from("account_consents").select("lang,text_sha256").eq("user_id", userId).eq("text_version", version).is("withdrawn_at", null).limit(1);
      if (error) throw new Error("consent_lookup_failed");
      return (data?.[0] as { lang: AccountConsentLang; text_sha256: string } | undefined) ?? null;
    },
    async insert(r) {
      const { error } = await db.from("account_consents").upsert(r, { onConflict: "user_id,purpose,text_version", ignoreDuplicates: true });
      if (error) throw new Error("consent_insert_failed");
    },
  };
}
