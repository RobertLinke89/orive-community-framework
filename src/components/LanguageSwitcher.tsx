"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { switcherLabel, type LocaleCode } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  align = "right",
  compact = false,
}: {
  className?: string;
  align?: "left" | "right";
  /** Navbar style: globe + locale code only */
  compact?: boolean;
}) {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className={cn(
          "flex items-center focus:outline-none transition-colors",
          compact
            ? "gap-1 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white/80 text-xs font-semibold"
            : "gap-1.5 hover:text-slate-950 dark:hover:text-white"
        )}
      >
        <Globe
          className={cn(
            "w-4 h-4 shrink-0",
            !compact && "text-slate-500 dark:text-slate-400"
          )}
        />
        <span
          className={cn(
            "whitespace-nowrap",
            compact ? "text-[11px] uppercase tracking-wider" : undefined
          )}
        >
          {compact ? language.toUpperCase() : switcherLabel(language)}
        </span>
        {!compact ? (
          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
        ) : null}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Language"
          className={cn(
            "absolute z-[60] mt-2 max-h-72 w-[15.5rem] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-white/12 dark:bg-[#02182B]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {languages.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLanguage(lang.code as LocaleCode);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors",
                  active
                    ? "bg-[#00CDAC]/12 text-[#01223F] dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-white/70 dark:hover:bg-white/5"
                )}
              >
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{lang.native}</span>
                  <span className="block text-[10px] text-slate-400 dark:text-white/35">
                    {lang.english} · {lang.code.toUpperCase()}
                  </span>
                </span>
                {active ? <Check className="w-3.5 h-3.5 shrink-0 text-[#00CDAC]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
