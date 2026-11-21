"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fixText } from "@/lib/textFix";
import { ElementAvatar } from "@/components/directory/ElementAvatar";
import type { ElementKey } from "@/components/directory/elements";

export type DirectoryCard = {
  slug: string; href: string; name: string; city: string | null; country: string | null; category: string;
  offer: { title: string; price: number | null; currency: string | null; date: string | null } | null;
  offerCount: number; distanceKm: number | null; reason: string | null;
  element?: ElementKey | null; avatar?: string | null;
};
export type DirectoryPayload = { cards: DirectoryCard[]; total: number; alternatives: { label: string; cards: DirectoryCard[] }[]; widened?: string | null };

function price(o: DirectoryCard["offer"], de: boolean) {
  if (!o || o.price == null) return null;
  if (o.price === 0) return de ? "kostenlos" : "free";
  const cur = o.currency === "EUR" || !o.currency ? "€" : o.currency;
  return `${Number.isInteger(o.price) ? o.price : o.price.toFixed(2)} ${cur}`;
}
function date(d: string | null, de: boolean) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString(de ? "de-DE" : "en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch { return null; }
}

export function DirectoryCardItem({ c, de, newTab = true }: { c: DirectoryCard; de: boolean; newTab?: boolean }) {
  const p = price(c.offer, de); const d = date(c.offer?.date || null, de);
  return (
    <li>
      <Link href={c.href} target={newTab ? "_blank" : undefined} className="block h-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 transition hover:border-[#00CDAC]/60 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10" data-search-card={c.slug}>
        <span className="flex items-start gap-2.5">
          <ElementAvatar element={c.element} avatar={c.avatar} size={40} />
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-white leading-snug">{fixText(c.name)}</span>
              <span className="shrink-0 rounded-full bg-[#00CDAC]/10 px-2 py-0.5 text-[10px] font-medium text-[#008f78] dark:text-[#5ee6cf]">{c.category}</span>
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
              <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{[c.city, c.country].filter(Boolean).join(", ") || (de ? "Ort unbekannt" : "Location unknown")}</span>
              {c.distanceKm != null && c.distanceKm >= 3 ? <span className="shrink-0">· {c.distanceKm} km</span> : null}
            </span>
          </span>
        </span>
        {c.offer ? (
          <span className="mt-1.5 block pl-[50px] text-xs text-slate-700 dark:text-white/75">
            <span className="line-clamp-1">{fixText(c.offer.title)}</span>
            {(p || d) ? <span className="font-medium text-slate-900 dark:text-white">{[d, p].filter(Boolean).join(" · ")}</span> : null}
            {c.offerCount > 1 ? <span className="text-slate-400"> {de ? `· ${c.offerCount} Angebote` : `· ${c.offerCount} offers`}</span> : null}
          </span>
        ) : null}
        {c.reason ? <span className="mt-1 block pl-[50px] text-[11px] italic text-slate-500 dark:text-white/45">{c.reason}</span> : null}
      </Link>
    </li>
  );
}

/** Same cards as the hero search, as a grid (used on /facilitators, category pages and profile pages). */
export function DirectoryCardGrid({ cards, de, newTab = false, className = "grid gap-2 sm:grid-cols-2 lg:grid-cols-3" }: { cards: DirectoryCard[]; de: boolean; newTab?: boolean; className?: string }) {
  return <ul className={className}>{cards.map((c) => <DirectoryCardItem key={c.slug} c={c} de={de} newTab={newTab} />)}</ul>;
}

export function DirectorySearchResults({ data, de }: { data: DirectoryPayload; de: boolean }) {
  const [shown, setShown] = useState(6);
  const cards = data.cards || [];
  return (
    <div className="mt-3" data-directory-results>
      {cards.length ? (
        <>
          <ul className="grid gap-2 sm:grid-cols-2">{cards.slice(0, shown).map((c) => <DirectoryCardItem key={c.slug} c={c} de={de} />)}</ul>
          {cards.length > shown ? (
            <button type="button" onClick={() => setShown((s) => s + 6)} className="mt-2 text-xs font-semibold text-[#00CDAC] hover:underline">
              {de ? `Mehr anzeigen (${cards.length - shown} weitere)` : `Show more (${cards.length - shown} more)`}
            </button>
          ) : null}
        </>
      ) : null}
      {data.alternatives?.map((alt) => (
        <div key={alt.label} className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-white/50">{alt.label}</p>
          <ul className="grid gap-2 sm:grid-cols-2">{alt.cards.map((c) => <DirectoryCardItem key={c.slug} c={c} de={de} />)}</ul>
        </div>
      ))}
      <p className="mt-3 text-xs">
        <Link href="/facilitators" className="font-semibold text-[#00CDAC] hover:underline">{de ? "Alle Facilitators mit Filtern ansehen →" : "Browse all facilitators with filters →"}</Link>
      </p>
      {!cards.length && !data.alternatives?.length ? (
        <p className="mt-2 text-xs text-slate-500">{de ? "Tipp: Probiere eine größere Stadt in der Nähe oder eine verwandte Praxis (z. B. Meditation statt Achtsamkeit)." : "Tip: try a larger city nearby or a related practice (e.g. meditation instead of mindfulness)."}</p>
      ) : null}
    </div>
  );
}
