import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/claim/categories";
import { categoryFromSlug } from "@/lib/claim/slugs";
import { loadCategoryOffers } from "@/lib/offers/repo";
import { TYPE_LABEL, isOfferType } from "@/lib/offers/model";
import { CategoryOffersView } from "@/components/offers/OfferViews";
import "@/components/offers/offers.css";

/** /{category}/angebote[?typ=service|event|course|product|freebie]. Static segment wins over [slug]; "angebote" is a reserved profile slug. */
type P = { params: { username: string }; searchParams?: { typ?: string } };
export const revalidate = 300;

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const c = categoryFromSlug(params.username);
  if (!c) return {};
  const t = isOfferType(searchParams?.typ) ? searchParams!.typ as keyof typeof TYPE_LABEL : null;
  return {
    title: `${CATEGORIES[c].label}: ${t ? TYPE_LABEL[t] : "Angebote"} | Orive`,
    description: `${CATEGORIES[c].label}-Angebote von Facilitators auf Orive: Sessions, Events, Kurse und mehr.`,
    alternates: { canonical: `/${params.username}/angebote` },
  };
}

export default async function CategoryOffersPage({ params, searchParams }: P) {
  if (!categoryFromSlug(params.username)) notFound();
  const r = await loadCategoryOffers(params.username, searchParams?.typ).catch(() => null);
  if (!r) notFound();
  return <CategoryOffersView category={r.category} type={r.type} offers={r.offers} counts={r.counts} />;
}
