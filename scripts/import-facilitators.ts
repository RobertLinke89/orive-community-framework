/**
 * Crawler -> Orive import (claimable drafts + 3 preset offers + claim tokens).
 *
 *   npx vite-node scripts/import-facilitators.ts -- [--apply] [--limit 100] [--category Yoga] [--out claim-links.csv]
 *
 * Default is DRY RUN (reads crawler, prints what would be written, writes nothing).
 * Source  : CRAWLER_SUPABASE_URL + CRAWLER_SUPABASE_KEY (read-only key is enough)
 * Target  : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  (use a branch/test DB first!)
 * Tokens  : CLAIM_TOKEN_SECRET, CLAIM_TOKEN_TTL_DAYS (default 30)
 * The CSV (name,email,claim_url,expires_at) is the only place plain tokens exist; the DB keeps hashes.
 * Idempotent: rows already imported (source_facilitator_id) and suppressed (opt-out) are skipped.
 */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { mapCrawlerRow, offersFor, type CrawlerFacilitator } from "../src/lib/claim/mapCrawler";
import { signClaimToken, claimUrl, suppressionKey } from "../src/lib/claim/claimToken";
import { profilePath } from "../src/lib/claim/slugs";
import type { CategoryKey } from "../src/lib/claim/categories";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const APPLY = flag("apply");
const LIMIT = Number(opt("limit", "500"));
const CATEGORY = opt("category");
const OUT = opt("out", "claim-links.csv")!;
const TTL = Number(process.env.CLAIM_TOKEN_TTL_DAYS || 30);

function need(n: string) { const v = process.env[n]; if (!v) { console.error(`missing env ${n}`); process.exit(2); } return v; }

async function main() {
  const src = createClient(need("CRAWLER_SUPABASE_URL"), need("CRAWLER_SUPABASE_KEY"), { auth: { persistSession: false } });
  const dst = APPLY ? createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } }) : null;
  if (APPLY) need("CLAIM_TOKEN_SECRET");

  let q = src.from("facilitators").select("id,name,categories,kambo_flag,city,country,website,email,phone,instagram,source_url,source,quality_score,quality_tier").order("created_at").limit(LIMIT);
  if (CATEGORY) q = q.contains("categories", [CATEGORY]);
  const { data: rows, error } = await q;
  if (error) throw error;

  const taken = new Map<CategoryKey, Set<string>>();
  const known = new Set<string>();
  const suppressed = new Set<string>();
  if (dst) {
    const { data: ex } = await dst.from("claimable_profiles").select("slug,category,source_facilitator_id");
    ex?.forEach((r) => { if (!taken.has(r.category)) taken.set(r.category, new Set()); taken.get(r.category)!.add(r.slug); known.add(r.source_facilitator_id); });
    const { data: sup } = await dst.from("crawler_suppressions").select("key_hash");
    sup?.forEach((r) => suppressed.add(r.key_hash));
  }

  const csv: string[] = ["name,email,category,claim_url,expires_at"];
  let created = 0, skipped = 0;
  for (const r of (rows || []) as CrawlerFacilitator[]) {
    if (known.has(r.id) || suppressed.has(suppressionKey("source", r.id)) || (r.email && suppressed.has(suppressionKey("email", r.email)))) { skipped++; continue; }
    const m = mapCrawlerRow(r, taken);
    if (!m) { skipped++; continue; }
    // Quality model v1: tier "reject" (< 50) is not invited (orive-quality/criteria.md). Override with --include-reject.
    if (m.quality_tier === "reject" && !flag("include-reject")) { skipped++; continue; }
    if (!dst) { console.log(`[dry] ${profilePath(m.category, m.slug)} <- ${m.display_name}`); created++; continue; }
    const { data: p, error: e1 } = await dst.from("claimable_profiles").insert(m).select("id").single();
    if (e1 || !p) { console.error(`insert failed ${m.slug}: ${e1?.message}`); skipped++; continue; }
    const offers = offersFor(m.category).map((o) => ({ claimable_profile_id: p.id, position: o.position, title: o.title, description: o.description,
      duration_minutes: o.durationMinutes, format: o.format, price_amount: o.priceAmount, is_preset: true }));
    await dst.from("claimable_offers").insert(offers);
    const tok = signClaimToken({ ttlDays: TTL });
    await dst.from("claim_tokens").insert({ claimable_profile_id: p.id, token_hash: tok.hash, expires_at: tok.expiresAt.toISOString() });
    // Deletion deadline (RETENTION.unclaimed_draft_days) counts from the invite. Set when the link is handed to the mailer.
    await dst.from("claimable_profiles").update({ invited_at: new Date().toISOString() }).eq("id", p.id);
    const esc = (s: string | null) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    csv.push([esc(m.display_name), esc(m.contact_email), m.category, claimUrl(tok.token), tok.expiresAt.toISOString()].join(","));
    created++;
  }
  if (dst) { fs.writeFileSync(OUT, csv.join("\n") + "\n", { mode: 0o600 }); console.log(`claim links -> ${OUT} (keep private)`); }
  console.log(`${APPLY ? "imported" : "would import"}: ${created}, skipped: ${skipped}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
