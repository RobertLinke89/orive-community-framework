import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { canonicalPathFor, loadLiveProfile } from "@/lib/claim/service";
import { CATEGORIES } from "@/lib/claim/categories";
import { categoryFromSlug, profileUrl } from "@/lib/claim/slugs";
import { ProfileView } from "@/components/claim/ProfileView";
import { BookingLauncher } from "@/components/claim/BookingLauncher";
import { GalleryLightbox } from "@/components/claim/GalleryLightbox";
import { ThemeToggle } from "@/components/claim/ThemeToggle";
import { langFor } from "@/components/claim/i18n";
import "@/components/claim/templates/categoryTemplates.css";
import "@/components/claim/claim.css";
import { loadProfileOffers } from "@/lib/offers/repo";
import { FacilitatorOffersSection } from "@/components/offers/OfferViews";
import "@/components/offers/offers.css";

/**
 * Public facilitator profile: /{category}/{name}, e.g. /breathwork/anna-mueller.
 * The segment is called [username] only because Next.js requires one name per dynamic level and the existing
 * root profile route is src/app/[username]. Only the 11 known category slugs match here; every other first
 * segment (and every static top-level route such as /about, /api, /auth – static routes always win) is untouched.
 */
type P = { params: { username: string; slug: string } };
export const revalidate = 60;

async function resolve({ params }: P) {
  const cat = params.username, slug = params.slug;
  // normalise case (/Breathwork/Anna-Mueller) before anything else
  if (cat !== cat.toLowerCase() || slug !== slug.toLowerCase()) {
    const c = categoryFromSlug(cat.toLowerCase());
    if (c) permanentRedirect(`/${cat.toLowerCase()}/${slug.toLowerCase()}`);
    notFound();
  }
  if (!categoryFromSlug(cat)) notFound();
  const row = await loadLiveProfile(cat, slug).catch(() => null);
  if (row) return row;
  // live profile requested under the wrong category -> permanent redirect to the canonical URL
  const to = await canonicalPathFor(slug).catch(() => null);
  if (to && to !== `/${cat}/${slug}`) permanentRedirect(to);
  notFound();
}

export async function generateMetadata(p: P): Promise<Metadata> {
  const { profile } = await resolve(p);
  const c = CATEGORIES[profile.category];
  const loc = [profile.city, profile.country].filter(Boolean).join(", ");
  return {
    title: `${profile.display_name} – ${c.label}${loc ? ` in ${loc}` : ""} | Orive`,
    description: `${c.label} mit ${profile.display_name}${loc ? ` in ${loc}` : ""}. Jetzt Termin über Orive buchen.`,
    alternates: { canonical: profileUrl(profile.category, profile.slug) },
    robots: { index: true, follow: true },
  };
}

/** Only publicly visible profiles (approved batch or claimed + consented, not opted out) exist; everything else 404s. */
export default async function FacilitatorProfilePage(p: P) {
  const { profile, offers, extras } = await resolve(p);
  const lang = langFor(profile.country);
  // crawled offers: same live + consented gate (loadProfileOffers re-checks it against claimable_profiles)
  const groups = await loadProfileOffers(p.params.username, profile.slug).catch(() => []);
  return (
    <>
    <ProfileView profile={profile} offers={offers} mode="live" lang={lang} extras={extras}>
      {profile.profile_id ? <BookingLauncher offers={offers} facilitatorId={profile.profile_id} facilitatorName={profile.display_name} /> : null}
      <GalleryLightbox lang={lang} />
      <ThemeToggle lang={lang} />
    </ProfileView>
    <FacilitatorOffersSection groups={groups} category={profile.category} />
    </>
  );
}
