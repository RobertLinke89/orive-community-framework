"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type PublicOffering } from "@/hooks/usePublicOfferings";
import { OfferingCard } from "./OfferingCard";
import { assignCatalogSizes, type CatalogCardSize } from "@/lib/catalogLayout";
import { cn } from "@/lib/utils";

interface AirbnbCarouselRowProps {
  id?: string;
  title?: string;
  href?: string;
  subtitle?: string;
  offerings: PublicOffering[];
  onTitleClick?: () => void;
  direction?: "left" | "right";
}

function cardWidth(size: CatalogCardSize): string {
  if (size === 'featured') return 'w-[260px] sm:w-[300px] md:w-[340px]';
  if (size === 'compact') return 'w-[168px] sm:w-[184px] md:w-[200px]';
  return 'w-[200px] sm:w-[220px] md:w-[240px]';
}

function loopedOfferings(
  items: PublicOffering[]
): { item: PublicOffering; size: CatalogCardSize; copy: number }[] {
  if (items.length === 0) return [];
  let sized = assignCatalogSizes(items);
  while (sized.length < 8) {
    sized = [...sized, ...assignCatalogSizes(items)];
  }
  return [0, 1].flatMap((copy) => sized.map(({ item, size }) => ({ item, size, copy })));
}

export function AirbnbCarouselRow({
  id,
  title,
  href,
  subtitle,
  offerings,
  onTitleClick,
  direction = "left",
}: AirbnbCarouselRowProps) {
  const loop = useMemo(() => loopedOfferings(offerings), [offerings]);
  const duration = Math.max(96, loop.length * 6.4);

  return (
    <section id={id} className="w-full scroll-mt-28">
      {title ? (
        <div className="flex items-baseline justify-between gap-4 mb-2 px-0.5">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            {href ? (
              <Link
                href={href}
                className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white shrink-0 transition-colors"
              >
                See all
              </Link>
            ) : onTitleClick ? (
              <button
                type="button"
                onClick={onTitleClick}
                className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white shrink-0 transition-colors"
              >
                See all
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 -mt-1">{subtitle}</p>
      )}

      <div className="relative catalog-row group/row w-screen max-w-[100vw] ml-[calc(50%-50vw)]">
        {loop.length > 0 ? (
          <div className="overflow-hidden">
            <div
              className={cn(
                "catalog-marquee flex w-max gap-3 sm:gap-4 pb-1 pr-3 sm:pr-4",
                direction === "right" && "catalog-marquee-reverse"
              )}
              style={{ animationDuration: `${duration}s` }}
            >
              {loop.map(({ item, size, copy }) => (
                <div
                  key={`${item.id}-${copy}`}
                  className={cn("shrink-0", cardWidth(size))}
                >
                  <OfferingCard offering={item} size={size} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-white/35 py-10 pl-4 sm:pl-6 lg:pl-10 xl:pl-16">
            Noch keine Termine in dieser Reihe.
          </p>
        )}
      </div>
    </section>
  );
}
