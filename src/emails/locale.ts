import { LOCALE_CODES, type Locale } from "./locales";

/**
 * Locale per facilitator: 1) website language (<html lang>, Content-Language or detected page language),
 * 2) country -> main language, 3) English. Multilingual countries default to the majority language
 * (CH de, BE nl, LU fr, CY el) – the website language overrides that whenever it is known.
 */
const COUNTRY: Record<string, Locale> = {
  germany: "de", austria: "de", switzerland: "de", liechtenstein: "de", netherlands: "nl", belgium: "nl", france: "fr", luxembourg: "fr", monaco: "fr",
  spain: "es", andorra: "es", italy: "it", "san marino": "it", portugal: "pt", poland: "pl", czechia: "cs", "czech republic": "cs", slovakia: "sk",
  denmark: "da", sweden: "sv", norway: "no", finland: "fi", hungary: "hu", romania: "ro", moldova: "ro", greece: "el", cyprus: "el",
  croatia: "hr", slovenia: "sl", "united kingdom": "en", ireland: "en", malta: "en", iceland: "en",
};
const ISO: Record<string, string> = { de: "germany", at: "austria", ch: "switzerland", nl: "netherlands", be: "belgium", fr: "france", lu: "luxembourg", es: "spain", it: "italy", pt: "portugal", pl: "poland",
  cz: "czechia", sk: "slovakia", dk: "denmark", se: "sweden", no: "norway", fi: "finland", hu: "hungary", ro: "romania", gr: "greece", cy: "cyprus", hr: "croatia", si: "slovenia", gb: "united kingdom", uk: "united kingdom", ie: "ireland", mt: "malta", is: "iceland" };
const ALIAS: Record<string, Locale> = { nb: "no", nn: "no", gsw: "de" };

/** "de-CH" / "nb_NO" / "EN" -> supported locale or null. */
export function normLang(v: string | null | undefined): Locale | null {
  const base = (v || "").trim().toLowerCase().split(/[-_\s,;]/)[0];
  const l = (ALIAS[base] || base) as Locale;
  return LOCALE_CODES.includes(l) ? l : null;
}
export function localeForCountry(country: string | null | undefined): Locale | null {
  const c = (country || "").trim().toLowerCase();
  return COUNTRY[c] || COUNTRY[ISO[c] || ""] || null;
}
export function pickLocale(f: { websiteLang?: string | null; country?: string | null }): Locale {
  return normLang(f.websiteLang) || localeForCountry(f.country) || "en";
}
/** <html lang="…"> or <meta http-equiv="content-language"> from fetched page HTML. */
export function htmlLang(html: string): string | null {
  return html.match(/<html[^>]*\slang\s*=\s*["']?([a-zA-Z_-]{2,12})/i)?.[1] ?? html.match(/http-equiv=["']content-language["'][^>]*content=["']([^"']+)/i)?.[1] ?? null;
}
