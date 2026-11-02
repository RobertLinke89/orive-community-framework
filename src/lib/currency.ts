/** Common fiat currencies with ECB/Frankfurter coverage (EUR base). */
export type FiatCurrency = {
  code: string;
  symbol: string;
  label: string;
  labelDe: string;
};

export const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: "EUR", symbol: "€", label: "Euro", labelDe: "Euro" },
  { code: "USD", symbol: "$", label: "US Dollar", labelDe: "US-Dollar" },
  { code: "GBP", symbol: "£", label: "British Pound", labelDe: "Pfund Sterling" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", labelDe: "Schweizer Franken" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona", labelDe: "Schwedische Krone" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone", labelDe: "Norwegische Krone" },
  { code: "DKK", symbol: "kr", label: "Danish Krone", labelDe: "Dänische Krone" },
  { code: "PLN", symbol: "zł", label: "Polish Złoty", labelDe: "Polnischer Złoty" },
  { code: "CZK", symbol: "Kč", label: "Czech Koruna", labelDe: "Tschechische Krone" },
  { code: "HUF", symbol: "Ft", label: "Hungarian Forint", labelDe: "Ungarischer Forint" },
  { code: "RON", symbol: "lei", label: "Romanian Leu", labelDe: "Rumänischer Leu" },
  { code: "BGN", symbol: "лв", label: "Bulgarian Lev", labelDe: "Bulgarischer Lew" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira", labelDe: "Türkische Lira" },
  { code: "USD", symbol: "$", label: "US Dollar", labelDe: "US-Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", labelDe: "Kanadischer Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", labelDe: "Australischer Dollar" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar", labelDe: "Neuseeland-Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", labelDe: "Japanischer Yen" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", labelDe: "Chinesischer Yuan" },
  { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar", labelDe: "Hongkong-Dollar" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", labelDe: "Singapur-Dollar" },
  { code: "KRW", symbol: "₩", label: "South Korean Won", labelDe: "Südkoreanischer Won" },
  { code: "INR", symbol: "₹", label: "Indian Rupee", labelDe: "Indische Rupie" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", labelDe: "Brasilianischer Real" },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", labelDe: "Mexikanischer Peso" },
  { code: "ZAR", symbol: "R", label: "South African Rand", labelDe: "Südafrikanischer Rand" },
  { code: "ILS", symbol: "₪", label: "Israeli Shekel", labelDe: "Israelischer Schekel" },
  { code: "THB", symbol: "฿", label: "Thai Baht", labelDe: "Thailändischer Baht" },
  { code: "PHP", symbol: "₱", label: "Philippine Peso", labelDe: "Philippinischer Peso" },
  { code: "MYR", symbol: "RM", label: "Malaysian Ringgit", labelDe: "Malaysischer Ringgit" },
  { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah", labelDe: "Indonesische Rupiah" },
  { code: "ISK", symbol: "kr", label: "Icelandic Króna", labelDe: "Isländische Krone" },
];

/** Deduped unique list (USD appeared once above intentionally removed duplicate). */
export const UNIQUE_FIAT_CURRENCIES: FiatCurrency[] = (() => {
  const seen = new Set<string>();
  return FIAT_CURRENCIES.filter((item) => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
})();

export const DEFAULT_CURRENCY = "EUR";
export const CURRENCY_STORAGE_KEY = "orive-currency";

export type FxRates = {
  base: "EUR";
  date: string;
  rates: Record<string, number>;
};

export function getFiat(code: string): FiatCurrency {
  return UNIQUE_FIAT_CURRENCIES.find((item) => item.code === code) || UNIQUE_FIAT_CURRENCIES[0];
}

export function convertFromEur(amountEur: number, currency: string, rates: Record<string, number> | null | undefined): number {
  if (!Number.isFinite(amountEur)) return NaN;
  if (currency === "EUR") return amountEur;
  const rate = rates?.[currency];
  if (!rate || !Number.isFinite(rate)) return NaN;
  return amountEur * rate;
}

export function formatConvertedMoney(
  amountEur: number,
  currency: string,
  rates: Record<string, number> | null | undefined,
  locale = "de-DE"
): string | null {
  const converted = convertFromEur(amountEur, currency, rates);
  if (!Number.isFinite(converted)) return null;
  const zeroDecimal = new Set(["JPY", "KRW", "HUF", "IDR", "ISK", "CLP", "VND"]);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: zeroDecimal.has(currency) ? 0 : 2,
      minimumFractionDigits: zeroDecimal.has(currency) ? 0 : undefined,
    }).format(converted);
  } catch {
    const fiat = getFiat(currency);
    const rounded = zeroDecimal.has(currency) ? Math.round(converted) : Math.round(converted * 100) / 100;
    return `${fiat.symbol}${rounded}`;
  }
}

/** Parse offering price strings like "€40", "40", "€95 /hr", "Free". */
export function parseOfferingEuros(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") return Number.isFinite(input) && input > 0 ? input : null;
  const raw = String(input).trim();
  if (!raw || /^free$/i.test(raw) || raw === "0") return null;
  const numMatch = raw.replace(/\/hr/i, "").match(/-?\d[\d.,]*/);
  if (!numMatch) return null;
  const numRaw = numMatch[0];
  const lastComma = numRaw.lastIndexOf(",");
  const lastDot = numRaw.lastIndexOf(".");
  const normalized =
    lastComma > lastDot
      ? numRaw.replace(/\./g, "").replace(/,/g, ".")
      : numRaw.replace(/,/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
