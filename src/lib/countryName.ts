// Country name in the visitor's language via Intl (no data files), e.g. "DE" -> "Deutschland".
const dnCache = new Map<string, Intl.DisplayNames | null>();
/** Country name in the visitor's language (ISO2 -> "Deutschland"), falls back to the stored English name. */
export function countryName(code: string | null | undefined, fallback: string | null | undefined, lang: string): string | null {
  const cc = String(code || "").toUpperCase();
  if (!cc || cc.length !== 2) return fallback || null;
  const l = ["de", "en", "fr", "nl"].includes(lang) ? lang : "en";
  if (!dnCache.has(l)) { try { dnCache.set(l, new Intl.DisplayNames([l], { type: "region" })); } catch { dnCache.set(l, null); } }
  try { return dnCache.get(l)?.of(cc === "UK" ? "GB" : cc) || fallback || null; } catch { return fallback || null; }
}
