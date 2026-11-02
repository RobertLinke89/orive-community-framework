const STORAGE_KEY = "orive_anon_client_token_v1";
const OPS_DEBUG_KEY = "orive_ops_debug_v1";

function generateToken() {
  // Prefer crypto.randomUUID when available.
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }

  // Fallback: reasonably unique token.
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function getAnonClientToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const token = generateToken();
    window.localStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    // If storage is blocked, just skip token.
    return null;
  }
}

export function getAnonClientHeaders(): Record<string, string> {
  const token = getAnonClientToken();
  return token ? { "x-orive-client-token": token } : {};
}

export function isOpsDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(OPS_DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}
