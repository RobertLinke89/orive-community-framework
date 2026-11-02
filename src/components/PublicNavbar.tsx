"use client";

import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { cn } from "@/lib/utils";

type PublicNavbarProps = {
  /** Use when the page already sits on a dark canvas (e.g. chat). */
  tone?: "auto" | "dark";
  className?: string;
  fixed?: boolean;
};

export function PublicNavbar({
  tone = "auto",
  className,
  fixed = true,
}: PublicNavbarProps) {
  const darkLocked = tone === "dark";

  return (
    <header
      className={cn(
        fixed ? "fixed top-0 left-0 right-0 z-50" : "relative z-50",
        darkLocked
          ? "bg-[#01223F]/95 backdrop-blur-xl border-b border-white/10"
          : "bg-white/90 dark:bg-[#01223F]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10",
        "transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="relative mx-auto flex h-16 w-full items-center justify-between px-4 py-3 sm:px-8">
        <div className="z-10 flex shrink-0 items-center">
          <MobileMenu />
        </div>

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 group"
          aria-label="ORIVE"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/orive-logo-wings.png"
            alt="ORIVE"
            className="h-3.5 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-4"
          />
        </Link>

        <div className="z-10 flex shrink-0 items-center justify-end">
          <Link
            href="/marketplace"
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2",
              darkLocked
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            )}
          >
            Community
          </Link>
        </div>
      </div>
    </header>
  );
}
