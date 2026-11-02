"use client";

import { useEffect, useState } from "react";
import { TetrisCatalog } from "@/components/TetrisCatalog";
import { useLanguage } from "@/hooks/useLanguage";
import type { PublicOffering } from "@/hooks/usePublicOfferings";

type SimilarOfferingsProps = {
  excludeId: string;
  title?: string;
  type?: string;
  location?: string | null;
  tags?: string[] | null;
};

export function SimilarOfferings({ excludeId, title, type, location, tags }: SimilarOfferingsProps) {
  const { language, copy } = useLanguage();
  const isDe = language === 'de';
  const [offerings, setOfferings] = useState<PublicOffering[]>([]);
  const [viewerCity, setViewerCity] = useState<string | null>(null);

  const tagKey = (tags || []).join(',');

  useEffect(() => {
    if (!excludeId) return;
    const params = new URLSearchParams({ exclude: excludeId, limit: '10' });
    if (title) params.set('title', title);
    if (type) params.set('type', type);
    if (location) params.set('location', location);
    if (tagKey) params.set('tags', tagKey);

    let cancelled = false;
    fetch(`/api/offerings/nearby?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setOfferings(Array.isArray(data.offerings) ? data.offerings : []);
        setViewerCity(data.viewer?.city || null);
      })
      .catch(() => {
        if (!cancelled) setOfferings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [excludeId, title, type, location, tagKey]);

  if (offerings.length === 0) return null;

  return (
    <section className="border-t border-slate-200/80 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {copy('In deiner Nähe', 'Near you')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/45">
            {viewerCity
              ? copy(`Sessions, Events und Retreats rund um ${viewerCity}.`, `Sessions, events and retreats around ${viewerCity}.`)
              : copy('Ähnliche Angebote, nach räumlicher Nähe sortiert.', 'Similar offerings, ranked by proximity.')}
          </p>
        </div>
        <TetrisCatalog groups={[{ id: 'nearby', label: copy('In der Nähe', 'Nearby'), offerings }]} />
      </div>
    </section>
  );
}
