/** Official EU languages + common EEA/European locales used on ORIVE. */
export type LocaleCode =
  | "bg"
  | "cs"
  | "da"
  | "de"
  | "el"
  | "en"
  | "es"
  | "et"
  | "fi"
  | "fr"
  | "ga"
  | "hr"
  | "hu"
  | "is"
  | "it"
  | "lt"
  | "lv"
  | "mt"
  | "nl"
  | "no"
  | "pl"
  | "pt"
  | "ro"
  | "sk"
  | "sl"
  | "sv"
  | "uk";

export type EuropeanLanguage = {
  code: LocaleCode;
  /** Native endonym shown in the switcher */
  native: string;
  /** English label */
  english: string;
};

export const EUROPEAN_LANGUAGES: EuropeanLanguage[] = [
  { code: "bg", native: "Български", english: "Bulgarian" },
  { code: "cs", native: "Čeština", english: "Czech" },
  { code: "da", native: "Dansk", english: "Danish" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "el", native: "Ελληνικά", english: "Greek" },
  { code: "en", native: "English", english: "English" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "et", native: "Eesti", english: "Estonian" },
  { code: "fi", native: "Suomi", english: "Finnish" },
  { code: "fr", native: "Français", english: "French" },
  { code: "ga", native: "Gaeilge", english: "Irish" },
  { code: "hr", native: "Hrvatski", english: "Croatian" },
  { code: "hu", native: "Magyar", english: "Hungarian" },
  { code: "is", native: "Íslenska", english: "Icelandic" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "lt", native: "Lietuvių", english: "Lithuanian" },
  { code: "lv", native: "Latviešu", english: "Latvian" },
  { code: "mt", native: "Malti", english: "Maltese" },
  { code: "nl", native: "Nederlands", english: "Dutch" },
  { code: "no", native: "Norsk", english: "Norwegian" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "ro", native: "Română", english: "Romanian" },
  { code: "sk", native: "Slovenčina", english: "Slovak" },
  { code: "sl", native: "Slovenščina", english: "Slovenian" },
  { code: "sv", native: "Svenska", english: "Swedish" },
  { code: "uk", native: "Українська", english: "Ukrainian" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "orive-locale";

export function isLocaleCode(value: string): value is LocaleCode {
  return EUROPEAN_LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguage(code: string): EuropeanLanguage {
  return EUROPEAN_LANGUAGES.find((lang) => lang.code === code) || EUROPEAN_LANGUAGES.find((lang) => lang.code === "en")!;
}

export function switcherLabel(code: string): string {
  const lang = getLanguage(code);
  return `${lang.native} (${lang.code.toUpperCase()})`;
}
