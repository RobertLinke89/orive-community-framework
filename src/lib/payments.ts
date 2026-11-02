
export const CONCIERGE_FEE_CENTS = 100;
export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export function sessionEndsAt(startAt: string, durationMin?: number | null) {
  const start = new Date(startAt).getTime();
  if (Number.isNaN(start)) return 0;
  const minutes = durationMin && durationMin > 0 ? durationMin : 60;
  return start + minutes * 60 * 1000;
}

export function cancelDeadline(startAt: string) {
  const start = new Date(startAt).getTime();
  if (Number.isNaN(start)) return 0;
  return start - CANCEL_WINDOW_MS;
}

export function isStripeKeyUsable(key?: string | null): boolean {
  if (!key) return false;
  if (key.startsWith('sk_test_placeholder') || key.startsWith('test_')) return false;
  // Restricted keys (rk_) are valid server keys too and preferred for least privilege.
  return /^(sk|rk)_(live|test)_/.test(key);
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

/** Simulation is never allowed in production. Locally it needs an explicit flag. */
export function allowStripeSimulation(): boolean {
  if (isProductionRuntime()) return false;
  // Never on Vercel (preview deployments may share production data) and only in `next dev`/tests.
  if (process.env.VERCEL || process.env.VERCEL_ENV) return false;
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') return false;
  return process.env.ALLOW_STRIPE_SIMULATION === 'true';
}

/** True when a start date parses; invalid dates must never be treated as "due" or "late". */
export function isValidDate(value: string | null | undefined): boolean {
  return Boolean(value) && Number.isFinite(new Date(value as string).getTime());
}


