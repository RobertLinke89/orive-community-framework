import type { Metadata } from "next";
import { headers } from "next/headers";
import { loadClaimPreview } from "@/lib/claim/service";
import { profileUrl } from "@/lib/claim/claimToken";
import { ProfileView } from "@/components/claim/ProfileView";
import { ClaimTopBar } from "@/components/claim/ClaimPreview";
import { OptOutButton } from "@/components/claim/OptOutButton";
import { T, langFor, type Lang } from "@/components/claim/i18n";
import "@/components/claim/templates/categoryTemplates.css";
import "@/components/claim/claim.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Drafts must never be indexed or cached, and the token must not leak via Referer.
export const metadata: Metadata = {
  title: "Orive – Profil aktivieren",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const token = decodeURIComponent(params.token || "");
  const preview = await loadClaimPreview(token).catch(() => ({ state: "invalid" as const }));
  const accept = headers().get("accept-language") || "";
  const fallbackLang: Lang = /^de\b/i.test(accept) ? "de" : "en";

  if (preview.state !== "ready") {
    const t = T[fallbackLang];
    return (
      <div className="oc oc-dark" style={{ ["--acc" as any]: "#00CDAC" }}>
        <div className="oc-msg">
          <h1>{preview.state === "claimed" ? t.alreadyLive : preview.state === "expired" ? t.expired : t.invalid}</h1>
          {preview.state === "claimed" && <p><a className="oc-btn" href={profileUrl(preview.category, preview.slug)}>{profileUrl(preview.category, preview.slug).replace(/^https?:\/\//, "")}</a></p>}
        </div>
      </div>
    );
  }
  const lang = langFor(preview.profile.country);
  return (
    <ProfileView profile={preview.profile} offers={preview.offers} mode="draft" lang={lang}
      top={<ClaimTopBar token={token} lang={lang} offers={preview.offers} />}>
      <OptOutButton token={token} lang={lang} />
    </ProfileView>
  );
}
