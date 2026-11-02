"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { geoContains, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { facilitators, type Facilitator } from "@/data/facilitatorsData";
import { buildPublicProfilePath } from "@/lib/publicProfilePath";
import { useLanguage } from "@/hooks/useLanguage";

type Topology = {
  type: "Topology";
  objects: Record<string, unknown>;
  arcs: unknown[];
};

const VIEW_W = 960;
const VIEW_H = 780;
const GEO_URL = "/geo/countries-50m.json";
const STROKE = 0.75;

/** Natural Earth name → marketplace country name */
const MAP_TO_MARKETPLACE: Record<string, string> = {
  Albania: "Albania",
  Andorra: "Andorra",
  Austria: "Austria",
  Belarus: "Belarus",
  Belgium: "Belgium",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  Bulgaria: "Bulgaria",
  Croatia: "Croatia",
  Cyprus: "Cyprus",
  Czechia: "Czech Republic",
  Denmark: "Denmark",
  Estonia: "Estonia",
  Finland: "Finland",
  France: "France",
  Germany: "Germany",
  Greece: "Greece",
  Hungary: "Hungary",
  Iceland: "Iceland",
  Ireland: "Ireland",
  Italy: "Italy",
  Kosovo: "Kosovo",
  Latvia: "Latvia",
  Liechtenstein: "Liechtenstein",
  Lithuania: "Lithuania",
  Luxembourg: "Luxembourg",
  Macedonia: "North Macedonia",
  Malta: "Malta",
  Moldova: "Moldova",
  Monaco: "Monaco",
  Montenegro: "Montenegro",
  Netherlands: "Netherlands",
  Norway: "Norway",
  Poland: "Poland",
  Portugal: "Portugal",
  Romania: "Romania",
  "San Marino": "San Marino",
  Serbia: "Serbia",
  Slovakia: "Slovakia",
  Slovenia: "Slovenia",
  Spain: "Spain",
  Sweden: "Sweden",
  Switzerland: "Switzerland",
  Ukraine: "Ukraine",
  "United Kingdom": "United Kingdom",
  Vatican: "Vatican",
};

const EUROPE_COUNTRY_NAMES = new Set(Object.keys(MAP_TO_MARKETPLACE));

function inEuropeView(lng: number, lat: number) {
  return lng >= -25 && lng <= 40 && lat >= 34 && lat <= 72;
}

function clipToEurope(geo: any): any | null {
  const geom = geo?.geometry;
  if (!geom) return null;

  if (geom.type === "Polygon") {
    const [lng, lat] = geom.coordinates?.[0]?.[0] ?? [];
    if (!Number.isFinite(lng) || !inEuropeView(lng, lat)) return null;
    return geo;
  }

  if (geom.type === "MultiPolygon") {
    const coordinates = (geom.coordinates as number[][][][]).filter((poly) => {
      const [lng, lat] = poly?.[0]?.[0] ?? [];
      return Number.isFinite(lng) && inEuropeView(lng, lat);
    });
    if (!coordinates.length) return null;
    return {
      ...geo,
      geometry: { type: "MultiPolygon", coordinates },
    };
  }

  return null;
}

function marketplaceName(mapName: string) {
  return MAP_TO_MARKETPLACE[mapName] || mapName;
}

