/** PII-free error logging (D4, S13). Logs only type/code and a scrubbed message. */
const EMAIL_RE = /[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+/g;

const KEY_RE = /\b(sk|rk|pk)_(live|test)_[A-Za-z0-9*.]*/g;

export function scrub(value: unknown): string {
  return String(value ?? "").replace(KEY_RE, "[stripe-key]").replace(EMAIL_RE, "[email]").slice(0, 300);
}

export function logError(tag: string, error: unknown, context: Record<string, string | number | undefined> = {}) {
  const err = error as { type?: string; code?: string; message?: string } | undefined;
  console.error(`[${tag}]`, JSON.stringify({ type: err?.type, code: err?.code, message: scrub(err?.message), ...context }));
}

/** Generic client-facing error (no internal messages). */
export const GENERIC_ERROR = "Something went wrong. Please try again.";
