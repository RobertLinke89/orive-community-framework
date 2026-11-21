"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getAnonClientToken } from "@/lib/anonClientToken";
import { FREE_MONTHLY_CREDITS } from "@/lib/chatCreditEngine";

// Search examples: the hero input searches all directory facilitators + offers (AI search) and opens the results in the chat.
const CHIPS_DE = ["Eisbaden in Hamburg", "Yoga in München", "Breathwork Berlin", "Klangschalen Wien"];
const CHIPS_EN = ["Ice bathing in Hamburg", "Yoga in Munich", "Breathwork Berlin", "Sound bath Vienna"];


export function HeroConciergeChat() {
  const { language, copy } = useLanguage();
  const router = useRouter();
  const isDe = language === "de";
  const chips = isDe ? CHIPS_DE : CHIPS_EN;

  const [input, setInput] = useState("");
  const [dirTotal, setDirTotal] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/directory/stats").then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive && j && typeof j.total === "number" && j.total > 0) setDirTotal(j.total); }).catch(() => {});
    return () => { alive = false; };
  }, []);


  function launch(raw: string) {
    const message = raw.trim();
    if (!message) return;
    getAnonClientToken();
    // Same tab: a new tab from a form submit is blocked by many mobile browsers and loses the user.
    router.push(`/chat?q=${encodeURIComponent(message)}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    launch(input);
  }


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
              "z. B. Eisbaden in Hamburg, Yoga in München …",
              "e.g. ice bathing in Hamburg, yoga in Munich …"
            )}
            className="min-w-0 flex-1 bg-transparent border-0 px-2 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={copy("Suchen", "Search")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00CDAC] to-[#02AAB0] text-white disabled:opacity-40"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <div className="mt-2.5 hidden lg:mt-5 lg:flex flex-nowrap items-center justify-center gap-2 overflow-x-auto px-1 no-scrollbar">
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

      <div className="mt-3 hidden lg:mt-5 lg:flex justify-center">
        <Link
          href="/facilitators"
          data-testid="hero-directory-cta"
          className="group inline-flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-[#008975] shadow-sm ring-1 ring-[#00CDAC]/30 backdrop-blur transition hover:bg-white hover:ring-[#00CDAC]/60 dark:bg-white/10 dark:text-[#00CDAC] sm:text-sm"
        >
          {dirTotal
            ? copy(`Alle ${dirTotal.toLocaleString("de-DE")} Facilitators entdecken`, `Discover all ${dirTotal.toLocaleString("en-GB")} facilitators`)
            : copy("Alle Facilitators entdecken", "Discover all facilitators")}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="mt-2 hidden lg:mt-4 lg:block text-center text-[11px] text-slate-500 dark:text-white/45">
        {copy(
          `KI-Suche über alle Facilitators und Angebote · ${FREE_MONTHLY_CREDITS} Anfragen pro Monat kostenlos, ohne Abo`,
          `AI search across all facilitators and offers · ${FREE_MONTHLY_CREDITS} free requests per month, no subscription`
        )}
      </p>
    </div>
  );
}
