/**
 * Single source of truth for deletion deadlines. Must match the RETENTION:* markers in
 * supabase/migrations/20261029000000_compliance_step5.sql (checked by tests/compliance.test.ts)
 * and is rendered into the privacy notice (Datenschutz.tsx §6).
 */
export const RETENTION = {
  hold_minutes: 35,
  unpaid_booking_days: 30,
  stale_pending_days: 7,
  anonymise_after_session_days: 90,
  accounting_years: 10,
  stripe_events_days: 30,
  unclaimed_draft_days: 90,
  claim_token_days: 30,
  legacy_consent_days: 120,
  rate_limit_hours: 24,
} as const;
export type RetentionKey = keyof typeof RETENTION;
