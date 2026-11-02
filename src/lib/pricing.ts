export type ParsedPrice = {
  amount: number | null;
  currencySymbol: string | null;
};

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeOriveMatchingFee(totalInclTax: number, rate: number = 0.05): number {
  return roundToCents(totalInclTax * rate);
}

export function parsePriceString(input: string): ParsedPrice {
  const raw = (input || "").trim();
  if (!raw) return { amount: null, currencySymbol: null };

  // Extract the first number (supports "1,234.56" and "1.234,56" loosely)
  const numMatch = raw.match(/-?\d[\d.,]*/);
  if (!numMatch) return { amount: null, currencySymbol: null };

  const numRaw = numMatch[0];
  const lastComma = numRaw.lastIndexOf(",");
  const lastDot = numRaw.lastIndexOf(".");

  // If comma appears after dot, assume comma is decimal separator.
  const normalized =
    lastComma > lastDot
      ? numRaw.replace(/\./g, "").replace(/,/g, ".")
      : numRaw.replace(/,/g, "");

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return { amount: null, currencySymbol: null };

  const symbolMatch = raw.match(/[€$£¥]/);
  return { amount, currencySymbol: symbolMatch?.[0] ?? null };
}

export function formatMoneyWithSymbol(amount: number, currencySymbol: string | null): string {
  const value = roundToCents(amount).toFixed(2);
  return currencySymbol ? `${currencySymbol}${value}` : value;
}
