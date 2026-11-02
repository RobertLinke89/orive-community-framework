import { supabase } from "@/integrations/supabase/client";

export type OAuthProvider = "google" | "apple";
/** What the user was doing when they started sign-in; decides where the callback sends them. */
export type AuthIntent = "seeker" | "facilitator-signup" | "facilitator-login" | "claim";

/** Only same-origin relative paths; blocks //evil.com, /\evil.com, javascript:, absolute URLs. */
export function safeNext(next: string | null | undefined, fallback = "/chat"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || /[\u0000-\u001f]/.test(next)) return fallback;
  try {
    const u = new URL(next, "https://orive.invalid");
    return u.origin === "https://orive.invalid" ? u.pathname + u.search + u.hash : fallback;
  } catch { return fallback; }
}

export function callbackUrl(origin: string, next: string, intent: AuthIntent) {
  const q = new URLSearchParams({ next: safeNext(next), intent });
  return `${origin.replace(/\/$/, "")}/auth/callback?${q}`;
}

/**
 * Supabase Auth OAuth (PKCE). Apple: scopes "name email" (Apple only sends the name on the very first sign-in).
 * Google: select_account so a shared device does not silently reuse the wrong account.
 */
export function oauthOptions(provider: OAuthProvider, origin: string, next: string, intent: AuthIntent) {
  return {
    provider,
    options: {
      redirectTo: callbackUrl(origin, next, intent),
      ...(provider === "apple" ? { scopes: "name email" } : { queryParams: { prompt: "select_account" } }),
    },
  } as const;
}

export async function startOAuth(provider: OAuthProvider, next: string, intent: AuthIntent): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth(oauthOptions(provider, window.location.origin, next, intent));
    return { error: error ? oauthErrorMessage(error.message) : null };
  } catch (e: any) {
    return { error: oauthErrorMessage(e?.message) };
  }
}

/** Maps provider / Supabase errors (also ?error=…&error_description=… on the callback) to a stable code. */
export function oauthErrorMessage(raw: string | null | undefined): string {
  const m = (raw || "").toLowerCase();
  if (!m) return "oauth_failed";
  if (m.includes("access_denied") || m.includes("cancel") || m.includes("user denied")) return "oauth_cancelled";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) return "oauth_provider_disabled";
  if (m.includes("email") && (m.includes("not verified") || m.includes("unverified"))) return "oauth_email_unverified";
  if (m.includes("code verifier") || m.includes("flow state") || m.includes("pkce")) return "oauth_expired";
  if (m.includes("redirect")) return "oauth_redirect_mismatch";
  return "oauth_failed";
}

export const OAUTH_ERROR_TEXT: Record<string, { de: string; en: string }> = {
  oauth_cancelled: { de: "Anmeldung abgebrochen.", en: "Sign-in was cancelled." },
  oauth_provider_disabled: { de: "Diese Anmeldemethode ist gerade nicht verfügbar. Bitte nutze E-Mail.", en: "This sign-in method is not available right now. Please use e-mail." },
  oauth_email_unverified: { de: "Deine E-Mail-Adresse ist beim Anbieter nicht bestätigt.", en: "Your e-mail address is not verified with the provider." },
  oauth_expired: { de: "Der Anmeldelink ist abgelaufen. Bitte starte die Anmeldung im selben Browser neu.", en: "The sign-in link expired. Please start again in the same browser." },
  oauth_redirect_mismatch: { de: "Anmeldung fehlgeschlagen (Weiterleitung nicht erlaubt).", en: "Sign-in failed (redirect not allowed)." },
  oauth_failed: { de: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.", en: "Sign-in failed. Please try again." },
};

/**
 * Account linking: Supabase links a Google/Apple identity to an existing user automatically when the provider
 * reports the SAME e-mail as verified (default "automatic identity linking"). We only rely on that – never on
 * unverified e-mails. Apple "Hide my e-mail" relay addresses never match, so such users get a new account
 * (they can link later with supabase.auth.linkIdentity while signed in).
 */
export function isVerifiedEmailIdentity(user: { email?: string | null; email_confirmed_at?: string | null; identities?: { provider: string; identity_data?: Record<string, unknown> }[] } | null) {
  if (!user?.email) return false;
  if (user.email_confirmed_at) return true;
  return (user.identities || []).some((i) => i.identity_data?.email === user.email && i.identity_data?.email_verified === true);
}
