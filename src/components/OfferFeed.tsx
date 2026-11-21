"use client";

// Homepage infinite scroll (2026-11-10): real directory offers with their own checked image, paged from
// /api/offerings/feed and appended to the SAME Tetris grid as the event tiles above (see TetrisCatalog `tail`),
// so the cards simply continue - no heading, no second module. A random seed per page view gives a fresh mix;
// offsets in that seed's order never repeat an offer within the visit. Images come as cached WebP thumbnails
// (/api/offer-image). No ratings, no contact data, no facilitator portraits.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageLoader } from "next/image";
import { Loader2 } from "lucide-react";
import { directoryCatsFor } from "@/components/directory/CategoryFacilitators";
import { fixText } from "@/lib/textFix";
import type { PublicOffering } from "@/hooks/usePublicOfferings";
import type { FeedItem, FeedPage } from "@/lib/offerFeed";

const PER = 24;
const TYPE_LABEL: Record<"de" | "en", Record<string, string>> = {
  de: { service: "Angebot", event: "Veranstaltung", product: "Angebot", course: "Kurs", freebie: "Kostenlos", session: "Session", retreat: "Retreat", workshop: "Workshop" },
  en: { service: "Offer", event: "Event", product: "Offer", course: "Course", freebie: "Free", session: "Session", retreat: "Retreat", workshop: "Workshop" },
};

/** One continuation tile for the shared grid. */
export type FeedTile = {
  key: string; offering: PublicOffering; href: string; badgeLabel: string; categoryLabel: string;
  /** original image url + title, only used to skip offers that already appear among the top tiles */
  image: string; title: string;
};

function priceText(it: FeedItem) {
  if (it.price == null) return null;
  const n = Number.isInteger(it.price) ? String(it.price) : it.price.toFixed(2);
  return it.currency === "EUR" || !it.currency ? `€${n}` : `${n} ${it.currency}`;
}

/** next/image loader for the cached thumbnails: the base url already carries ?v=, the width is snapped server-side. */
export const feedThumbLoader: ImageLoader = ({ src, width }) => `${src}${src.includes("?") ? "&" : "?"}w=${width}`;

function toTile(it: FeedItem, lang: "de" | "en"): FeedTile {
  const offering = {
    id: it.key, title: fixText(it.title), type: it.type === "event" || it.type === "retreat" || it.type === "workshop" ? "event" : "group",
    price: priceText(it), image_url: it.thumb || it.image, start_at: it.startAt, tags: [it.category], location: [it.city, it.country].filter(Boolean).join(", "),
    facilitator_name: fixText(it.name), source_platform: it.city || it.country || "", source_url: it.href, fulfillment: "external",
  } as unknown as PublicOffering;
  return { key: it.key, offering, href: it.href, badgeLabel: TYPE_LABEL[lang][it.type] || TYPE_LABEL[lang].service, categoryLabel: it.category, image: it.image, title: it.title };
}

export type OfferFeedState = {
  tiles: FeedTile[]; onFail: (key: string) => void; status: "loading" | "end" | "error" | "idle";
  sentinelRef: React.RefObject<HTMLDivElement>; retry: () => void; de: boolean;
};

export function useOfferFeed({ enabled, de, categoryId }: { enabled: boolean; de: boolean; categoryId: string }): OfferFeedState {
  const cats = directoryCatsFor(categoryId) || [];
  const catKey = cats.join(",");
  const lang = de ? "de" : "en";
  const [seed, setSeed] = useState(0);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set());
  const onFail = useCallback((k: string) => setFailedKeys((prev) => (prev.has(k) ? prev : new Set(prev).add(k))), []);
  const [next, setNext] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const busy = useRef(false);
  const gen = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // fresh mix per page view (after hydration, so SSR and first client render match)
  useEffect(() => { if (enabled) setSeed(Math.floor(Math.random() * 2147483646) + 1); }, [enabled]);

  // reset when the category, language or seed changes
  useEffect(() => {
    gen.current += 1; busy.current = false;
    seen.current = new Set(); setItems([]); setFailedKeys(new Set()); setNext(0); setFailed(false); setLoading(false);
  }, [catKey, lang, seed]);

  const load = useCallback(async () => {
    if (!enabled || !seed || busy.current || next == null) return;
    busy.current = true; setLoading(true); setFailed(false);
    const g = gen.current;
    try {
      const qs = new URLSearchParams({ seed: String(seed), offset: String(next), per: String(PER), lang });
      if (catKey) qs.set("cat", catKey);
      const r = await fetch(`/api/offerings/feed?${qs}`);
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as FeedPage;
      if (g !== gen.current) return;
      const fresh = j.items.filter((it) => !seen.current.has(it.key));
      fresh.forEach((it) => seen.current.add(it.key));
      if (fresh.length) setItems((prev) => [...prev, ...fresh]);
      setNext(j.nextOffset);
    } catch {
      if (g === gen.current) setFailed(true);
    } finally {
      if (g === gen.current) { busy.current = false; setLoading(false); }
    }
  }, [enabled, seed, next, lang, catKey]);

  // first page right away, then whenever the sentinel comes near the viewport (well ahead, images need time)
  useEffect(() => { if (enabled && seed && next === 0 && !items.length && !failed) void load(); }, [enabled, seed, next, items.length, failed, load]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!enabled || !el || next == null || failed) return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) void load(); }, { rootMargin: "1600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, load, next, failed, items.length]);

  const tiles = useMemo(() => items.filter((it) => !failedKeys.has(it.key)).map((it) => toTile(it, lang)), [items, failedKeys, lang]);
  const status = loading ? "loading" : failed ? "error" : next == null ? "end" : "idle";
  return { tiles, onFail, status, sentinelRef, retry: () => void load(), de };
}

/** Sentinel under the shared grid: triggers the next page; shows only a small spinner / retry, no heading. */
export function OfferFeedStatus({ feed }: { feed: OfferFeedState }) {
  const { status, de } = feed;
  return (
    <div ref={feed.sentinelRef} className="flex min-h-[56px] items-center justify-center py-5 text-sm text-slate-500 dark:text-white/50" data-offer-feed-status={status}>
      {status === "loading" ? (
        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-[#00CDAC]" />{de ? "Weitere Angebote werden geladen …" : "Loading more offers …"}</span>
      ) : status === "error" ? (
        <button type="button" onClick={feed.retry} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-[#00CDAC]/60 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
          {de ? "Konnte nicht laden – erneut versuchen" : "Could not load – try again"}
        </button>
      ) : null}
    </div>
  );
}
