"use client";

import Link from 'next/link';
import { Sun, Moon, Shield } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { IMPRESSUM_READY } from '@/lib/impressumData';

export function Footer() {
  const { copy } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(nextTheme);
    }
  };

  return (
    <footer className="w-full bg-[#F7F7F7] dark:bg-[#031525] border-t border-slate-200/80 dark:border-white/10 text-slate-500/75 dark:text-white/40 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {copy("Entdecken & Buchen", "Explore & Book")}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/facilitators" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Facilitator-Verzeichnis", "Facilitator Directory")}
                </Link>
              </li>
              <li>
                <Link href="/categories/all?type=individual" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("1:1 Einzelsessions", "1:1 Private Sessions")}
                </Link>
              </li>
              <li>
                <Link href="/categories/all?type=event" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Events, Workshops & Retreats", "Events, Workshops & Retreats")}
                </Link>
              </li>
              <li>
                <Link href="/categories/Breathwork" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Atemarbeit & Breathwork", "Breathwork & Pranayama")}
                </Link>
              </li>
              <li>
                <Link href="/categories/Yoga" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Yoga & Somatik", "Yoga & Somatics")}
                </Link>
              </li>
              <li>
                <Link href="/categories/Sound Healing" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Sound Healing & Klangbäder", "Sound Healing & Baths")}
                </Link>
              </li>
              <li>
                <Link href="/categories/all" className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white/90 transition-colors font-medium text-slate-700 dark:text-white/55">
                  <span>{copy("Alle Kategorien anzeigen", "See all categories")}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {copy("Für Facilitators", "For Facilitators")}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/for-facilitators" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Werde ORIVE Facilitator", "Become an ORIVE Facilitator")}
                </Link>
              </li>
              <li>
                <Link href="/orive-dezk" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  ORIVE dezk
                </Link>
              </li>
              <li>
                <Link href="/dezk" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("dezk Dashboard", "dezk workspace")}
                </Link>
              </li>
              <li>
                <Link href="/dezk/start" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Angebot erstellen & listen", "Create & list offering")}
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Affiliate & Partnerprogramm", "Affiliate & Partners")}
                </Link>
              </li>
              <li>
                <Link href="/for-facilitators#manifesto" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Mission & Europäischer Footprint", "Mission & European Footprint")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ORIVE
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Über uns & Vision", "About Us & Vision")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {copy("Sicherheit & Rechtliches", "Trust & Legal")}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/protection" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-[#00CDAC]/70" />
                  <span>{copy("Buchung & Zahlung (noch nicht aktiv)", "Booking & payment (not active yet)")}</span>
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("AGB", "Terms of use")}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Datenschutzerklärung", "Privacy Policy")}
                </Link>
              </li>
              {IMPRESSUM_READY ? (
                <li>
                  <Link href="/impressum" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">Impressum</Link>
                </li>
              ) : null}
              <li>
                <Link href="/partner-terms" className="hover:text-slate-900 dark:hover:text-white/90 transition-colors">
                  {copy("Partner AGB & Vergütung", "Partner terms & payouts")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-[#02101e]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-slate-500 dark:text-slate-400">
            <span>© 2026 ORIVE</span>
            <Link href="/agb" className="hover:underline">{copy("AGB", "Terms")}</Link>
            <Link href="/datenschutz" className="hover:underline">{copy("Datenschutz", "Privacy")}</Link>
            {IMPRESSUM_READY ? <Link href="/impressum" className="hover:underline">Impressum</Link> : null}
          </div>

          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-semibold shrink-0">
            <LanguageSwitcher side="top" />
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-600 dark:text-slate-300">€ EUR</span>
            {mounted && (
              <>
                <span className="text-slate-400 dark:text-slate-500">·</span>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  aria-label="Toggle theme"
                  className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-white transition-all focus:outline-none"
                  title={resolvedTheme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
