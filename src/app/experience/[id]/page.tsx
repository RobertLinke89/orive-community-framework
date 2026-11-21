import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageComponent from "../../../views/ExperienceDetail";
import { getExperienceById } from "@/data/experiencesData";
import { cleanDescription } from "@/lib/offerQuality";

export const revalidate = 1800;

function known(id: string) {
  // orive-* items live in the ORIVE inventory API and are resolved client-side.
  return id.startsWith("orive-") || Boolean(getExperienceById(id));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const id = decodeURIComponent(params.id || "");
  const e = getExperienceById(id);
  if (!e) return { title: id.startsWith("orive-") ? "Angebot | ORIVE" : "Angebot nicht gefunden | ORIVE", robots: { index: false, follow: false } };
  const where = e.location ? ` in ${e.location.split(",").slice(-1)[0].trim().replace(/^\d{4,5}\s+/, "")}` : "";
  const desc = cleanDescription(e.description, 155) || `${e.title}${where} – Termin, Preis und Buchung über den Partner.`;
  return {
    title: `${e.title}${where} | ORIVE`.slice(0, 110),
    description: desc,
    alternates: { canonical: `/experience/${encodeURIComponent(id)}` },
    openGraph: { title: e.title, description: desc, url: `/experience/${encodeURIComponent(id)}`, images: e.image ? [{ url: e.image }] : ["/og/orive-default.jpg"] },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  if (!known(decodeURIComponent(params.id || ""))) notFound();
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PageComponent />
    </Suspense>
  );
}
