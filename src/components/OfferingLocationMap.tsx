"use client";

import { useLanguage } from "@/hooks/useLanguage";

import { MapPin } from "lucide-react";
import { coordsForLocation } from "@/lib/geo";

type OfferingLocationMapProps = {
  location?: string | null;
  isOnline?: boolean;
  isDe?: boolean;
};

export function OfferingLocationMap({ location, isOnline, isDe = false }: OfferingLocationMapProps) {
  const { copy } = useLanguage();
  if (isOnline) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          {copy('Ort', 'Location')}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {copy('Online. Zugang und Link kommen nach der Buchung vom Veranstalter.', 'Online. Access details come from the host after booking.')}
        </p>
      </section>
    );
  }

  const label = String(location || '').trim();
  if (!label) return null;

  const point = coordsForLocation(label);
  const pad = 0.05;
  const osmEmbed = point
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${point.lng - pad}%2C${point.lat - pad}%2C${point.lng + pad}%2C${point.lat + pad}&layer=mapnik`
    : null;
  const search = encodeURIComponent(label);
  const areaName = point?.city || label;

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        {copy('Ort', 'Location')}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 inline-flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#00CDAC] mt-0.5 shrink-0" />
        <span>{label}</span>
      </p>
      {osmEmbed ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-[#01223F]">
          <iframe
            title={copy(`Karte ${areaName}`, `Map of ${areaName}`)}
            src={osmEmbed}
            className="w-full h-56 sm:h-64 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
      <p className="mt-3 text-[12px] text-slate-500 dark:text-white/45 leading-relaxed">
        {copy(`Ungefähre Lage rund um ${areaName}. Die genaue Adresse folgt nach der Buchung.`, `Approximate area around ${areaName}. The exact address follows after booking.`)}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href={`https://www.openstreetmap.org/search?query=${search}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#008975] dark:text-[#00CDAC] hover:underline"
        >
          {copy('OpenStreetMap', 'OpenStreetMap')}
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${search}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#008975] dark:text-[#00CDAC] hover:underline"
        >
          {copy('Route in Google Maps', 'Directions in Google Maps')}
        </a>
      </div>
    </section>
  );
}
