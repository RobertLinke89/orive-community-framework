// Hidden directory entries: crawled page titles, bare domains, generic words and placeholders instead of a real
// facilitator name. Hidden profiles return 404, are not listed on /facilitators and are dropped from search.
// Extra slugs can be hidden at runtime (no rebuild) via .directory-data/hidden.json: ["slug", ...] or [{ "slug": "..." }].
import { readFileSync, statSync } from "fs";
import path from "path";

const NAME_RULES: RegExp[] = [
  /startseite/i,
  /^(welkom|willkommen|welcome to|bienvenue|benvenut|bienvenid)/i,
  /^accueil\b/i,
  /site title|untitled|lorem ipsum|coming soon|under construction|just another wordpress|my wordpress/i,
  /^(https?:\/\/)?(www\.)?[a-z0-9-]+\.(pt|nl|de|com|ch|at|fr|be|it|es|eu|org|net|io|uk|dk|se|no|fi|pl|cz|sk|hu|gr|ie|lu)\/?$/i,
  /^(yoga|breathwork|meditation|mindfulness|achtsamkeit|kambo|sauna|eisbaden|coaching|massage|reiki|über uns|ueber uns|about us|home|kontakt|contact|yoga classes & retreats)$/i,
];
// Reviewed by hand (keyword lists / SEO page titles, not a provider name).
const HIDE_SLUGS = new Set([
  "shiatsu-massage-alternativmedizin-tcm-komplementarmedizin",
  "corsi-di-meditazione-a-milano-esperienza-e-crescita",
  "curso-mindfulness-mbsr-en-barcelona-en-2021-reduce-estres",
  "idei-colorate-tot-ce-e-nou-si-util-in-orasul-tau",
  "breathwork-atmung-koerperarbeit-workshop-kurs",
]);

const FILE = path.join(process.cwd(), ".directory-data", "hidden.json");
let fileCache: { mtime: number; set: Set<string> } | null = null;
let checkedAt = 0;
function fileSlugs(): Set<string> {
  if (fileCache && Date.now() - checkedAt < 10_000) return fileCache.set;
  checkedAt = Date.now();
  try {
    const m = statSync(FILE).mtimeMs;
    if (!fileCache || fileCache.mtime !== m) {
      const j = JSON.parse(readFileSync(FILE, "utf8"));
      const list = Array.isArray(j) ? j : [];
      fileCache = { mtime: m, set: new Set(list.map((x: any) => String(typeof x === "string" ? x : x?.slug || "").toLowerCase()).filter(Boolean)) };
    }
    return fileCache.set;
  } catch { fileCache = { mtime: 0, set: new Set() }; return fileCache.set; }
}

const junkMemo = new Map<string, boolean>();
export function isJunkName(name: string | null | undefined): boolean {
  const key = String(name || "");
  const hit = junkMemo.get(key);
  if (hit !== undefined) return hit;
  const v = junkCheck(key);
  if (junkMemo.size < 50_000) junkMemo.set(key, v);
  return v;
}
function junkCheck(name: string): boolean {
  const n = String(name || "").trim();
  if (n.length < 3 || !/\p{L}/u.test(n)) return true;
  return NAME_RULES.some((r) => r.test(n));
}

/** True when the profile must not be shown anywhere (junk name, hand-reviewed list or runtime hide file). */
export function isHiddenProfile(p: { slug: string; name: string }): boolean {
  const s = String(p.slug || "").toLowerCase();
  return HIDE_SLUGS.has(s) || fileSlugs().has(s) || isJunkName(p.name);
}
