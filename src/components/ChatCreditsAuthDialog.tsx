"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { CHAT_CREDIT_PLANS, FREE_MONTHLY_CREDITS } from "@/lib/chatCreditEngine";
import { cn } from "@/lib/utils";

type PlanId = "flex" | "power" | "lifetime";

type ChatCreditsAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutPending: string | null;
  onBuyPlan: (plan: PlanId) => void;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3 4.4 15l-2.1 1.6C3.7 19.5 7.5 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-5.9-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3 7.4A9.9 9.9 0 0 0 2 12c0 1.6.4 3.1 1 4.4l3.3-2.6A5.9 5.9 0 0 1 6 12c0-.8.2-1.5.4-2.2L3 7.4z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 7.5 2 3.7 4.5 2.3 8.4l3.3 2.6C6.9 7.8 9.2 5.9 12 5.9z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-1.9 1.1-2.9 1.1-2.9s-1-1.5-2.7-1.5c-1.2 0-1.8.6-2.6.6-.9 0-1.7-.6-2.7-.6-1.9.1-3.8 1.6-3.8 4.7 0 2.9 2.1 6.2 3.9 6.2.8 0 1.3-.5 2.3-.5 1 0 1.4.5 2.4.5 1.6 0 3.1-2.4 3.1-2.5-.1 0-2-1-2-3.5zM14.4 5.8c.7-.9 1.2-2.1 1.1-3.3-1.1.1-2.4.8-3.1 1.7-.7.8-1.2 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.6z" />
    </svg>
  );
}

export function ChatCreditsAuthDialog({
  open,
  onOpenChange,
  checkoutPending,
  onBuyPlan,
}: ChatCreditsAuthDialogProps) {
  const { copy } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    }).catch(() => {});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(provider: "google" | "apple") {
    setOauthPending(provider);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/chat`
          : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        toast.error(error.message || copy("Anmeldung fehlgeschlagen.", "Sign-in failed."));
        setOauthPending(null);
      }
    } catch {
      toast.error(copy("Anmeldung fehlgeschlagen.", "Sign-in failed."));
      setOauthPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-[#011B33] text-white shadow-2xl sm:rounded-3xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            {copy("Credits aufgebraucht", "Credits used up")}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-white/55">
            {signedIn
              ? copy(
                  `${FREE_MONTHLY_CREDITS} gratis Credits / Monat. Danach Prepaid — einmalig, ohne Abo.`,
                  `${FREE_MONTHLY_CREDITS} free credits / month. Then prepaid — one-time, no subscription.`
                )
              : copy(
                  `Melde dich an, um Credits zu sichern. ${FREE_MONTHLY_CREDITS} gratis / Monat · danach Pakete ohne Abo.`,
                  `Sign in to secure credits. ${FREE_MONTHLY_CREDITS} free / month · then packs, no subscription.`
                )}
          </DialogDescription>
        </DialogHeader>

        {!signedIn ? (
          <div className="mt-2 space-y-2.5">
            <button
              type="button"
              disabled={Boolean(oauthPending)}
              onClick={() => void signIn("google")}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
              )}
            >
              {oauthPending === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="h-4 w-4" />
              )}
              {copy("Weiter mit Google", "Continue with Google")}
            </button>
            <button
              type="button"
              disabled={Boolean(oauthPending)}
              onClick={() => void signIn("apple")}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-black text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:opacity-50"
              )}
            >
              {oauthPending === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AppleIcon className="h-4 w-4" />
              )}
              {copy("Weiter mit Apple", "Continue with Apple")}
            </button>
          </div>
        ) : null}

        <div className={cn("mt-4 space-y-2", !signedIn && "pt-2")}>
          {!signedIn ? (
            <p className="text-center text-[11px] uppercase tracking-[0.14em] text-white/35">
              {copy("Oder direkt aufladen", "Or top up directly")}
            </p>
          ) : null}
          <button
            type="button"
            disabled={Boolean(checkoutPending)}
            onClick={() => onBuyPlan("flex")}
            className="flex h-11 w-full items-center justify-between rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            <span>Spark</span>
            <span className="text-white/70">
              {checkoutPending === "flex"
                ? "…"
                : `${CHAT_CREDIT_PLANS.flex.priceLabel} · ${CHAT_CREDIT_PLANS.flex.credits}`}
            </span>
          </button>
          <button
            type="button"
            disabled={Boolean(checkoutPending)}
            onClick={() => onBuyPlan("power")}
            className="flex h-11 w-full items-center justify-between rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            <span>Flow</span>
            <span className="text-white/70">
              {checkoutPending === "power"
                ? "…"
                : `${CHAT_CREDIT_PLANS.power.priceLabel} · ${CHAT_CREDIT_PLANS.power.credits}`}
            </span>
          </button>
          <button
            type="button"
            disabled={Boolean(checkoutPending)}
            onClick={() => onBuyPlan("lifetime")}
            className="flex h-11 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#00CDAC]/25 to-[#02AAB0]/25 px-4 text-sm font-semibold text-white transition hover:from-[#00CDAC]/35 hover:to-[#02AAB0]/35 disabled:opacity-50"
          >
            <span>{copy("Lifetime Pass", "Lifetime Pass")}</span>
            <span className="text-white/70">
              {checkoutPending === "lifetime" ? "…" : CHAT_CREDIT_PLANS.lifetime.priceLabel}
            </span>
          </button>
        </div>

        <p className="text-center text-[11px] text-white/35">
          {copy("Kein Abo · Zahlung über Stripe", "No subscription · Pay via Stripe")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
