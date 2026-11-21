"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

// When notFound() is thrown from a dynamic page, Next 14 sends a bare error shell and renders this
// page client-side before the stylesheet is applied, which caused a large layout shift (CLS ~0.9).
// Gate the content until Tailwind's preflight is active (body margin 0); SSR'd 404s render immediately.
const cssReady = () => typeof document === "undefined" || getComputedStyle(document.body).marginTop === "0px";

export default function NotFound() {
  const { copy } = useLanguage();
  const [ready, setReady] = useState(cssReady);
  useEffect(() => {
    if (ready) return;
    let raf = 0; const t0 = performance.now();
    const tick = () => { if (cssReady() || performance.now() - t0 > 3000) setReady(true); else raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);
  if (!ready) return <div aria-busy="true" style={{ position: "fixed", inset: 0 }} />;
  const examples = [copy("Eisbaden Hamburg", "Ice bathing Hamburg"), copy("Yoga München", "Yoga Munich"), "Breathwork Berlin"];
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="flex w-full flex-1 items-center justify-center px-6 pb-16 pt-28">
        <div className="w-full max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00CDAC]">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white sm:text-4xl">
            {copy("Diese Seite gibt es nicht", "This page doesn’t exist")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-white/55">
            {copy(
              "Vielleicht hat sich der Link geändert oder das Profil wurde entfernt. Suche direkt nach einer Praxis oder einem Ort:",
              "The link may have changed or the profile was removed. Search for a practice or a place instead:"
            )}
          </p>
          <form method="get" action="/facilitators" role="search" className="mt-6 flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white p-1.5 pl-4 shadow-sm focus-within:border-[#00CDAC] dark:border-white/15 dark:bg-white/5">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <input name="q" maxLength={200} aria-label={copy("Suche", "Search")} placeholder={copy("z. B. Eisbaden in Hamburg, Yoga in München …", "e.g. ice bathing in Hamburg, yoga in Munich …")} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white" />
            <button type="submit" className="rounded-full bg-[#00CDAC] px-5 py-2 text-sm font-bold text-white hover:bg-[#02AAB0]">{copy("Suchen", "Search")}</button>
          </form>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {examples.map((q) => (
              <Link key={q} href={`/facilitators?q=${encodeURIComponent(q)}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-[#00CDAC]/60 dark:border-white/10 dark:text-white/60">{q}</Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/facilitators" className="inline-flex h-10 items-center rounded-full bg-[#01223F] px-5 font-semibold text-white hover:bg-[#01223F]/90 dark:bg-white dark:text-[#01223F]">
              {copy("Alle Facilitators entdecken", "Discover all facilitators")}
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-900 dark:text-white/55 dark:hover:text-white">{copy("Zur Startseite", "Back to home")}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
