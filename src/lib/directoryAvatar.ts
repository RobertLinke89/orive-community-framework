// Card avatars for directory profiles: element emblem by default (no crawled photos – no image rights).
// A claimed profile can get its own uploaded avatar via .directory-data/avatars.json ({ "<slug>": "<url>" });
// only images from Orive's own Supabase "avatars" bucket are accepted. Read with a short cache, no rebuild needed.
import { readFileSync, statSync } from "fs";
import path from "path";
import { ELEMENT_OF, type ElementKey } from "@/components/directory/elements";

const FILE = path.join(process.cwd(), ".directory-data", "avatars.json");
let cache: { at: number; mtime: number; map: Map<string, string> } = { at: 0, mtime: -1, map: new Map() };

function allowedPrefix() {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return base ? `${base}/storage/v1/object/public/avatars/` : null;
}

function load(): Map<string, string> {
  if (Date.now() - cache.at < 60_000) return cache.map;
  cache.at = Date.now();
  try {
    const m = statSync(FILE).mtimeMs;
    if (m === cache.mtime) return cache.map;
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as Record<string, string>;
    const pre = allowedPrefix();
    const map = new Map<string, string>();
    for (const [slug, url] of Object.entries(raw || {})) if (pre && typeof url === "string" && url.startsWith(pre)) map.set(slug, url);
    cache = { at: Date.now(), mtime: m, map };
  } catch { cache = { at: Date.now(), mtime: -1, map: new Map() }; }
  return cache.map;
}

export function claimedAvatar(slug: string): string | null { return load().get(slug) ?? null; }

export function elementFor(p: { primary?: string; categories: string[] }): ElementKey {
  const primary = p.primary ?? p.categories.find((c) => ELEMENT_OF[c]) ?? p.categories[0];
  return (primary && ELEMENT_OF[primary]) || "aether";
}

export { countryName } from "./countryName";
