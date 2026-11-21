// "ab {price}" for directory cards and profile stats: the lowest real offer price (no invented values).
// Only offers with a positive price count; with mixed currencies the currency of the first priced offer wins.
export type FromPrice = { price: number; currency: string | null };
export function fromPrice(offers: { price: number | null; currency: string | null }[] | null | undefined): FromPrice | null {
  const priced = (offers || []).filter((o) => typeof o.price === "number" && Number.isFinite(o.price) && o.price > 0);
  if (!priced.length) return null;
  const cur = priced[0].currency || null;
  const same = priced.filter((o) => (o.currency || null) === cur);
  return { price: Math.min(...same.map((o) => o.price as number)), currency: cur };
}
export function fmtMoney(v: FromPrice | { price: number | null; currency: string | null }, lang: "de" | "en"): string | null {
  if (v.price == null) return null;
  const cur = v.currency || "EUR";
  try { return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", { style: "currency", currency: cur, maximumFractionDigits: Number.isInteger(v.price) ? 0 : 2, minimumFractionDigits: Number.isInteger(v.price) ? 0 : 2 }).format(v.price); }
  catch { return `${v.price} ${cur}`; }
}
