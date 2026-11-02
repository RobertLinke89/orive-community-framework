import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/facilitatorAuth", () => ({
  facilitatorFromRequest: async (r: Request) => { const a = r.headers.get("authorization"); return a ? { userId: a.slice(7), name: "x", email: "x@x.de", id: "f" } : null; },
}));
import { safeNext, oauthOptions, oauthErrorMessage, isVerifiedEmailIdentity, OAUTH_ERROR_TEXT } from "@/lib/auth/oauth";
import { callbackStep } from "@/lib/auth/callbackFlow";
import { GoogleButton, AppleButton, OAuthButtons } from "@/components/auth/OAuthButtons";
import { AccountConsentBox } from "@/components/auth/AccountConsentBox";
import { ACCOUNT_CONSENT_VERSION, parseAccountConsent } from "@/lib/account-consent-text";
import { setAccountConsentStoreForTests, type AccountConsentRecord } from "@/lib/accountConsent";

describe("OAuth helpers", () => {
  it("safeNext blocks open redirects", () => {
    expect(safeNext("/claim/abc?activate=1")).toBe("/claim/abc?activate=1");
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "evil", "", null, "/\nx"]) expect(safeNext(bad as any)).toBe("/chat");
  });
  it("signInWithOAuth options for google and apple go through /auth/callback", () => {
    const g = oauthOptions("google", "https://orive.co", "/chat", "seeker");
    expect(g.provider).toBe("google");
    expect(g.options.redirectTo).toBe("https://orive.co/auth/callback?next=%2Fchat&intent=seeker");
    expect((g.options as any).queryParams).toEqual({ prompt: "select_account" });
    const a = oauthOptions("apple", "https://orive.co/", "//evil.com", "facilitator-signup");
    expect((a.options as any).scopes).toBe("name email");
    expect(a.options.redirectTo).toBe("https://orive.co/auth/callback?next=%2Fchat&intent=facilitator-signup");
  });
  it("maps provider errors to stable, translated codes", () => {
    expect(oauthErrorMessage("access_denied")).toBe("oauth_cancelled");
    expect(oauthErrorMessage("Unsupported provider: provider is not enabled")).toBe("oauth_provider_disabled");
    expect(oauthErrorMessage("invalid flow state, no valid flow state found")).toBe("oauth_expired");
    expect(oauthErrorMessage("weird")).toBe("oauth_failed");
    for (const k of Object.keys(OAUTH_ERROR_TEXT)) expect(OAUTH_ERROR_TEXT[k].de && OAUTH_ERROR_TEXT[k].en).toBeTruthy();
  });
  it("account linking only for verified e-mail", () => {
    expect(isVerifiedEmailIdentity({ email: "a@x.de", email_confirmed_at: "2026-10-28" })).toBe(true);
    expect(isVerifiedEmailIdentity({ email: "a@x.de", identities: [{ provider: "google", identity_data: { email: "a@x.de", email_verified: true } }] })).toBe(true);
    expect(isVerifiedEmailIdentity({ email: "a@x.de", identities: [{ provider: "apple", identity_data: { email: "a@x.de", email_verified: false } }] })).toBe(false);
  });
});

describe("/auth/callback flow – consent gate cannot be skipped", () => {
  it("steps", () => {
    expect(callbackStep({ search: "?error=access_denied&next=/chat", hasSession: false, consented: null })).toMatchObject({ step: "error", code: "oauth_cancelled" });
    expect(callbackStep({ search: "", hash: "#error=server_error&error_description=redirect+uri+mismatch", hasSession: false, consented: null })).toMatchObject({ step: "error", code: "oauth_redirect_mismatch" });
    expect(callbackStep({ search: "?code=abc", hasSession: false, consented: null })).toEqual({ step: "exchange", code: "abc" });
    expect(callbackStep({ search: "", hasSession: false, consented: null })).toMatchObject({ step: "error", code: "oauth_expired" });
    expect(callbackStep({ search: "?next=/chat", hasSession: true, consented: null })).toEqual({ step: "wait" });
    for (const intent of ["seeker", "facilitator-signup", "facilitator-login", "claim"])
      expect(callbackStep({ search: `?intent=${intent}&next=/x`, hasSession: true, consented: false })).toEqual({ step: "consent" });
    expect(callbackStep({ search: "?intent=claim&next=%2Fclaim%2Ft%3Factivate%3D1", hasSession: true, consented: true })).toEqual({ step: "redirect", to: "/claim/t?activate=1", intent: "claim" });
    expect(callbackStep({ search: "?intent=facilitator-signup", hasSession: true, consented: true })).toMatchObject({ to: "/dezk/start" });
    expect(callbackStep({ search: "?next=https://evil.com", hasSession: true, consented: true })).toMatchObject({ to: "/chat" });
  });
});

