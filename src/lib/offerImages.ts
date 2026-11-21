// Offer images for the homepage feed (server only). Uses only images that the crawler stored on the offer itself
// (facilitator_offers.image_url) and that belong to exactly one offer: page-wide images (logos, site headers,
// portraits reused across a facilitator's offers) are dropped. Every image is probed once (size + format) and the
// result is kept in .directory-data/offer-images.json, so the feed only shows images that really load and are
// large enough for an image card. Nothing is generated, nothing is written to the database.
import { readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/directorySample";
import { BLOCKED_OFFER_IMAGES } from "@/lib/offerImageBlock";

export type OfferImage = { url: string; startsAt: string | null; w: number; h: number };
type Row = { id: string; facilitator_id: string; image_url: string | null; starts_at: string | null };
type Probe = { ok: boolean; w: number; h: number; at: number };

const PROBE_FILE = path.join(DATA_DIR, "offer-images.json");
const TTL_MS = 30 * 60 * 1000;
const RETRY_FAILED_MS = 7 * 24 * 3600 * 1000;
// URL words that point to logos, portraits, page chrome or AI images – never used as an offer card.
const BAD_URL = /(portrait|portr[aä]t|profil|about|ueber-?mich|uber-?mich|team|headshot|author|founder|gruender|selfie|avatar|logo|icon|favicon|header|banner|placeholder|divider|button|badge|sprite|chatgpt|dall-?e|midjourney|qr|signature|unterschrift|\.svg|\.gif)/i;

let cands: { at: number; rows: Map<string, { url: string; startsAt: string | null }> } | null = null;
let candLoading: Promise<void> | null = null;
let probes: Record<string, Probe> | null = null;
let probing = false;

async function fetchAll<T>(base: string, key: string, q: string): Promise<T[]> {
  const out: T[] = []; const step = 1000;
  for (let from = 0; from <= 100000; from += step) {
    const r = await fetch(`${base}/rest/v1/${q}`, { cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + step - 1}`, "Range-Unit": "items" } });
    if (!r.ok && r.status !== 206) throw new Error(`offer images fetch ${r.status}`);
    const rows = (await r.json()) as T[];
    out.push(...rows);
    if (rows.length < step) break;
  }
  return out;
}

async function loadCandidates() {
  const base = (process.env.CRAWLER_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.CRAWLER_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) throw new Error("offer images: crawler DB not configured");
  const rows = await fetchAll<Row>(base, key, "facilitator_offers?select=id,facilitator_id,image_url,starts_at&image_url=not.is.null&order=id");
  const perFac = new Map<string, number>(); const global = new Map<string, number>();
  for (const r of rows) { const u = String(r.image_url || "").trim(); if (!u) continue; perFac.set(`${r.facilitator_id}|${u}`, (perFac.get(`${r.facilitator_id}|${u}`) || 0) + 1); global.set(u, (global.get(u) || 0) + 1); }
  const m = new Map<string, { url: string; startsAt: string | null }>();
  for (const r of rows) {
    const u = String(r.image_url || "").trim();
    if (!/^https:\/\/[^\s]+$/i.test(u) || BAD_URL.test(u)) continue;
    if ((perFac.get(`${r.facilitator_id}|${u}`) || 0) !== 1 || (global.get(u) || 0) !== 1) continue; // page-wide image
    if (BLOCKED_OFFER_IMAGES.has(r.id)) continue;
    m.set(r.id, { url: u, startsAt: r.starts_at });
  }
  cands = { at: Date.now(), rows: m };
}

function loadProbes() {
  if (probes) return probes;
  try { probes = JSON.parse(readFileSync(PROBE_FILE, "utf8")) as Record<string, Probe>; } catch { probes = {}; }
  return probes!;
}
function saveProbes() {
  try { mkdirSync(DATA_DIR, { recursive: true }); const tmp = PROBE_FILE + ".tmp"; writeFileSync(tmp, JSON.stringify(probes), { mode: 0o600 }); renameSync(tmp, PROBE_FILE); } catch { /* best effort */ }
}

/** Width/height from the first bytes of a JPEG, PNG or WebP file (no decoding, no dependency). */
export function imageSize(b: Uint8Array): { w: number; h: number; type: string } | null {
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength); return { w: v.getUint32(16), h: v.getUint32(20), type: "png" };
  }
  if (b.length > 30 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const fourcc = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (fourcc === "VP8 " && b.length > 30) return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff, type: "webp" };
    if (fourcc === "VP8L" && b.length > 25) { const x = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24); return { w: (x & 0x3fff) + 1, h: ((x >> 14) & 0x3fff) + 1, type: "webp" }; }
    if (fourcc === "VP8X" && b.length > 30) return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)), type: "webp" };
    return null;
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const mk = b[i + 1];
      if (mk === 0xd8 || mk === 0x01 || (mk >= 0xd0 && mk <= 0xd7) || mk === 0xff) { i++; continue; }
      const len = (b[i + 2] << 8) | b[i + 3];
      if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) return { w: (b[i + 7] << 8) | b[i + 8], h: (b[i + 5] << 8) | b[i + 6], type: "jpeg" };
      i += 2 + len;
    }
  }
  return null;
}

async function probeOne(url: string): Promise<Probe> {
  const at = Date.now();
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 (compatible; ORIVE image check)", Range: "bytes=0-262143", Accept: "image/avif,image/webp,image/jpeg,image/png,*/*;q=0.5" } });
    if (!r.ok && r.status !== 206) { clearTimeout(t); return { ok: false, w: 0, h: 0, at }; }
    const reader = r.body?.getReader(); const parts: Uint8Array[] = []; let n = 0;
    if (reader) { while (n < 262144) { const { done, value } = await reader.read(); if (done || !value) break; parts.push(value); n += value.length; } try { await reader.cancel(); } catch { /* ignore */ } }
    clearTimeout(t);
    const buf = new Uint8Array(n); let o = 0; for (const p of parts) { buf.set(p.subarray(0, Math.min(p.length, n - o)), o); o += p.length; if (o >= n) break; }
    const s = imageSize(buf);
    if (!s) return { ok: false, w: 0, h: 0, at };
    const ratio = s.w / Math.max(1, s.h);
    return { ok: s.w >= 480 && s.h >= 300 && ratio >= 0.75 && ratio <= 2.4, w: s.w, h: s.h, at };
  } catch { return { ok: false, w: 0, h: 0, at }; }
}

async function probeMissing() {
  if (probing || !cands) return;
  probing = true;
  try {
    const p = loadProbes();
    const todo = [...new Set([...cands.rows.values()].map((c) => c.url))].filter((u) => !p[u] || (!p[u].ok && Date.now() - p[u].at > RETRY_FAILED_MS));
    let done = 0;
    const worker = async () => { for (let u = todo.shift(); u; u = todo.shift()) { p[u] = await probeOne(u); if (++done % 50 === 0) saveProbes(); } };
    await Promise.all(Array.from({ length: 8 }, worker));
    saveProbes();
  } finally { probing = false; }
}

/** offer id -> checked image (only probed, loadable, card-sized images). Kicks off probing of new images in the background. */
export async function offerImageIndex(): Promise<Map<string, OfferImage>> {
  if (!cands || Date.now() - cands.at > TTL_MS) {
    if (!candLoading) candLoading = loadCandidates().catch((e) => { console.error("[offer-images]", String(e?.message || e)); if (!cands) cands = { at: Date.now() - TTL_MS + 60000, rows: new Map() }; }).finally(() => { candLoading = null; });
    if (!cands) await candLoading;
  }
  void probeMissing();
  const p = loadProbes(); const out = new Map<string, OfferImage>();
  for (const [id, c] of cands?.rows || []) { const pr = p[c.url]; if (pr?.ok) out.set(id, { url: c.url, startsAt: c.startsAt, w: pr.w, h: pr.h }); }
  return out;
}
export function offerImageProbeState() { return { probing, probed: Object.keys(loadProbes()).length, candidates: cands?.rows.size ?? 0 }; }
