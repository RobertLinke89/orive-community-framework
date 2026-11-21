"use client";

import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { isAuthenticated, loading } = useAuth();
  const { t, copy } = useLanguage();
  const authed = !loading && isAuthenticated;

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
            href={authed ? "/chat" : "/auth"}
            data-testid="nav-login-cta"
            className="inline-flex h-8 items-center justify-center rounded-full bg-[#00CDAC] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#02AAB0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CDAC]/50 sm:h-9 sm:px-5 sm:text-sm"
          >
            {authed ? copy("Mein Bereich", "My account") : (t("login") || copy("Anmelden", "Log in"))}
          </Link>
        </div>
      </div>
    </header>
  );
}
