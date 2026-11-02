import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let override: SupabaseClient | null | undefined;

/**
 * Service-role Supabase client. SERVER ONLY — never import from client components.
 * Returns null when not configured; tests inject a fake via setServerDbForTests().
 */
export function serverDb(): SupabaseClient | null {
  if (override !== undefined) return override;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url.startsWith("https://") || key.length < 20) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function setServerDbForTests(client: SupabaseClient | null | undefined) {
  override = client;
}
