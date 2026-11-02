"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Layout } from "@/components/Layout";
import { cn } from "@/lib/utils";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AccountConsentBox, consentPayload } from "@/components/auth/AccountConsentBox";
import { startOAuth, OAUTH_ERROR_TEXT, type OAuthProvider } from "@/lib/auth/oauth";
import { PENDING_CONSENT_KEY } from "@/lib/account-consent-text";

/** Every successful sign-in goes through /auth/callback, which enforces the account consent (terms + Art. 9). */
const viaCallback = (next: string, intent: "facilitator-signup" | "facilitator-login") =>
  `/auth/callback?${new URLSearchParams({ next, intent })}`;

const FACILITATOR_CATEGORIES = [
  "Breathwork",
  "Yoga",
  "Meditation",
  "Sound Healing",
  "Life Coaching",
  "BodyWork",
  "Mindfulness",
  "Spiritual Growth"
];

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams?.get("claim");
  const claimName = searchParams?.get("name");
  const claimSession = searchParams?.get("session");
  const claimDate = searchParams?.get("date");
  const claimTime = searchParams?.get("time");
  const returnUrl = searchParams?.get("returnUrl") || searchParams?.get("redirect");
  const requestedMode = searchParams?.get("mode");
  const initialMode = requestedMode === "signup" || requestedMode === "facilitator" ? "signup" : "login";

  const { language, copy } = useLanguage();
  const isDe = language === "de";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Facilitator Signup fields
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("Breathwork");
  const [city, setCity] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);
  const lang: "de" | "en" = isDe ? "de" : "en";

  const handleOAuth = async (provider: OAuthProvider) => {
    setErrorMessage(null);
    if (mode === "signup" && !consent) {
      const msg = copy("Bitte zuerst der Einwilligung zustimmen.", "Please accept the consent first.");
      setErrorMessage(msg); toast.error(msg); return;
    }
    // sign-up: remember the ticked consent across the provider round trip; /auth/callback records it server-side
    if (mode === "signup") sessionStorage.setItem(PENDING_CONSENT_KEY, JSON.stringify({ consent: consentPayload(lang) }));
    setOauthBusy(provider);
    const intent = mode === "signup" ? "facilitator-signup" : "facilitator-login";
    const { error } = await startOAuth(provider, returnUrl || (mode === "signup" ? "/dezk/start" : "/chat"), intent);
    if (error) { const msg = OAUTH_ERROR_TEXT[error][lang]; setErrorMessage(msg); toast.error(msg); setOauthBusy(null); }
  };

  // Password validation criteria from Figma
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLen = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasCapital && hasSpecial && hasMinLen && hasNumber;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        toast.success(copy("Bereits angemeldet", "Already signed in"));
        router.push(viaCallback(returnUrl || "/chat", "facilitator-login"));
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        toast.success(copy("Willkommen zurück!", "Welcome back!"));
        router.push(viaCallback(returnUrl || "/chat", "facilitator-login"));
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isDe, returnUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      const msg = copy("Bitte E-Mail und Passwort eingeben.", "Please enter your email and password.");
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        toast.success(copy("Erfolgreich angemeldet!", "Successfully signed in!"));
        router.push(viaCallback(returnUrl || "/chat", "facilitator-login"));
      }
    } catch (err: any) {
      console.error("Login error:", err);
      let userError = copy("Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.", "Login failed. Please check your credentials.");

      const rawMsg = (err?.message || "").toLowerCase();
      if (rawMsg.includes("invalid login credentials") || rawMsg.includes("invalid_grant")) {
        userError = copy("Ungültige E-Mail-Adresse oder falsches Passwort.", "Invalid email address or password.");
      } else if (err?.message) {
        userError = err.message;
      }

      setErrorMessage(userError);
      toast.error(userError);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    if (!trimmedEmail || !password || !trimmedName) {
      const msg = copy("Bitte Name, E-Mail und Passwort eingeben.", "Please enter your name, email and password.");
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!consent) {
      const msg = copy("Bitte der Einwilligung zustimmen.", "Please accept the consent.");
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isPasswordValid) {
      const msg = copy("Bitte alle 4 Passwortkriterien erfüllen (mind. 8 Zeichen, Großbuchstabe, Zahl, Sonderzeichen).", "Please fulfill all 4 password requirements.");
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: "facilitator",
            category: category,
            city: city.trim() || undefined,
          },
        },
      });

      if (error) throw error;
      // recorded server-side by /auth/callback (now, or after the confirmation e-mail on first sign-in in this tab)
      sessionStorage.setItem(PENDING_CONSENT_KEY, JSON.stringify({ consent: consentPayload(lang) }));

      toast.success(copy("Facilitator-Konto erfolgreich angelegt!", "Facilitator account created successfully!"));

      // Seamlessly import offerings into marketplace
      try {
        await fetch("/api/facilitator/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: websiteUrl.trim(),
            facilitatorName: trimmedName,
            facilitatorEmail: trimmedEmail,
            category,
            city: city.trim(),
          }),
        });
      } catch (importErr) {
        console.warn("[Signup] Auto-import note:", importErr);
      }

      if (data?.session) {
        router.push(viaCallback(returnUrl || "/dezk/start", "facilitator-signup"));
      } else {
        setMode("login");
        toast.info(copy("Bitte mit deinen Zugangsdaten anmelden.", "Please sign in with your credentials."));
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      let userError = copy("Registrierung fehlgeschlagen.", "Registration failed.");
      if (err?.message) userError = err.message;
      setErrorMessage(userError);
      toast.error(userError);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantClaim = async () => {
    if (!claimId) return;
    if (!email.trim()) {
      toast.error(copy("E-Mail ist erforderlich.", "Email is required."));
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch('/api/facilitator/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId: claimId,
          name: claimName,
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimSuccess(true);
        toast.success(copy("Profil beansprucht. Als Nächstes einen Termin im dezk setzen.", "Profile claimed. Publish a date in the dezk next."));
        setTimeout(() => {
          router.push('/dezk');
        }, 1600);
      } else {
        toast.error(data?.error || "Freischaltung nicht möglich.");
      }
    } catch (err) {
      toast.error("Netzwerkfehler.");
    } finally {
      setClaiming(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error(copy("Bitte E-Mail eingeben.", "Please enter your email."));
      return;
    }
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.orive.co";
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/reset-password`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast.success(copy("Link zum Zurücksetzen gesendet!", "Password reset link sent!"));
    } catch (err: any) {
      setErrorMessage(err?.message || "Fehler beim Senden");
      toast.error(err?.message || "Fehler");
    } finally {
      setLoading(false);
    }
  };

  const title = claimId
    ? (copy("Kalender freischalten", "Unlock the calendar"))
    : showForgotPassword
    ? (copy("Passwort zurücksetzen", "Reset your password"))
    : mode === "signup"
    ? (copy("Konto anlegen", "Create an account"))
    : (copy("Anmelden", "Sign in"));

  const lede = claimId
    ? (copy("Beanspruche dein Profil mit der E-Mail, unter der du erreichbar bist.", "Claim your profile with the email where you can be reached."))
    : showForgotPassword
    ? (copy("Wir schicken einen Link an deine E-Mail.", "We will send a link to your email."))
    : mode === "signup"
    ? (copy("Für Facilitators. Keine monatliche Gebühr, keine Kreditkarte.", "For facilitators. No monthly fee, no credit card."))
    : (copy("Für Facilitators mit einem Konto.", "For facilitators with an account."));

  const passwordRules = [
    { ok: hasMinLen, label: copy("8 Zeichen", "8 characters") },
    { ok: hasCapital, label: copy("Ein Großbuchstabe", "One capital letter") },
    { ok: hasNumber, label: copy("Eine Zahl", "One number") },
    { ok: hasSpecial, label: copy("Ein Sonderzeichen", "One special character") },
  ];

  const labelClass = "block mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500";
  const fieldClass = "w-full h-11 px-3 bg-white dark:bg-[#01223F] border border-slate-200 dark:border-white/15 text-sm text-[#01223F] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#01223F] dark:focus:border-white";
  const buttonClass = "w-full h-11 bg-[#01223F] dark:bg-white text-white dark:text-[#01223F] text-sm font-medium hover:bg-[#017F80] dark:hover:bg-[#00CDAC] disabled:opacity-60 flex items-center justify-center gap-2";

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100dvh-4rem)] bg-[#f4f6f8] dark:bg-[#011424] text-[#01223F] dark:text-white flex flex-col">
      <main className="flex-1 flex justify-center px-5 py-10">
        <div className="w-full max-w-[400px] my-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80]">
            ORIVE dezk
          </p>
          <h1 className="mt-3 text-[2rem] sm:text-[2.25rem] font-semibold tracking-[-0.03em] leading-none">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {lede}
          </p>

          {!claimId && !showForgotPassword && (
            <div className="mt-8 flex gap-6 border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMessage(null); }}
                className={cn(
                  "-mb-px pb-3 text-sm border-b transition-colors",
                  mode === "login"
                    ? "border-[#01223F] dark:border-white font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {copy("Anmelden", "Sign in")}
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMessage(null); }}
                className={cn(
                  "-mb-px pb-3 text-sm border-b transition-colors",
                  mode === "signup"
                    ? "border-[#01223F] dark:border-white font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {copy("Konto anlegen", "Create account")}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {claimId && (
            claimSuccess ? (
              <div className="mt-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-6">
                <CheckCircle2 className="w-5 h-5 text-[#017F80]" />
                <p className="mt-3 text-sm font-medium">
                  {copy("Kalender freigeschaltet.", "Calendar unlocked.")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {copy(`Willkommen, ${claimName || "Facilitator"}. Als Nächstes einen Termin im dezk veröffentlichen.`, `Welcome, ${claimName || "Facilitator"}. Publish a date in the dezk next.`)}
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {copy("Profil", "Profile")}
                  </p>
                  <p className="mt-1 text-sm font-medium">{claimName || (copy("Facilitator", "Facilitator"))}</p>
                  {claimSession && (
                    <p className="mt-1 text-sm text-slate-500">{claimSession}</p>
                  )}
                  {(claimDate || claimTime) && (
                    <p className="mt-1 text-sm text-slate-500">{[claimDate, claimTime].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <label className="block">
                  <span className={labelClass}>{copy("E-Mail", "Email")}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.eu"
                    required
                    className={fieldClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleInstantClaim}
                  disabled={claiming}
                  className={buttonClass}
                >
                  {claiming && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{copy("Profil beanspruchen", "Claim profile")}</span>
                </button>
              </div>
            )
          )}

          {!claimId && showForgotPassword && resetEmailSent && (
            <div className="mt-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-6">
              <CheckCircle2 className="w-5 h-5 text-[#017F80]" />
              <p className="mt-3 text-sm font-medium">
                {copy("E-Mail gesendet.", "Email sent.")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {copy(`Ein Link liegt bei ${email}.`, `A link is waiting at ${email}.`)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                }}
                className="mt-5 text-sm text-[#017F80] hover:underline"
              >
                {copy("Zurück zur Anmeldung", "Back to sign in")}
              </button>
            </div>
          )}

          {!claimId && !showForgotPassword && (
            <div className="mt-8 space-y-4">
              {mode === "signup" && <AccountConsentBox lang={lang} checked={consent} onChange={setConsent} />}
              <OAuthButtons lang={lang} theme="light" onSelect={handleOAuth} disabled={Boolean(oauthBusy) || loading || (mode === "signup" && !consent)} busy={oauthBusy} />
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/15" />{copy("oder mit E-Mail", "or with email")}<span className="h-px flex-1 bg-slate-200 dark:bg-white/15" />
              </div>
            </div>
          )}

          {!claimId && showForgotPassword && !resetEmailSent && (
            <form onSubmit={handleForgotPassword} className="mt-8 space-y-5">
              <label className="block">
                <span className={labelClass}>{copy("E-Mail", "Email")}</span>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.eu"
                  required
                  className={fieldClass}
                />
              </label>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{copy("Link senden", "Send link")}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-slate-500 hover:text-[#01223F] dark:hover:text-white"
              >
                {copy("Zurück zur Anmeldung", "Back to sign in")}
              </button>
            </form>
          )}

          {!claimId && !showForgotPassword && mode === "signup" && (
            <form onSubmit={handleSignup} className="mt-8 space-y-5">
              <label className="block">
                <span className={labelClass}>{copy("Name", "Name")}</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={copy("Sarah Weber", "Sarah Miller")}
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>{copy("Fachbereich", "Category")}</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={fieldClass}
                  >
                    {FACILITATOR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>{copy("Stadt", "City")}</span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={copy("Berlin", "Berlin")}
                    autoComplete="address-level2"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>{copy("Website oder Instagram", "Website or Instagram")}</span>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://"
                  className={fieldClass}
                />
                <span className="mt-1.5 block text-[12px] text-slate-400">
                  {copy("Optional. Wir versuchen, Angebote von dort zu übernehmen.", "Optional. We try to import offerings from there.")}
                </span>
              </label>

              <label className="block">
                <span className={labelClass}>{copy("E-Mail", "Email")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.eu"
                  required
                  autoComplete="email"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>{copy("Passwort", "Password")}</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={cn(fieldClass, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#01223F] dark:hover:text-white"
                    aria-label={showPassword ? (copy("Passwort verbergen", "Hide password")) : (copy("Passwort zeigen", "Show password"))}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {passwordRules.map((rule) => (
                    <li key={rule.label} className={cn("flex items-center gap-1.5 text-[12px]", rule.ok ? "text-[#017F80]" : "text-slate-400")}>
                      <Check className={cn("w-3 h-3", rule.ok ? "opacity-100" : "opacity-40")} />
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </label>

              <button type="submit" disabled={loading} className={buttonClass}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{copy("Konto anlegen", "Create account")}</span>
              </button>
            </form>
          )}

          {!claimId && !showForgotPassword && mode === "login" && (
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className={labelClass}>{copy("E-Mail", "Email")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.eu"
                  required
                  autoComplete="email"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>{copy("Passwort", "Password")}</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={cn(fieldClass, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#01223F] dark:hover:text-white"
                    aria-label={showPassword ? (copy("Passwort verbergen", "Hide password")) : (copy("Passwort zeigen", "Show password"))}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <button type="submit" disabled={loading} className={buttonClass}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{copy("Anmelden", "Sign in")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setErrorMessage(null);
                }}
                className="text-sm text-slate-500 hover:text-[#01223F] dark:hover:text-white"
              >
                {copy("Passwort vergessen", "Forgot password")}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="px-6 sm:px-10 py-6 flex items-center gap-4 text-[12px] text-slate-400">
        <Link href="/datenschutz" className="hover:text-[#01223F] dark:hover:text-white">
          {copy("Datenschutz", "Privacy")}
        </Link>
        <Link href="/agb#impressum" className="hover:text-[#01223F] dark:hover:text-white">
          {copy("Impressum", "Legal notice")}
        </Link>
      </footer>
      </div>
    </Layout>
  );
}
