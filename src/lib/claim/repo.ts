import { serverDb } from "@/lib/serverDb";
import { PUBLIC_OR_FILTER } from "./visibility";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryKey } from "./categories";
import { ClaimError, type ClaimRepo, type ClaimableOffer, type ClaimableProfile, type OfferPatch } from "./types";

const PROFILE_COLS = "id,slug,display_name,category,categories,city,country,website,instagram,colourway,cover_key,status,claimed_by,profile_id,contact_email,source_facilitator_id,bio,quality_score,quality_tier,terms_consented_at,published_at,hidden_at";
/** Public visibility gate (see src/lib/claim/visibility.ts): not hidden AND (approved batch OR claimed + consented). */
const PUBLIC_OR = PUBLIC_OR_FILTER;
const OFFER_COLS = "id,position,title,description,duration_minutes,format,price_amount,currency,is_preset,offering_id";

let override: ClaimRepo | null = null;
export function setClaimRepoForTests(r: ClaimRepo | null) { override = r; }

export function claimRepo(): ClaimRepo {
  if (override) return override;
  const db = serverDb();
  if (!db) throw new ClaimError("unavailable");
  return supabaseClaimRepo(db);
}

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const offers = (rows: any[] | null): ClaimableOffer[] =>
  (rows || []).map((r) => ({ ...r, price_amount: num(r.price_amount) })).sort((a, b) => a.position - b.position);

export function supabaseClaimRepo(db: SupabaseClient): ClaimRepo {
  async function loadOffers(id: string) {
    const { data } = await db.from("claimable_offers").select(OFFER_COLS).eq("claimable_profile_id", id);
    return offers(data);
  }
  async function ownedOffer(userId: string, offerId: string) {
    const { data } = await db.from("claimable_offers")
      .select(`${OFFER_COLS},claimable_profiles!inner(claimed_by,status)`)
      .eq("id", offerId).eq("claimable_profiles.claimed_by", userId).maybeSingle();
    return data as any;
  }
  return {
    async byTokenHash(hash) {
      const { data: t } = await db.from("claim_tokens").select("claimable_profile_id,expires_at,used_at,revoked_at").eq("token_hash", hash).maybeSingle();
      if (!t) return null;
      const { data: p } = await db.from("claimable_profiles").select(PROFILE_COLS).eq("id", t.claimable_profile_id).maybeSingle();
      if (!p) return null;
      return { profile: p as ClaimableProfile, offers: await loadOffers(p.id), token: t };
    },
    async liveByPath(category, slug) {
      const { data: p } = await db.from("claimable_profiles").select(PROFILE_COLS)
        .eq("category", category).eq("slug", slug).is("hidden_at", null).or(PUBLIC_OR).maybeSingle();
      return p ? { profile: p as ClaimableProfile, offers: await loadOffers(p.id) } : null;
    },
    async liveBySlugAnyCategory(slug) {
      const { data } = await db.from("claimable_profiles").select("slug,category")
        .eq("slug", slug).is("hidden_at", null).or(PUBLIC_OR).limit(2);
      return (data || []) as { slug: string; category: CategoryKey }[];
    },
    async liveByUsername(username) {
      const { data: u } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
      if (!u) return null;
      const { data } = await db.from("claimable_profiles").select("slug,category")
        .eq("profile_id", u.id).is("hidden_at", null).or(PUBLIC_OR).maybeSingle();
      return (data as { slug: string; category: CategoryKey } | null) ?? null;
    },
    async byOwner(userId) {
      const { data: p } = await db.from("claimable_profiles").select(PROFILE_COLS).eq("claimed_by", userId).maybeSingle();
      return p ? { profile: p as ClaimableProfile, offers: await loadOffers(p.id) } : null;
    },
    async claim(hash, userId, fullName, consent) {
      const { data, error } = await db.rpc("claim_profile_consented", { p_token_hash: hash, p_user_id: userId, p_full_name: fullName,
        p_consent_version: consent.version, p_consent_sha256: consent.sha256, p_consent_lang: consent.lang, p_client_hash: consent.clientHash });
      if (error) {
        const m = /claim_(invalid|expired|used|user_has_profile|consent_required)/.exec(error.message || "");
        throw new ClaimError(m ? (m[1] === "consent_required" ? "consent_required" : (`claim_${m[1]}` as any)) : "unavailable");
      }
      const row = Array.isArray(data) ? data[0] : data;
      return { slug: row.slug, category: row.category };
    },
    async optOut(hash, keys) {
      const { data, error } = await db.rpc("opt_out_claimable", { p_token_hash: hash, p_suppress_keys: keys });
      if (error) throw new ClaimError("unavailable");
      return data === true;
    },
    async updateOffer(userId, offerId, patch: OfferPatch) {
      const cur = await ownedOffer(userId, offerId);
      if (!cur) return null;
      const { data, error } = await db.from("claimable_offers").update({ ...patch, is_preset: false, updated_at: new Date().toISOString() })
        .eq("id", offerId).select(OFFER_COLS).single();
      if (error || !data) return null;
      if (cur.offering_id) {
        await db.from("offerings").update({
          title: data.title, description: data.description, duration: data.duration_minutes,
          price: data.price_amount === null ? null : String(data.price_amount), is_online: data.format === "online",
          status: "published",
        }).eq("id", cur.offering_id).eq("facilitator_id", userId);
      }
      return offers([data])[0];
    },
    async deleteOffer(userId, offerId) {
      const cur = await ownedOffer(userId, offerId);
      if (!cur) return false;
      if (cur.offering_id) await db.from("offerings").update({ status: "archived" }).eq("id", cur.offering_id).eq("facilitator_id", userId);
      const { error } = await db.from("claimable_offers").delete().eq("id", offerId);
      return !error;
    },
  };
}
