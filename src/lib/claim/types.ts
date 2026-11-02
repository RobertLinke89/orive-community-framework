import type { CategoryKey } from "./categories";

export type ClaimableProfile = {
  id: string; slug: string; display_name: string; category: CategoryKey; categories: string[];
  city: string | null; country: string | null; website: string | null; instagram: string | null;
  colourway: "dark" | "white"; cover_key: string | null; status: "draft" | "live";
  claimed_by: string | null; profile_id: string | null; contact_email?: string | null;
  source_facilitator_id?: string; bio?: string | null;
  /** internal, admin-only (crawler quality model v1) */
  quality_score?: number | null; quality_tier?: string | null;
  /** set atomically with the claim (account consent incl. Art. 9); public only when set */
  terms_consented_at?: string | null;
  /** set when Robert approves the release batch (same moment as the activation mail); public from then on */
  published_at?: string | null; release_batch_id?: string | null;
  /** one-click opt-out via /profil/ausblenden: hides profile + offers immediately */
  hidden_at?: string | null;
};
export type ClaimableOffer = {
  id: string; position: number; title: string; description: string | null; duration_minutes: number | null;
  format: "in_person" | "online" | "hybrid"; price_amount: number | null; currency: string;
  is_preset: boolean; offering_id: string | null;
  /** resolved (signed) image URL, see lib/claim/media.ts */
  image?: MediaImage | null;
};

/** An image as the page renders it: already-resolved URL + mandatory alt text. `label` marks demo/placeholder images. */
export type MediaImage = { url: string; alt: string; width?: number | null; height?: number | null; label?: string | null; /** "url 400w, url 800w, …" (signed URLs) */ srcset?: string | null };
export type GalleryImage = MediaImage & { id: string; position: number };
export type Product = { id: string; position: number; title: string; description: string | null; price_amount: number | null; currency: string; url: string | null; image?: MediaImage | null };
export type ProfileExtras = { gallery?: GalleryImage[]; cover?: { url: string; alt: string } | null; products?: Product[];
  /** Profile photo(s) of the facilitator: 1 = single avatar, 2–3 = stacked collage (main + smaller side views). */
  avatar?: { url: string; alt: string; position?: string }[] | null };
export type TokenRow = { expires_at: string; used_at: string | null; revoked_at: string | null };

export type PublicProfile = Omit<ClaimableProfile, "contact_email" | "source_facilitator_id" | "claimed_by" | "quality_score" | "quality_tier" | "terms_consented_at" | "published_at" | "release_batch_id" | "hidden_at">;

export type OfferPatch = Partial<Pick<ClaimableOffer, "title" | "description" | "duration_minutes" | "format" | "price_amount">>;

export interface ClaimRepo {
  byTokenHash(hash: string): Promise<{ profile: ClaimableProfile; offers: ClaimableOffer[]; token: TokenRow } | null>;
  /** live AND consented only */
  liveByPath(category: CategoryKey, slug: string): Promise<{ profile: ClaimableProfile; offers: ClaimableOffer[] } | null>;
  /** all live+consented profiles with this name slug in any category (legacy /f/{slug} links) */
  liveBySlugAnyCategory(slug: string): Promise<{ slug: string; category: CategoryKey }[]>;
  /** claimed profile whose public.profiles.username = username (old /{username} URLs) */
  liveByUsername(username: string): Promise<{ slug: string; category: CategoryKey } | null>;
  byOwner(userId: string): Promise<{ profile: ClaimableProfile; offers: ClaimableOffer[] } | null>;
  claim(hash: string, userId: string, fullName: string, consent: AccountConsentProof): Promise<{ slug: string; category: CategoryKey }>;
  optOut(hash: string, suppressKeys: string[]): Promise<boolean>;
  updateOffer(userId: string, offerId: string, patch: OfferPatch): Promise<ClaimableOffer | null>;
  deleteOffer(userId: string, offerId: string): Promise<boolean>;
}

export type AccountConsentProof = { version: string; sha256: string; lang: "de" | "en"; clientHash: string | null };

export class ClaimError extends Error {
  constructor(public code: "claim_invalid" | "claim_expired" | "claim_used" | "claim_user_has_profile" | "consent_required" | "unavailable") { super(code); }
}
