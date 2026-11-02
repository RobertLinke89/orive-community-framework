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
import { cn } from "@/lib/utils";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { startOAuth, OAUTH_ERROR_TEXT } from "@/lib/auth/oauth";

type PlanId = "flex" | "power" | "lifetime";

type ChatCreditsAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutPending: string | null;
  onBuyPlan: (plan: PlanId) => void;
};

export function ChatCreditsAuthDialog({
  open,
  onOpenChange,
  checkoutPending,
  onBuyPlan,
}: ChatCreditsAuthDialogProps) {
  const { copy, language } = useLanguage();
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

  // Seeker sign-in / sign-up. New accounts get the mandatory consent gate on /auth/callback before /chat.
  async function signIn(provider: "google" | "apple") {
    setOauthPending(provider);
    const { error } = await startOAuth(provider, "/chat", "seeker");
    if (error) {
      toast.error(OAUTH_ERROR_TEXT[error][language === "de" ? "de" : "en"]);
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
                  "Lade Prepaid nach — einmalig, ohne Abo. Danach geht die Suche weiter.",
                  "Top up prepaid credits — one-time, no subscription. Then keep searching."
                )
              : copy(
                  "Melde dich mit Google oder Apple an, um Credits zu sichern und weiter zu suchen.",
                  "Sign in with Google or Apple to unlock credits and keep searching."
                )}
          </DialogDescription>
        </DialogHeader>

        {!signedIn ? (
          <div className="mt-2">
            <OAuthButtons lang={language === "de" ? "de" : "en"} theme="dark" onSelect={(p) => void signIn(p)} disabled={Boolean(oauthPending)} busy={oauthPending} />
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
            <span>{copy("Prepaid Flex", "Prepaid Flex")}</span>
            <span className="text-white/70">
              {checkoutPending === "flex" ? "…" : "€9 · 100"}
            </span>
          </button>
          <button
            type="button"
            disabled={Boolean(checkoutPending)}
            onClick={() => onBuyPlan("power")}
            className="flex h-11 w-full items-center justify-between rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            <span>{copy("Prepaid Power", "Prepaid Power")}</span>
            <span className="text-white/70">
              {checkoutPending === "power" ? "…" : "€25 · 300"}
            </span>
          </button>
          <button
            type="button"
            disabled={Boolean(checkoutPending)}
            onClick={() => onBuyPlan("lifetime")}
            className="flex h-11 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#00CDAC]/25 to-[#02AAB0]/25 px-4 text-sm font-semibold text-white transition hover:from-[#00CDAC]/35 hover:to-[#02AAB0]/35 disabled:opacity-50"
          >
            <span>{copy("Lifetime Ticket", "Lifetime Ticket")}</span>
            <span className="text-white/70">
              {checkoutPending === "lifetime" ? "…" : "€500"}
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