describe("brand buttons", () => {
  it("Google: official label + 4-colour G, light and dark themes", () => {
    const en = renderToStaticMarkup(<GoogleButton lang="en" onClick={() => {}} />);
    expect(en).toContain("Continue with Google");
    for (const c of ["#EA4335", "#4285F4", "#FBBC05", "#34A853"]) expect(en).toContain(c);
    expect(en).toMatch(/background:#FFFFFF/i); expect(en).toMatch(/1px solid #747775/i);
    const de = renderToStaticMarkup(<GoogleButton lang="de" theme="dark" onClick={() => {}} />);
    expect(de).toContain("Weiter mit Google"); expect(de).toMatch(/background:#131314/i);
  });
  it("Apple: only black / white, official title, logo in text colour, min height", () => {
    const black = renderToStaticMarkup(<AppleButton lang="en" onClick={() => {}} />);
    expect(black).toContain("Sign in with Apple"); expect(black).toMatch(/background:#000000/i); expect(black).toContain('fill="#FFFFFF"');
    const white = renderToStaticMarkup(<AppleButton lang="de" theme="dark" onClick={() => {}} />);
    expect(white).toContain("Mit Apple anmelden"); expect(white).toMatch(/background:#FFFFFF/i); expect(white).toContain('fill="#000000"');
    expect(black).toMatch(/height:44px/);
  });
  it("both buttons equally prominent (same size), consent box not pre-ticked", () => {
    const html = renderToStaticMarkup(<OAuthButtons lang="de" onSelect={() => {}} />);
    expect(html.match(/height:44px/g)).toHaveLength(2);
    const box = renderToStaticMarkup(<AccountConsentBox lang="de" checked={false} onChange={() => {}} />);
    expect(box).toContain("Art. 9");
    expect(box).not.toMatch(/checked=""/);
  });
});

describe("POST/GET /api/auth/consent", () => {
  afterEach(() => setAccountConsentStoreForTests(null));
  it("records the consent server-side, rejects wrong versions and anonymous calls", async () => {
    const rows: AccountConsentRecord[] = [];
    setAccountConsentStoreForTests({ async get(u, v) { const r = rows.find((x) => x.user_id === u && x.text_version === v); return r ? { lang: r.lang, text_sha256: r.text_sha256 } : null; }, async insert(r) { rows.push(r); } });
    const { GET, POST } = await import("@/app/api/auth/consent/route");
    const req = (method: string, body?: unknown, auth = "Bearer u1") => new Request("https://orive.test/api/auth/consent", { method, headers: { "content-type": "application/json", origin: "https://orive.test", ...(auth ? { authorization: auth } : {}) }, body: body ? JSON.stringify(body) : undefined });
    expect((await GET(req("GET", undefined, ""))).status).toBe(401);
    expect(await (await GET(req("GET"))).json()).toMatchObject({ consented: false });
    expect((await POST(req("POST", { consent: { granted: true, version: "old", lang: "de" } }))).status).toBe(422);
    expect((await POST(req("POST", { consent: { granted: false, version: ACCOUNT_CONSENT_VERSION, lang: "de" } }))).status).toBe(422);
    expect((await POST(req("POST", { consent: { granted: true, version: ACCOUNT_CONSENT_VERSION, lang: "de" } }))).status).toBe(200);
    expect(rows[0]).toMatchObject({ user_id: "u1", purpose: "account_terms_art9", text_version: ACCOUNT_CONSENT_VERSION });
    expect(rows[0].text_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(await (await GET(req("GET"))).json()).toMatchObject({ consented: true });
    expect(parseAccountConsent({ granted: true, version: ACCOUNT_CONSENT_VERSION, lang: "fr" })).toBeNull();
  });
});
