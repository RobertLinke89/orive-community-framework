// Fast thumbnails for the homepage offer feed (server only, 2026-11-10).
// Why: the feed images are hotlinked originals (often 0.2-2 MB, some hosts very slow). Through /_next/image every
// width was optimized on demand and that cache lived in .next, which every deploy replaced -> slow tiles.
// Here: one fetch per image, a 1080px WebP master and the few card widths are kept on disk in .directory-data
// (survives deploys), pre-warmed in the background for every image in the feed. Only offer ids from the checked
// offer-image index can be requested (no open proxy).
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/directorySample";
import { offerImageIndex } from "@/lib/offerImages";

const DIR = path.join(DATA_DIR, "img-cache");
export const THUMB_WIDTHS = [256, 384, 480, 640, 828, 1080] as const;
const WARM_WIDTHS = [256, 480, 828];
const MASTER = 1080;
const FAIL_RETRY_MS = 24 * 3600 * 1000;
const MAX_BYTES = 20 * 1024 * 1024;

export const snapWidth = (w: number) => THUMB_WIDTHS.find((x) => x >= w) ?? MASTER;
export const imageVersion = (url: string) => createHash("sha1").update(url).digest("hex").slice(0, 10);
const fileFor = (url: string, w: number | "fail") => path.join(DIR, `${imageVersion(url)}-${w}${w === "fail" ? "" : ".webp"}`);

type Sharp = typeof import("sharp");
let sharpMod: Sharp | null = null;
async function sharp(): Promise<Sharp> {
  if (!sharpMod) { const m = await import("sharp"); sharpMod = ((m as unknown as { default?: Sharp }).default ?? (m as unknown as Sharp)); }
  return sharpMod;
}

function write(file: string, buf: Buffer) {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, buf, { mode: 0o600 });
  renameSync(tmp, file);
}

async function fetchOriginal(url: string): Promise<Buffer> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 (compatible; ORIVE image thumbnail)", Accept: "image/webp,image/jpeg,image/png,*/*;q=0.5" } });
    if (!r.ok) throw new Error(`http ${r.status}`);
    const len = Number(r.headers.get("content-length") || 0);
    if (len > MAX_BYTES) throw new Error("too large");
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES || buf.length < 200) throw new Error("bad size");
    return buf;
  } finally { clearTimeout(t); }
}

const inflight = new Map<string, Promise<Buffer | null>>();

/** WebP master (max 1080px wide) for one source url; fetched once, then read from disk. */
async function master(url: string): Promise<Buffer | null> {
  const f = fileFor(url, MASTER);
  if (existsSync(f)) return readFileSync(f);
  const fail = fileFor(url, "fail");
  try { if (Date.now() - statSync(fail).mtimeMs < FAIL_RETRY_MS) return null; } catch { /* no fail mark */ }
  const key = `m:${url}`;
  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      try {
        const s = await sharp();
        const out = await s(await fetchOriginal(url), { failOn: "none" }).rotate().resize({ width: MASTER, withoutEnlargement: true }).webp({ quality: 72, effort: 3 }).toBuffer();
        write(f, out);
        return out;
      } catch {
        try { write(fail, Buffer.from(String(Date.now()))); } catch { /* ignore */ }
        return null;
      } finally { inflight.delete(key); }
    })();
    inflight.set(key, p);
  }
  return p;
}

/** Card-sized WebP for an offer image url at a snapped width. */
export async function thumbnail(url: string, width: number): Promise<Buffer | null> {
  const w = snapWidth(width);
  const f = fileFor(url, w);
  if (existsSync(f)) return readFileSync(f);
  const m = await master(url);
  if (!m) return null;
  if (w >= MASTER) return m;
  const key = `t:${url}:${w}`;
  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      try {
        const s = await sharp();
        const out = await s(m).resize({ width: w, withoutEnlargement: true }).webp({ quality: 66, effort: 3 }).toBuffer();
        write(f, out);
        return out;
      } catch { return null; } finally { inflight.delete(key); }
    })();
    inflight.set(key, p);
  }
  return p;
}

/** Image url for a checked offer id (null for anything else). */
export async function offerImageUrl(id: string): Promise<string | null> {
  const im = (await offerImageIndex()).get(id);
  return im?.url || null;
}

// Background pre-warm of the card widths for all images the feed can show (3 at a time, nice to the origins).
let warming: Promise<void> | null = null;
const warmed = new Set<string>();
export function warmThumbnails(urls: string[]) {
  const todo = urls.filter((u) => u && !warmed.has(u));
  if (!todo.length || warming) return;
  warming = (async () => {
    let i = 0;
    const worker = async () => {
      while (i < todo.length) {
        const u = todo[i++];
        warmed.add(u);
        for (const w of WARM_WIDTHS) { if (!(await thumbnail(u, w))) break; }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  })().catch(() => undefined).finally(() => { warming = null; });
}
