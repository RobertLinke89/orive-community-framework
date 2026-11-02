export type OpsTelemetry = {
  remaining: number | null;
  retryAfterSeconds: number | null;
  policy: string | null;
};

export type OpsTelemetryEvent = {
  at: number;
  action: string;
  telemetry: OpsTelemetry;
};

type Listener = (evt: OpsTelemetryEvent) => void;

const listeners = new Set<Listener>();
let latest: OpsTelemetryEvent | null = null;
let history: OpsTelemetryEvent[] = [];

export function recordOpsTelemetry(action: string, telemetry: OpsTelemetry) {
  const evt: OpsTelemetryEvent = {
    at: Date.now(),
    action: action || "invoke",
    telemetry,
  };
  latest = evt;
  history = [evt, ...history].slice(0, 20);
  listeners.forEach((l) => l(evt));
}

export function getLatestOpsTelemetry(): OpsTelemetryEvent | null {
  return latest;
}

export function getOpsTelemetryHistory(): OpsTelemetryEvent[] {
  return history;
}

export function subscribeOpsTelemetry(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseFiniteNumber(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null;
  if (!input.length) return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses telemetry headers from a supabase.functions.invoke response.
 *
 * Note: invoke returns an object like { data, error, response } where `response`
 * is a fetch Response when available.
 */
export function getOpsTelemetryFromInvoke(resp: any, opts?: { bodyRemaining?: unknown }): OpsTelemetry {
  const headerRemaining = resp?.response?.headers?.get?.("X-RateLimit-Remaining");
  const headerRetryAfter = resp?.response?.headers?.get?.("Retry-After");
  const headerPolicy = resp?.response?.headers?.get?.("X-RateLimit-Policy");

  const remaining =
    parseFiniteNumber(headerRemaining) ??
    (opts?.bodyRemaining !== undefined ? parseFiniteNumber(opts.bodyRemaining) : null);

  const retryAfterSeconds = parseFiniteNumber(headerRetryAfter);

  const policy = typeof headerPolicy === "string" && headerPolicy.length ? headerPolicy : null;

  const telemetry = { remaining, retryAfterSeconds, policy };

  // If any telemetry is present, publish it for the global Ops HUD.
  if (remaining !== null || retryAfterSeconds !== null || policy !== null) {
    // Backwards compatible: callers can pass a string action name by using
    // opts.action (we keep opts type loose to avoid refactors).
    const action = typeof (opts as any)?.action === "string" ? (opts as any).action : "invoke";
    recordOpsTelemetry(action, telemetry);
  }

  return telemetry;
}
