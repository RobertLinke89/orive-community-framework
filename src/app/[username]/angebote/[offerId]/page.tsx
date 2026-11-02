import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/claim/categories";
import { loadOffer } from "@/lib/offers/repo";
import { OfferDetailView } from "@/components/offers/OfferViews";
import "@/components/offers/offers.css";

/** /{category}/angebote/{offerId}: 404 unless the offer's facilitator is live + consented in this category. */
type P = { params: { username: string; offerId: string } };
export const revalidate = 300;

const get = (p: P) => loadOffer(p.params.username, p.params.offerId).catch(() => null);

export async function generateMetadata(p: P): Promise<Metadata> {
  const r = await get(p);
  if (!r) return { robots: { index: false } };
  const o = r.offer;
  return {
    title: `${o.title} – ${o.facilitator.name} | ${CATEGORIES[o.facilitator.category].label} | Orive`,
    description: (o.description || `${o.title} von ${o.facilitator.name}`).slice(0, 155),
    alternates: { canonical: o.href },
  };
}

export default async function OfferDetailPage(p: P) {
  const r = await get(p);
  if (!r) notFound();
  return <OfferDetailView offer={r.offer} more={r.more} />;
}
