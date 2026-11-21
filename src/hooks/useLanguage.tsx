"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  EUROPEAN_LANGUAGES,
  LOCALE_STORAGE_KEY,
  getLanguage,
  isLocaleCode,
  type LocaleCode,
} from "@/lib/locales";

type Catalog = Record<string, string>;

type LanguageContextType = {
  language: LocaleCode;
  setLanguage: (lang: LocaleCode) => void;
  /** @deprecated Prefer `copy(de, en)` — true only when locale is German */
  isDe: boolean;
  locale: LocaleCode;
  /** Pick German / English authoring, with catalog lookup for other European locales */
  copy: (de: string, en: string) => string;
  t: (key: string) => string;
  languages: typeof EUROPEAN_LANGUAGES;
  catalogReady: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const catalogCache: Partial<Record<LocaleCode, Catalog>> = {
  en: {},
  de: {},
};

const catalogLoaders: Record<Exclude<LocaleCode, "en" | "de">, () => Promise<{ default: Catalog }>> = {
  bg: () => import("@/i18n/catalogs/bg.json"),
  cs: () => import("@/i18n/catalogs/cs.json"),
  da: () => import("@/i18n/catalogs/da.json"),
  el: () => import("@/i18n/catalogs/el.json"),
  es: () => import("@/i18n/catalogs/es.json"),
  et: () => import("@/i18n/catalogs/et.json"),
  fi: () => import("@/i18n/catalogs/fi.json"),
  fr: () => import("@/i18n/catalogs/fr.json"),
  ga: () => import("@/i18n/catalogs/ga.json"),
  hr: () => import("@/i18n/catalogs/hr.json"),
  hu: () => import("@/i18n/catalogs/hu.json"),
  is: () => import("@/i18n/catalogs/is.json"),
  it: () => import("@/i18n/catalogs/it.json"),
  lt: () => import("@/i18n/catalogs/lt.json"),
  lv: () => import("@/i18n/catalogs/lv.json"),
  mt: () => import("@/i18n/catalogs/mt.json"),
  nl: () => import("@/i18n/catalogs/nl.json"),
  no: () => import("@/i18n/catalogs/no.json"),
  pl: () => import("@/i18n/catalogs/pl.json"),
  pt: () => import("@/i18n/catalogs/pt.json"),
  ro: () => import("@/i18n/catalogs/ro.json"),
  sk: () => import("@/i18n/catalogs/sk.json"),
  sl: () => import("@/i18n/catalogs/sl.json"),
  sv: () => import("@/i18n/catalogs/sv.json"),
  uk: () => import("@/i18n/catalogs/uk.json"),
};

async function loadCatalog(code: LocaleCode): Promise<Catalog> {
  if (code === "en" || code === "de") return {};
  if (catalogCache[code]) return catalogCache[code]!;
  try {
    const mod = await catalogLoaders[code]();
    const data = (mod.default || mod) as Catalog;
    catalogCache[code] = data;
    return data;
  } catch {
    catalogCache[code] = {};
    return {};
  }
}

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    // Explicit ?lang=de|en in the URL wins (same rule as the server-rendered directory pages).
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q && isLocaleCode(q)) return q;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocaleCode(stored)) return stored;
    // No browser-language auto-detection: German is the default unless the visitor picks another language.
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

/** Legacy dictionary keys (EN). Used by older `t()` call sites. */
const DICT_EN: Record<string, string> = {
  home: "Home",
  about: "About",
  login: "Login",
  getStartedFree: "Get Started Free",
  learnMore: "Learn More",
  language: "Language",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  contact: "Contact",
};

const DICT_DE: Record<string, string> = {
  home: "Start",
  about: "Über uns",
  login: "Anmelden",
  getStartedFree: "Kostenlos starten",
  learnMore: "Mehr erfahren",
  language: "Sprache",
  privacyPolicy: "Datenschutz",
  termsOfService: "Nutzungsbedingungen",
  contact: "Kontakt",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [catalog, setCatalog] = useState<Catalog>({});
  const [catalogReady, setCatalogReady] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readStoredLocale();
    setLanguageState(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    setCatalogReady(language === "en" || language === "de");
    loadCatalog(language).then((data) => {
      if (!cancelled) {
        setCatalog(data);
        setCatalogReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language, hydrated]);

  const setLanguage = useCallback((lang: LocaleCode) => {
    setLanguageState(lang);
  }, []);

  const copy = useCallback(
    (de: string, en: string) => {
      if (language === "de") return de;
      if (language === "en") return en;
      return catalog[en] || catalog[de] || en;
    },
    [language, catalog]
  );

  const t = useCallback(
    (key: string) => {
      if (language === "de") return DICT_DE[key] || DICT_EN[key] || key;
      if (language === "en") return DICT_EN[key] || key;
      const en = DICT_EN[key];
      if (!en) return key;
      return catalog[en] || en;
    },
    [language, catalog]
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      isDe: language === "de",
      locale: language,
      copy,
      t,
      languages: EUROPEAN_LANGUAGES,
      catalogReady,
    }),
    [language, setLanguage, copy, t, catalogReady]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}

export { getLanguage, switcherLabel } from "@/lib/locales";
export type { LocaleCode };
