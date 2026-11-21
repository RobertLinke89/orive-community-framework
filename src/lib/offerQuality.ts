/**
 * Display-time quality rules for crawled offers (no DB writes – same idea as the hide flag).
 * - isJunkOfferTitle: navigation text, legal/footer text, cancellations, fragments → hidden on cards/profiles/search.
 * - cleanOfferTitle: strips country prefixes like "DE · ", "CH · ".
 * - cleanDescription: original description only, HTML stripped, whitespace collapsed, trimmed at a sentence boundary.
 * - dedupeLocation: "Kernerstraße 36, 71672 Marbach am Neckar, Marbach am Neckar" → "Kernerstraße 36, 71672 Marbach am Neckar".
 */

const COUNTRY_PREFIX = /^\s*(?:DE|AT|CH|NL|BE|FR|IT|ES|PT|UK|GB|IE|DK|SE|NO|FI|PL|CZ|SK|HU|SI|HR|LU|EU)\s*[·•|:\-–]\s+/i;

export function cleanOfferTitle(title: string | null | undefined): string {
  let t = String(title || "").replace(/\s+/g, " ").trim();
  for (let i = 0; i < 2 && COUNTRY_PREFIX.test(t); i += 1) t = t.replace(COUNTRY_PREFIX, "").trim();
  // cut-off date tails from scraped tables: "Kakao & Klang, 11" -> "Kakao & Klang" (keeps prices like "€ 93,00")
  t = t.replace(/(\p{L})\s*,\s*\d{1,2}\.?$/u, "$1").trim();
  return t;
}

// Whole-title or leading words that are never an offer.
const JUNK_EXACT = new Set(
  [
    "absage", "abgesagt", "storniert", "stornierung", "storno", "stornobedingungen", "buchen", "jetzt buchen", "buchung", "termin buchen",
    "kurse", "kurs", "kursplan", "stundenplan", "angebote", "angebot", "preise", "preisliste", "preis", "mwst", "inkl. mwst", "zzgl. mwst",
    "rahmenbedingungen", "teilnahmebedingungen", "agb", "impressum", "datenschutz", "datenschutzerklärung", "kontakt", "home", "startseite",
    "gutschein", "gutscheine", "geschenkgutschein", "warenkorb", "anmelden", "anmeldung", "login", "newsletter", "mehr", "mehr erfahren",
    "weiterlesen", "details", "info", "infos", "termine", "aktuelles", "news", "blog", "shop", "faq", "team", "über uns", "about", "menu", "menü",
    "book now", "book", "booking", "cancel", "cancelled", "canceled", "cancellation", "prices", "price", "pricing", "vat", "terms", "privacy",
    "imprint", "contact", "voucher", "gift card", "cart", "sign in", "more", "read more", "learn more", "schedule", "courses", "classes",
    "free", "kostenlos", "gratis", "beitrag", "sonstiges", "allgemein", "neu", "new",
  ].map((s) => s.toLowerCase()),
);
const JUNK_START = /^(absage|abgesagt|storniert|stornierung|storno|fällt aus|entfällt|cancel(l)?ed|cancellation|agb|impressum|datenschutz|rahmenbedingungen|teilnahmebedingungen|zahlungsbedingungen|gutschein|warenkorb|newsletter|alle preise|preise inkl|inkl\.? mwst|zzgl\.? mwst|mwst|hinweis|bitte beachten|achtung|wichtig|cookie|copyright|©)\b/i;
const JUNK_ANYWHERE = /\b(mwst|umsatzsteuer|inkl\. ?ust|zzgl\.|cookie|javascript|404|seite nicht gefunden|page not found|alle rechte vorbehalten|all rights reserved)\b/i;

export function isJunkOfferTitle(raw: string | null | undefined): boolean {
  const t = cleanOfferTitle(raw);
  if (!t) return true;
  const lower = t.toLowerCase().replace(/[.:!?,;]+$/, "").trim();
  if (lower.length < 4) return true; // "Yin", "TRE" are rare; 1–3 chars is almost always noise
  if (t.length > 120) return true; // sentences / scraped paragraphs
  if ((t.match(/\p{L}/gu) || []).length < 3) return true; // punctuation, numbers or prices only
  if (JUNK_EXACT.has(lower)) return true;
  if (JUNK_START.test(lower)) return true;
  if (JUNK_ANYWHERE.test(lower)) return true;
  // Schedule/price-table fragments: "alle Termine 10x", "Termine Freitag, 25", "Für alle Samstags-Seminare gilt: …"
  if (/^(alle )?(termine|termin|uhrzeit|zeit|zeiten|datum|daten)\b/.test(lower) || /^für alle\b/.test(lower) || /\bgilt:/.test(lower)) return true;
  // Sentence fragments: starts lowercase with a conjunction/preposition, or ends with a dangling word.
  if (/^(und|oder|aber|mit|für|von|zu|zur|zum|bei|ab|bis|in|im|am|an|auf|aus|der|die|das|den|dem|ein|eine|and|or|but|with|for|of|to|the|a|an)\s/.test(t)) return true;
  if (/\s(und|oder|mit|für|von|zu|der|die|das|and|or|with|for|of|the)$/i.test(t)) return true;
  // Mostly a sentence: many words and a full stop in the middle.
  const words = t.split(/\s+/).length;
  if (words > 14) return true;
  if (words > 8) {
    const ABBR = /^(dr|med|univ|prof|dipl|mag|inkl|zzgl|bzw|ca|st|nr|str|vs|mr|mrs|ms)$/i; // "Dr. med." is not a sentence end
    for (const m of t.matchAll(/(\p{L}+)[.!?]\s+\p{Lu}/gu)) if (m[1].length >= 3 && !ABBR.test(m[1])) return true;
  }
  return false;
}

export function cleanDescription(raw: string | null | undefined, max = 1400): string {
  let t = String(raw || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (t.length > max) {
    const cut = t.slice(0, max);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("\n"));
    t = (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "")).trim() + (end > max * 0.5 ? "" : " …");
  }
  return t;
}

export function dedupeLocation(raw: string | null | undefined): string {
  const parts = String(raw || "").split(",").map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const pl = p.toLowerCase();
    // drop if an earlier part equals it or already ends with it ("71672 Marbach am Neckar" ⊃ "Marbach am Neckar")
    if (out.some((o) => { const ol = o.toLowerCase(); return ol === pl || ol.endsWith(" " + pl); })) continue;
    out.push(p);
  }
  return out.join(", ");
}

/** External stock/portrait URLs we must not show as a person's photo (no image rights, often blocked). */
export { isSafeAvatarUrl, isPlausibleImageUrl, isTruncatedUnsplashUrl } from "@/lib/safeImage";
