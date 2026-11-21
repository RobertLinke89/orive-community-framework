"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type PublicOffering } from "@/hooks/usePublicOfferings";
import { packTetrisCatalog } from "@/lib/catalogLayout";
import { isRealOfferingImage } from "@/lib/imageUrl";
import { OfferingCard } from "./OfferingCard";
import { feedThumbLoader, type FeedTile } from "./OfferFeed";

interface TetrisCatalogProps {
  groups: { id: string; label: string; offerings: PublicOffering[] }[];
  /** homepage: further offers appended to the same grid on scroll (no heading, no second module) */
  tail?: FeedTile[];
  onTailFail?: (key: string) => void;
  /** while the offer feed's first page is loading, do not flash an empty message */
  pending?: boolean;
  empty?: ReactNode;
}

/** keys to recognise an offer that is already among the top tiles (same title or same image file) */
const titleKey = (t: string) => String(t || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const imageKey = (u: string) => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + x.pathname).toLowerCase(); } catch { return ""; } };

function useTetrisColumns() {
  const [cols, setCols] = useState(6);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setCols(width >= 1280 ? 6 : width >= 768 ? 4 : 2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

export function TetrisCatalog({ groups, tail, onTailFail, pending, empty }: TetrisCatalogProps) {
  const cols = useTetrisColumns();
  const reduceMotion = useReducedMotion();
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const realGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        offerings: group.offerings.filter(
          (item) =>
            (item.fulfillment === 'orive' || isRealOfferingImage(item.image_url)) &&
            !failedIds.has(String(item.id))
        ),
      })),
    [groups, failedIds]
  );
  // continuation tiles: same grid, packed after the top tiles; skip offers already shown above
  const tailTiles = useMemo(() => {
    if (!tail?.length) return [] as FeedTile[];
    const titles = new Set<string>(); const images = new Set<string>();
    for (const g of realGroups) for (const o of g.offerings) { titles.add(titleKey(o.title)); const k = imageKey(String(o.image_url || "")); if (k) images.add(k); }
    return tail.filter((t) => !titles.has(titleKey(t.title)) && !images.has(imageKey(t.image)));
  }, [tail, realGroups]);
  const tailById = useMemo(() => new Map(tailTiles.map((t) => [String(t.offering.id), t])), [tailTiles]);
  const placements = useMemo(
    () => packTetrisCatalog(tailTiles.length ? [...realGroups, { id: "feed", label: "", offerings: tailTiles.map((t) => t.offering) }] : realGroups, cols),
    [realGroups, tailTiles, cols]
  );
  const topKey = useMemo(() => realGroups.map((g) => g.offerings.map((o) => o.id).join(",")).join("|"), [realGroups]);
  const firstPaint = cols >= 6 ? 18 : cols >= 4 ? 14 : 8;
  const [visibleCount, setVisibleCount] = useState(firstPaint);
  const rowHeight = cols >= 6 ? 168 : cols >= 4 ? 156 : 148;

  // progressive first paint of the top tiles only; appended tiles never reset it (no flicker while scrolling)
  useEffect(() => {
    setVisibleCount(firstPaint);
    const reveal = () => setVisibleCount(Number.MAX_SAFE_INTEGER);
    const idle = window.requestIdleCallback?.(reveal, { timeout: 400 });
    if (idle == null) {
      const t = window.setTimeout(reveal, 120);
      return () => window.clearTimeout(t);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [topKey, firstPaint]);

  const visible = placements.slice(0, visibleCount);

  if (placements.length === 0) {
    if (pending) return null;
    if (empty) return <>{empty}</>;
    return (
      <p className="px-1 py-10 text-sm text-slate-500 dark:text-white/50">
        Noch keine Termine in dieser Übersicht.
      </p>
    );
  }

  return (
    <div
      className="grid gap-2 sm:gap-2.5"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: `${rowHeight}px`,
      }}
    >
      {visible.map((tile, index) => {
        const ft = tile.categoryId === "feed" ? tailById.get(String(tile.item.id)) : undefined;
        return ft ? (
          <div
            key={String(tile.item.id)}
            data-feed-offer={ft.key}
            className="min-w-0 h-full overflow-hidden"
            style={{
              gridColumn: `${tile.col} / span ${tile.colSpan}`,
              gridRow: `${tile.row} / span ${tile.rowSpan}`,
              contentVisibility: "auto",
              containIntrinsicSize: `${rowHeight * tile.rowSpan}px`,
            }}
          >
            <OfferingCard
              offering={tile.item}
              size={tile.size}
              fill
              realImageOnly
              href={ft.href}
              badgeLabel={ft.badgeLabel}
              categoryLabel={ft.categoryLabel}
              imageLoader={feedThumbLoader}
              onImageError={() => onTailFail?.(ft.key)}
            />
          </div>
        ) : (
        <motion.div
          key={String(tile.item.id)}
          className="min-w-0 h-full overflow-hidden"
          style={{
            gridColumn: `${tile.col} / span ${tile.colSpan}`,
            gridRow: `${tile.row} / span ${tile.rowSpan}`,
            contentVisibility: index < firstPaint ? 'visible' : 'auto',
            containIntrinsicSize: `${rowHeight * tile.rowSpan}px`,
          }}
          initial={reduceMotion || index < firstPaint ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <OfferingCard
            offering={tile.item}
            size={tile.size}
            fill
            priority={index < 8}
            realImageOnly={tile.item.fulfillment !== 'orive'}
            onImageError={() => {
              const id = String(tile.item.id);
              setFailedIds((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }}
            categoryLabel={tile.indexInCategory === 0 ? tile.categoryLabel : undefined}
          />
        </motion.div>
        );
      })}
    </div>
  );
}
