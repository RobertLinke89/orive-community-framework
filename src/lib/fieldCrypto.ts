import crypto from "crypto";

/** AES-256-GCM field encryption for health-related intake answers (D1). Key: INTAKE_ENCRYPTION_KEY (32 bytes, base64). */
function key(): Buffer {
  const raw = Buffer.from(process.env.INTAKE_ENCRYPTION_KEY || "", "base64");
  if (raw.length !== 32) throw new Error("INTAKE_ENCRYPTION_KEY must be 32 bytes (base64).");
  return raw;
}

export function encryptField(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decryptField(payload: string): string {
  const [v, iv, tag, data] = payload.split(".");
  if (v !== "v1") throw new Error("Unknown ciphertext version");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
