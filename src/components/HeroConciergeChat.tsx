"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getAnonClientHeaders, getAnonClientToken } from "@/lib/anonClientToken";
import { FREE_MONTHLY_CREDITS } from "@/lib/chatCreditEngine";

type CreditBalance = {
  remaining: number | null;
  freeRemaining: number;
  prepaid: number;
  lifetime: boolean;
};

const CHIPS_DE = ["Ich fühle mich überfordert", "Abend-Ausklang begleiten", "Morgenritual vorschlagen", "Was braucht mein Körper?"];
const CHIPS_EN = ["I feel overwhelmed", "Guide my evening wind-down", "Suggest a morning ritual", "What does my body need?"];

function openChatTab(message: string) {
  const url = `/chat?q=${encodeURIComponent(message.trim())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function HeroConciergeChat() {
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const chips = isDe ? CHIPS_DE : CHIPS_EN;

  const [input, setInput] = useState("");
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  const refreshBalance = useCallback(async () => {
    getAnonClientToken();
    try {
      const res = await fetch("/api/chat/credits", {
        headers: getAnonClientHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setBalance({
        remaining: data.remaining,
        freeRemaining: data.freeRemaining,
        prepaid: data.prepaid,
        lifetime: Boolean(data.lifetime),
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  function launch(raw: string) {
    const message = raw.trim();
    if (!message) return;
    getAnonClientToken();
    setInput("");
    openChatTab(message);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    launch(input);
  }

  const balanceLabel = balance?.lifetime
    ? copy("Unbegrenzt", "Unlimited")
    : typeof balance?.remaining === "number"
      ? copy(`${balance.remaining} Credits`, `${balance.remaining} credits`)
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-2">
      <form
        onSubmit={onSubmit}
        data-zen-origin
        className="rounded-2xl sm:rounded-full border-2 border-slate-200 bg-white shadow-[0_12px_36px_-8px_rgba(15,23,42,0.12)] transition-colors focus-within:border-[#00CDAC] dark:border-white/15 dark:bg-[#02182B] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy(
              "z. B. Ich kann nicht schlafen — was hilft heute Nacht?",
              "e.g. I can't sleep — what helps tonight?"
            )}
            className="min-w-0 flex-1 bg-transparent border-0 px-2 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={copy("Im Chat öffnen", "Open in chat")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00CDAC] to-[#02AAB0] text-white disabled:opacity-40"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <div className="mt-2.5 flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto px-1 no-scrollbar sm:gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => launch(chip)}
            className="shrink-0 rounded-full border border-slate-200/90 bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-600 transition hover:border-[#00CDAC]/50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white sm:px-3 sm:py-1.5 sm:text-[11px]"
          >
            {chip}
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-white/35">
        {balanceLabel
          ? copy(
              `${balanceLabel} · ${FREE_MONTHLY_CREDITS} gratis / Monat · Kein Abo`,
              `${balanceLabel} · ${FREE_MONTHLY_CREDITS} free / month · No subscription`
            )
          : copy(
              `${FREE_MONTHLY_CREDITS} gratis Credits / Monat · Danach Prepaid · Kein Abo`,
              `${FREE_MONTHLY_CREDITS} free credits / month · Then prepaid · No subscription`
            )}
        {" · "}
        <Link href="/chat" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          {copy("Volle Ansicht", "Full view")}
        </Link>
      </p>
    </div>
  );
}