function facilitatorsInCountry(country: string): Facilitator[] {
  const needle = country.toLowerCase();
  const short =
    country === "Bosnia and Herzegovina"
      ? "bosnia"
      : country === "Czech Republic"
        ? "czech"
        : country === "North Macedonia"
          ? "macedonia"
          : country === "United Kingdom"
            ? "united kingdom"
            : needle;

  const seen = new Set<string>();
  return facilitators.filter((f) => {
    const loc = f.location.toLowerCase();
    if (!loc.includes(short) && !loc.includes(needle)) return false;
    const key = f.username || f.id || f.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function countryName(geo: any): string {
  return String(geo?.properties?.name || "");
}

export function EuropeFacilitatorMap() {
  const { copy } = useLanguage();
  const router = useRouter();
  const [world, setWorld] = useState<Topology | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((json: Topology) => {
        if (!cancelled) setWorld(json);
      })
      .catch((err) => {
        console.error("Failed to load Europe map:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const europeFeatures = useMemo(() => {
    if (!world?.objects?.countries) return [] as any[];
    const fc = feature(world as any, world.objects.countries as any) as any;
    return ((fc?.features ?? []) as any[])
      .filter((geo) => EUROPE_COUNTRY_NAMES.has(geo.properties?.name))
      .map(clipToEurope)
      .filter(Boolean);
  }, [world]);

  const europeCollection = useMemo(
    () => ({ type: "FeatureCollection" as const, features: europeFeatures }),
    [europeFeatures]
  );

  const projection = useMemo(() => {
    if (!europeFeatures.length) {
      return geoMercator().scale(1).translate([VIEW_W / 2, VIEW_H / 2]);
    }
    return geoMercator().fitExtent(
      [
        [4, 8],
        [VIEW_W - 4, VIEW_H - 8],
      ],
      europeCollection as any
    );
  }, [europeCollection, europeFeatures.length]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const activeName = hovered || selected;
  const activeFeature = useMemo(
    () => europeFeatures.find((geo) => countryName(geo) === activeName) ?? null,
    [europeFeatures, activeName]
  );

  const selectedMarket = selected ? marketplaceName(selected) : null;
  const countryFacilitators = useMemo(
    () => (selectedMarket ? facilitatorsInCountry(selectedMarket).slice(0, 8) : []),
    [selectedMarket]
  );

  function hitTest(svg: SVGSVGElement, clientX: number, clientY: number): string | null {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    const invert = projection.invert?.([local.x, local.y]);
    if (!invert) return null;
    const [lng, lat] = invert;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    const hit = europeFeatures.find((geo) => geoContains(geo, [lng, lat]));
    return hit ? countryName(hit) : null;
  }

  function openMarketplace(country: string) {
    router.push(`/marketplace?country=${encodeURIComponent(country)}`);
  }

  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[520px] lg:min-h-[640px]">
      {!world ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 dark:text-white/40">
          {copy("Karte wird geladen…", "Loading map…")}
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="relative w-full h-auto min-h-[420px] sm:min-h-[520px] lg:min-h-[640px] cursor-pointer outline-none focus:outline-none [&_*]:outline-none"
        role="img"
        aria-label={copy("Interaktive Karte von Europa", "Interactive map of Europe")}
        style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}
        onPointerMove={(e) => {
          const name = hitTest(e.currentTarget, e.clientX, e.clientY);
          setHovered((prev) => (prev === name ? prev : name));
        }}
        onPointerLeave={() => setHovered(null)}
        onClick={(e) => {
          const name = hitTest(e.currentTarget, e.clientX, e.clientY);
          if (name) setSelected(name);
        }}
      >
        {europeFeatures.map((geo: any) => {
          const d = pathGen(geo);
          if (!d) return null;
          const name = countryName(geo);
          if (name === activeName) return null;
          return (
            <path
              key={geo.id ?? name}
              d={d}
              className="fill-[#E8EEF2] dark:fill-[#12263a] stroke-[#9AA8B0] dark:stroke-white/25 pointer-events-none"
              strokeWidth={STROKE}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {activeFeature
          ? (() => {
              const d = pathGen(activeFeature);
              if (!d) return null;
              return (
                <path
                  key={`active-${countryName(activeFeature)}`}
                  d={d}
                  fill="#00CDAC"
                  stroke="#00CDAC"
                  strokeWidth={STROKE}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="pointer-events-none"
                />
              );
            })()
          : null}
      </svg>

      {hovered && !selected ? (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#01223F]/90 dark:bg-white/90 px-3 py-1.5 text-xs font-semibold text-white dark:text-[#01223F]">
          {marketplaceName(hovered)}
        </div>
      ) : null}

      {selected && selectedMarket ? (
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:left-3 sm:right-auto sm:bottom-3 sm:w-[320px] z-20 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b1a2e] shadow-xl shadow-[#01223F]/20 dark:shadow-black/40 overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">
                {copy("Land", "Country")}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#01223F] dark:text-white">
                {selectedMarket}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                {countryFacilitators.length > 0
                  ? copy(
                      `${countryFacilitators.length} Facilitators`,
                      `${countryFacilitators.length} facilitators`
                    )
                  : copy("Angebote im Marketplace", "Offerings in marketplace")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full p-1.5 text-slate-400 hover:text-[#01223F] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 outline-none focus:outline-none"
              aria-label={copy("Schließen", "Close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {countryFacilitators.length > 0 ? (
            <ul className="max-h-[240px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/10">
              {countryFacilitators.map((f) => (
                <li key={f.id}>
                  <Link
                    href={buildPublicProfilePath({ id: f.id, username: f.username })}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors outline-none focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                      <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#01223F] dark:text-white truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/50 truncate">
                        {f.professionalTitle || f.tags[0]}
                      </p>
                    </div>
                    {f.isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00CDAC] flex-shrink-0" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {copy(
                "Für dieses Land findest du passende Angebote direkt im Marketplace.",
                "Browse matching offerings for this country in the marketplace."
              )}
            </p>
          )}

          <div className="p-3 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => openMarketplace(selectedMarket)}
              className="inline-flex w-full items-center justify-center gap-2 h-10 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold transition-colors outline-none focus:outline-none"
            >
              {copy("Im Marketplace öffnen", "Open in marketplace")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
