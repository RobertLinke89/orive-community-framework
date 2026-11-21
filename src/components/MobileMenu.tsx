"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sun, Moon, Monitor } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger
} from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function MobileMenu() {
  const { t, copy } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    // Directly apply the class to documentElement for instantaneous, rock-solid update
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (newTheme === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isSystemDark ? 'dark' : 'light');
      } else {
        root.classList.add(newTheme);
      }
    }
  };

  const navItems = [
    { title: copy('Start', 'Home'), url: '/' },
    { title: copy('Facilitators entdecken', 'Discover facilitators'), url: '/facilitators' },
    { title: copy('Marktplatz', 'Marketplace'), url: '/marketplace' },
    { title: copy('Für Facilitators', 'For Facilitators'), url: '/for-facilitators' },
    { title: 'ORIVE dezk', url: '/orive-dezk' },
    { title: 'Affiliate & Partner', url: '/affiliate' },
    { title: copy('Über uns', 'About'), url: '/about' },
  ];

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open Menu"
          className="p-2 -ml-2 text-foreground/80 hover:text-foreground transition-colors focus:outline-none flex items-center gap-2 group"
        >
          <Menu className="w-6 h-6 stroke-[1.5]" />
        </button>
      </SheetTrigger>

      <SheetContent 
        side="left" 
        className="w-[300px] sm:w-[340px] bg-white dark:bg-[#01223F] border-r border-gray-200/60 dark:border-white/10 p-8 flex flex-col justify-between z-[100]"
      >
        {/* Top: Logo (SheetContent provides single close button at top-right) */}
        <div>
          <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-white/5">
            <Link href="/" onClick={handleLinkClick} className="flex items-center">
              <img src="/orive-logo-wings.png" alt="ORIVE" className="h-3.5 w-auto object-contain" />
            </Link>
          </div>

          {/* Navigation Links: Minimal, clean, typographic */}
          <nav className="mt-8 flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={handleLinkClick}
                  className={cn(
                    "text-xl sm:text-2xl font-light py-2.5 transition-colors block tracking-tight",
                    isActive
                      ? "text-[#00CDAC] font-normal"
                      : "text-foreground/75 hover:text-[#00CDAC]"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Auth + Minimal Footer */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-5">
          <Link
            href="/auth"
            onClick={handleLinkClick}
            className="flex h-11 w-full items-center justify-center rounded-full bg-[#00CDAC] text-sm font-bold text-white transition hover:bg-[#02AAB0]"
          >
            {t('login') || copy('Anmelden', 'Log in')}
          </Link>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <LanguageSwitcher align="left" side="top" className="text-foreground font-semibold" />

            {/* Theme: System, Light, Dark - Instant touch/click segmented toggle */}
            {mounted && (
              <div 
                role="radiogroup" 
                aria-label="Theme selection" 
                className="flex items-center p-1 bg-gray-100/90 dark:bg-white/[0.08] rounded-lg border border-gray-200/50 dark:border-white/10 gap-0.5"
              >
                <button
                  type="button"
                  title="Auto (Systemeinstellung)"
                  aria-label="Auto (Systemeinstellung)"
                  onClick={() => handleThemeChange('system')}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                    theme === 'system'
                      ? "bg-white dark:bg-white/20 text-[#00CDAC] dark:text-[#00CDAC] shadow-xs font-semibold ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  title="Heller Modus (Light)"
                  aria-label="Heller Modus (Light)"
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                    theme === 'light'
                      ? "bg-white dark:bg-white/20 text-amber-500 dark:text-amber-400 shadow-xs font-semibold ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  title="Dunkler Modus (Dark)"
                  aria-label="Dunkler Modus (Dark)"
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                    theme === 'dark'
                      ? "bg-white dark:bg-white/20 text-sky-400 dark:text-sky-300 shadow-xs font-semibold ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-sky-400 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-muted-foreground">
            <span>© 2026 ORIVE</span>
            <div className="flex items-center gap-3">
              <Link href="/datenschutz" onClick={handleLinkClick} className="hover:text-foreground transition-colors">
                Datenschutz
              </Link>
              <Link href="/agb" onClick={handleLinkClick} className="hover:text-foreground transition-colors">
                AGB
              </Link>
            </div>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}