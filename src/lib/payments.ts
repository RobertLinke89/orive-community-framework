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
  return key.startsWith('sk_live_') || key.startsWith('sk_test_');
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

/** Simulation is never allowed in production. Locally it needs an explicit flag. */
export function allowStripeSimulation(): boolean {
  if (isProductionRuntime()) return false;
  return process.env.ALLOW_STRIPE_SIMULATION === 'true';
}
