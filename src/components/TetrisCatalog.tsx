"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type PublicOffering } from "@/hooks/usePublicOfferings";
import { packTetrisCatalog } from "@/lib/catalogLayout";
import { isRealOfferingImage } from "@/lib/imageUrl";
import { OfferingCard } from "./OfferingCard";

interface TetrisCatalogProps {
  groups: { id: string; label: string; offerings: PublicOffering[] }[];
}

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

export function TetrisCatalog({ groups }: TetrisCatalogProps) {
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
  const placements = useMemo(() => packTetrisCatalog(realGroups, cols), [realGroups, cols]);
  const firstPaint = cols >= 6 ? 18 : cols >= 4 ? 14 : 8;
  const [visibleCount, setVisibleCount] = useState(firstPaint);
  const rowHeight = cols >= 6 ? 168 : cols >= 4 ? 156 : 148;

  useEffect(() => {
    setVisibleCount(firstPaint);
    if (placements.length <= firstPaint) return;
    const reveal = () => setVisibleCount(placements.length);
    const idle = window.requestIdleCallback?.(reveal, { timeout: 400 });
    if (idle == null) {
      const t = window.setTimeout(reveal, 120);
      return () => window.clearTimeout(t);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [placements, firstPaint]);

  const visible = placements.slice(0, visibleCount);

  if (placements.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-white/35 py-10">
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
      {visible.map((tile, index) => (
        <motion.div
          key={`${tile.item.id}-${tile.col}-${tile.row}`}
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
      ))}
    </div>
  );
}
