import { safeNext, oauthErrorMessage, type AuthIntent } from "./oauth";

export type CallbackInput = { search: string; hash?: string; hasSession: boolean; consented: boolean | null };
export type CallbackStep =
  | { step: "error"; code: string; retry: string }
  | { step: "exchange"; code: string }
  | { step: "wait" }
  | { step: "consent" }
  | { step: "redirect"; to: string; intent: AuthIntent };

const INTENTS: AuthIntent[] = ["seeker", "facilitator-signup", "facilitator-login", "claim"];
const DEFAULT_NEXT: Record<AuthIntent, string> = { seeker: "/chat", "facilitator-signup": "/dezk/start", "facilitator-login": "/dezk", claim: "/" };

/** Pure decision for /auth/callback – the account consent gate cannot be skipped by any provider or intent. */
export function callbackStep({ search, hash = "", hasSession, consented }: CallbackInput): CallbackStep {
  const q = new URLSearchParams(search);
  const h = new URLSearchParams(hash.replace(/^#/, ""));
  const intent = (INTENTS as string[]).includes(q.get("intent") || "") ? (q.get("intent") as AuthIntent) : "seeker";
  const next = safeNext(q.get("next"), DEFAULT_NEXT[intent]);
  const err = q.get("error_description") || q.get("error") || h.get("error_description") || h.get("error");
  if (err && !hasSession) return { step: "error", code: oauthErrorMessage(err), retry: intent.startsWith("facilitator") ? "/auth?mode=" + (intent === "facilitator-signup" ? "signup" : "login") : next };
  if (!hasSession) return q.get("code") ? { step: "exchange", code: q.get("code")! } : { step: "error", code: "oauth_expired", retry: next };
  if (consented === null) return { step: "wait" };
  if (!consented) return { step: "consent" };
  return { step: "redirect", to: next, intent };
}
