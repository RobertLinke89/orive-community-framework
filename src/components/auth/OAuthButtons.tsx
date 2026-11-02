"use client";
import type { CSSProperties } from "react";
import type { OAuthProvider } from "@/lib/auth/oauth";

/**
 * Brand-conformant sign-in buttons. Inline styles on purpose: they must look identical in the Tailwind views
 * (Auth, ChatCreditsAuthDialog) and the claim CSS, and nobody should "theme" them.
 *
 * Google (developers.google.com/identity/branding-guidelines): official 4-colour "G" (never recoloured),
 * text "Continue with Google" / "Weiter mit Google", Roboto Medium 14/20, light: fill #FFFFFF, 1px #747775 stroke,
 * text #1F1F1F; dark: fill #131314, 1px #8E918F stroke, text #E3E3E3; 12px left padding, 10px gap, pill allowed.
 *
 * Apple (Human Interface Guidelines, Sign in with Apple): only black / white / white-with-outline, the Apple logo and
 * the title "Sign in with Apple" / "Mit Apple anmelden" in the system font, logo and title never separated or
 * recoloured, min. height 30pt (we use 44), min. width 140, at least as prominent as every other sign-in button
 * (same size and position rank as Google here).
 */
export type BrandTheme = "light" | "dark";
const L = {
  de: { google: "Weiter mit Google", apple: "Mit Apple anmelden" },
  en: { google: "Continue with Google", apple: "Sign in with Apple" },
};

const base: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", minWidth: 200, maxWidth: 400,
  height: 44, padding: "0 12px", borderRadius: 999, cursor: "pointer", boxSizing: "border-box", fontSize: 15, lineHeight: "20px",
  letterSpacing: "0.25px", textDecoration: "none", WebkitTapHighlightColor: "transparent",
};

export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ flex: "none" }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
export function AppleLogo({ size = 18, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ flex: "none", marginTop: -2 }}>
      <path fill={color} d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
  );
}

type BtnProps = { lang: "de" | "en"; theme?: BrandTheme; onClick: () => void; disabled?: boolean; busy?: boolean };

export function GoogleButton({ lang, theme = "light", onClick, disabled, busy }: BtnProps) {
  const dark = theme === "dark";
  return (
    <button type="button" className="orive-oauth orive-oauth-google" data-provider="google" onClick={onClick} disabled={disabled} aria-busy={busy || undefined}
      style={{ ...base, fontFamily: "Roboto, Arial, sans-serif", fontWeight: 500, background: dark ? "#131314" : "#FFFFFF",
        color: dark ? "#E3E3E3" : "#1F1F1F", border: `1px solid ${dark ? "#8E918F" : "#747775"}`, opacity: disabled ? 0.6 : 1 }}>
      <GoogleLogo /><span>{L[lang].google}</span>
    </button>
  );
}

/** theme light page -> black button; dark page -> white button (Apple's two filled styles). */
export function AppleButton({ lang, theme = "light", onClick, disabled, busy }: BtnProps) {
  const white = theme === "dark";
  const fg = white ? "#000000" : "#FFFFFF";
  return (
    <button type="button" className="orive-oauth orive-oauth-apple" data-provider="apple" onClick={onClick} disabled={disabled} aria-busy={busy || undefined}
      style={{ ...base, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 600,
        background: white ? "#FFFFFF" : "#000000", color: fg, border: `1px solid ${white ? "#FFFFFF" : "#000000"}`, opacity: disabled ? 0.6 : 1 }}>
      <AppleLogo color={fg} /><span>{L[lang].apple}</span>
    </button>
  );
}

export function OAuthButtons({ lang, theme = "light", onSelect, disabled, busy }: {
  lang: "de" | "en"; theme?: BrandTheme; onSelect: (p: OAuthProvider) => void; disabled?: boolean; busy?: OAuthProvider | null;
}) {
  return (
    <div className="orive-oauth-group" style={{ display: "grid", gap: 10, width: "100%" }}>
      <AppleButton lang={lang} theme={theme} onClick={() => onSelect("apple")} disabled={disabled} busy={busy === "apple"} />
      <GoogleButton lang={lang} theme={theme} onClick={() => onSelect("google")} disabled={disabled} busy={busy === "google"} />
    </div>
  );
}
