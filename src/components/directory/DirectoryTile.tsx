// Directory tiles for /facilitators and "similar" on profiles (modern grid, Orive tokens: white cards, hairline
// slate borders, navy #01223F text, teal #00CDAC accents, Inter). Top: element-tinted field with the existing animated
// element emblem (never named) or the facilitator's own uploaded avatar once claimed. No crawled photos, no ratings.
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fixText } from "@/lib/textFix";
import { fmtMoney, type FromPrice } from "@/lib/directoryPrice";
import { ElementAvatar } from "./ElementAvatar";
import { ELEMENT_COLORS, type ElementKey } from "./elements";

export type TileCard = {
  slug: string; href: string; name: string; city: string | null; country: string | null; category: string;
  offer: { title: string; price: number | null; currency: string | null; date: string | null } | null;
  offerCount: number; distanceKm: number | null; reason: string | null;
  element?: ElementKey | null; avatar?: string | null; fromPrice?: FromPrice | null;
};

export const TILE_CSS = `
.odt-field{background:radial-gradient(120% 90% at 50% 110%,color-mix(in srgb,var(--e1) 22%,transparent),transparent 70%),linear-gradient(155deg,color-mix(in srgb,var(--e2) 22%,#fff),color-mix(in srgb,var(--e1) 12%,#F8FAFC))}
.dark .odt-field{background:radial-gradient(120% 90% at 50% 110%,color-mix(in srgb,var(--e1) 35%,transparent),transparent 70%),linear-gradient(160deg,color-mix(in srgb,var(--e1) 22%,#01223F),#011B33)}
.odt-card:hover .odt-field .oav{transform:scale(1.05)}
.odt-field .oav{transition:transform .4s cubic-bezier(.2,.7,.2,1)}
@media (prefers-reduced-motion: reduce){.odt-field .oav{transition:none}}
`;

function priceTxt(c: TileCard, de: boolean) {
  const lang = de ? "de" : "en";
  if (c.fromPrice) { const m = fmtMoney(c.fromPrice, lang); return m ? `${de ? "ab" : "from"} ${m}` : null; }
  if (c.offer && c.offer.price === 0) return de ? "kostenlos" : "free";
  return null;
}

export function DirectoryTile({ c, de }: { c: TileCard; de: boolean }) {
  const el = (c.element || "aether") as ElementKey;
  const [e1, e2] = ELEMENT_COLORS[el];
  const price = priceTxt(c, de);
  const place = c.city || c.country;
  const kicker = [c.category, place].filter(Boolean).join(" · ");
  const n = c.offerCount;
  return (
    <li className="h-full">
      <Link href={c.href} data-search-card={c.slug}
        className="odt-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#00CDAC]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CDAC]/40 dark:border-white/10 dark:bg-white/[.04] dark:hover:border-[#00CDAC]/50">
        <span className="odt-field relative grid h-24 place-items-center sm:h-36" style={{ ["--e1" as string]: e1, ["--e2" as string]: e2 }}>
          <ElementAvatar element={el} avatar={c.avatar} size={84} />
          {c.distanceKm != null && c.distanceKm >= 3 ? (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 backdrop-blur sm:right-3 sm:top-3 sm:px-2.5 sm:text-[11px] dark:bg-[#011B33]/80 dark:text-white/70">{c.distanceKm} km</span>
          ) : null}
        </span>
        <span className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-4">
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#017F80] sm:text-[11px] dark:text-[#5ee6cf]">{kicker || (de ? "Facilitator" : "Facilitator")}</span>
          <span className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-[#01223F] sm:mt-1.5 sm:text-[17px] dark:text-white">{fixText(c.name)}</span>
          {c.offer ? <span className="mt-1 line-clamp-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm dark:text-white/55">{fixText(c.offer.title)}</span>
            : place ? <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm dark:text-white/55"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />{[c.city, c.country].filter(Boolean).join(", ")}</span> : null}
          {c.reason ? <span className="mt-1 line-clamp-2 text-xs italic text-slate-500 dark:text-white/45">{c.reason}</span> : null}
          <span className="min-h-3 flex-1 sm:min-h-4" aria-hidden />
          <span className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 sm:gap-3 sm:pt-3 dark:border-white/10">
            <span className={price ? "truncate text-[13px] font-semibold text-[#01223F] sm:text-[15px] dark:text-white" : "truncate text-xs text-slate-500 sm:text-sm dark:text-white/55"}>{price ?? (de ? "Preis auf Anfrage" : "Price on request")}</span>
            <span className="shrink-0 text-[10px] text-slate-500 sm:text-xs dark:text-white/50">{n ? (de ? `${n} ${n === 1 ? "Angebot" : "Angebote"}` : `${n} ${n === 1 ? "offer" : "offers"}`) : (de ? "Auf Anfrage" : "On request")}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function DirectoryTileGrid({ cards, de, className = "grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5" }: { cards: TileCard[]; de: boolean; className?: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TILE_CSS }} />
      <ul className={className}>{cards.map((c) => <DirectoryTile key={c.slug} c={c} de={de} />)}</ul>
    </>
  );
}
