import type { CategoryKey } from "./categories";

/**
 * Public facilitator URL: orive.co/{category-slug}/{name-slug}, e.g. /breathwork/anna-mueller.
 * Category slugs = lowercase kebab-case of the category labels in categories.ts (the existing category
 * views only use the raw labels, e.g. /categories/Sound%20Healing, so there were no slugs to reuse).
 */
export const CATEGORY_SLUGS: Record<CategoryKey, string> = {
  breath: "breathwork",
  yoga: "yoga",
  meditation: "meditation",
  sound: "sound-healing",
  coaching: "life-coaching",
  bodywork: "bodywork",
  mindfulness: "mindfulness",
  spiritual: "spiritual-growth",
  kambo: "kambo",
  ice: "ice-bathing",
  sauna: "sauna-heat",
  personal: "personal-coaching",
};
const BY_SLUG = new Map(Object.entries(CATEGORY_SLUGS).map(([k, s]) => [s, k as CategoryKey]));

/** Only these exact strings are accepted as first segment; everything else 404s (no catch-all). */
export function categoryFromSlug(s: string | undefined | null): CategoryKey | null {
  return (s && BY_SLUG.get(s)) || null;
}

/** Top-level routes in src/app on main (checked 28.10.2026). A category slug must never equal one of these. */
export const RESERVED_TOP_LEVEL = [
  "about", "admin", "affiliate", "agb", "api", "app", "auth", "blog", "booking", "categories", "chat", "checkout",
  "claim", "datenschutz", "dezk", "event", "experience", "f", "facilitator", "features", "for-facilitators",
  "formation", "health", "impressum", "invest", "marketplace", "onboarding", "orive-dezk", "partner-terms", "pay",
  "product", "profil", "profiles", "protection", "reset-password", "services", "session", "shop", "waitlist",
  "whatsapp-assistant", "login", "signup", "robots.txt", "sitemap.xml", "_next",
] as const;

const TRANSLIT: Record<string, string> = { "ä": "ae", "ö": "oe", "ü": "ue", "Ä": "ae", "Ö": "oe", "Ü": "ue", "ß": "ss", "ẞ": "ss",
  "æ": "ae", "Æ": "ae", "ø": "oe", "Ø": "oe", "œ": "oe", "Œ": "oe", "å": "aa", "Å": "aa", "ł": "l", "Ł": "l", "đ": "d", "Đ": "d", "ð": "d", "þ": "th" };

/** Name -> ASCII kebab slug: ä->ae, ö->oe, ü->ue, ß->ss, other accents stripped, max 60 chars. */
export function nameSlug(name: string): string {
  const base = name.replace(/[äöüÄÖÜßẞæÆøØœŒåÅłŁđĐðþ]/g, (c) => TRANSLIT[c]).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\(.*?\)/g, " ").replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60).replace(/-+$/, "");
  return base.length >= 3 ? base : `facilitator-${base || "x"}`.slice(0, 60);
}

/** Second-level static routes under /{category}/ – never usable as a profile slug. */
export const RESERVED_PROFILE_SLUGS = ["angebote"] as const;

/** Unique within one category: anna-mueller, anna-mueller-2, anna-mueller-3 ... */
export function uniqueSlug(base: string, taken: Set<string>): string {
  for (const r of RESERVED_PROFILE_SLUGS) taken.add(r);
  let s = base;
  for (let i = 2; taken.has(s); i++) s = `${base.slice(0, 55).replace(/-+$/, "")}-${i}`;
  taken.add(s);
  return s;
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function profilePath(category: CategoryKey, slug: string) {
  return `/${CATEGORY_SLUGS[category]}/${slug}`;
}
export function profileUrl(category: CategoryKey, slug: string, origin = process.env.NEXT_PUBLIC_APP_URL || "https://orive.co") {
  return `${origin.replace(/\/$/, "")}${profilePath(category, slug)}`;
}
