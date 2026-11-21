import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageComponent from "../../views/PublicProfile";
import DirectoryProfilePage from "@/components/directory/DirectoryProfilePage";
import { getDirectoryProfile, findDirectoryProfile, directoryIndexable, countView } from "@/lib/directorySample";
import { userProfileExists } from "@/lib/userProfileExists";
import { similarTo } from "@/lib/directoryBrowse";
import { displayPlace } from "@/lib/directorySearchGeo";
import { stripSourceNote } from "@/lib/directoryBuild";
import { countryName } from "@/lib/countryName";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Footer } from "@/components/Footer";
import { DirectoryTileGrid } from "@/components/directory/DirectoryTile";
import Link from "next/link";
import { fixText } from "@/lib/textFix";
import { headers } from "next/headers";
import { claimedAvatar } from "@/lib/directoryAvatar";

// UI language like the rest of orive.co (/facilitators): ?lang=de|en, else the browser language, German by default.
function pickLang(q: Record<string, unknown>): "de" | "en" {
  const l = String(q?.lang || "");
  if (l === "de" || l === "en") return l;
  const al = (headers().get("accept-language") || "de").toLowerCase();
  return al.startsWith("de") || /(^|,)\s*de/.test(al.split(";")[0]) ? "de" : al.startsWith("en") ? "en" : "de";
}

export const dynamic = "force-dynamic";

// Directory profiles (static JSON) are rendered server-side; every other /{username} keeps the existing PublicProfile.
const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://orive.co").replace(/\/$/, "");

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const raw = await getDirectoryProfile(params.username);
  const p = raw ? { ...raw, name: fixText(raw.name) } : null;
  if (!p) return (await findDirectoryProfile(params.username)) || (await userProfileExists(params.username)) === false ? { title: "Seite nicht gefunden | ORIVE", robots: { index: false, follow: false } } : {};
  const index = directoryIndexable(p);
  const title = `${p.name} – ${(p.primary ?? p.categories[0])}${p.city ? ` in ${p.city}` : ""} | Orive`;
  return {
    title, description: stripSourceNote(p.description),
    alternates: { canonical: `${BASE}/${p.slug}` },
    robots: { index, follow: index },
    openGraph: { title, description: stripSourceNote(p.description), url: `${BASE}/${p.slug}`, type: "profile" },
  };
}

export default async function Page(props: any) {
  const slug = props?.params?.username;
  const raw = await getDirectoryProfile(slug);
  const p = raw ? { ...raw, name: fixText(raw.name), offers: raw.offers.map((o) => ({ ...o, title: fixText(o.title) })) } : null;
  if (p) {
    const views = await countView(p.slug);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": /\b(praxis|studio|sauna|centre|center|club|academy|hamam|health|room|journeys|devils|yoga|shiatsu|du|zenctuary|relaxy|souluna|einklang|maison|ritual)\b/i.test(p.name) ? "LocalBusiness" : "Person",
      name: p.name, url: `${BASE}/${p.slug}`, sameAs: [p.website, p.instagram].filter(Boolean),
      ...(p.city || p.countryCode ? { address: { "@type": "PostalAddress", ...(p.city ? { addressLocality: p.city } : {}), ...(p.countryCode ? { addressCountry: p.countryCode === "UK" ? "GB" : p.countryCode } : {}) } } : {}),
      knowsAbout: p.categories,
    };
    const q = props?.searchParams || {};
    const inquiry = q.anfrage === "ok" || q.anfrage === "err" || q.anfrage === "rate" ? q.anfrage : null;
    const routed = q.routed === "1" ? true : q.routed === "0" ? false : null;
    const lang = pickLang(q);
    const similar = await similarTo(p, 6, lang).catch(() => []);
    const de = lang === "de";
    const where = p.city ? displayPlace(p.city, lang) : countryName(p.countryCode, p.country, lang) || "";
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <PublicNavbar />
        <main className="w-full flex-1 pt-16">
          <DirectoryProfilePage p={p} views={views} jsonLd={jsonLd} inquiry={inquiry} routed={routed} lang={lang} avatar={claimedAvatar(p.slug)} />
          <section className="w-full bg-[#F8FAFC] dark:bg-[#011B33]" aria-labelledby="similar-h"><div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
            {similar.length ? (
              <>
                <h2 id="similar-h" className="mb-5 text-xl font-semibold tracking-tight text-[#01223F] dark:text-white sm:text-2xl">
                  {de ? `Ähnliche Facilitators${where ? ` in ${where}` : ""}` : `Similar facilitators${where ? ` in ${where}` : ""}`}
                </h2>
                <DirectoryTileGrid cards={similar} de={de} />
              </>
            ) : null}
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href={`/facilitators?${new URLSearchParams({ ...(p.primary || p.categories[0] ? { cat: (p.primary || p.categories[0]) as string } : {}), ...(p.city ? { city: p.city } : {}) })}`} className="font-semibold text-[#00CDAC] hover:underline">
                {de ? `Mehr${p.city ? ` in ${displayPlace(p.city, lang)}` : ""} entdecken →` : `Discover more${p.city ? ` in ${p.city}` : ""} →`}
              </Link>
              <Link href="/facilitators" className="text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white">
                {de ? "Alle Facilitators" : "All facilitators"}
              </Link>
            </p>
          </div></section>
        </main>
        <Footer />
      </div>
    );
  }
  // removed or hidden directory profile -> gone (404), never fall through to the client profile page
  if (await findDirectoryProfile(slug)) notFound();
  // unknown slug (no user profile with this username) -> real 404 instead of the "Private Profile" placeholder
  if ((await userProfileExists(slug)) === false) notFound();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent {...props} />
    </Suspense>
  );
}
