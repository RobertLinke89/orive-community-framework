import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type OfferingHeroHeadingProps = {
  title: string;
  category?: string | null;
  location?: string | null;
  facilitatorName?: string | null;
  /** e.g. "Listed on Eventbrite" — omit for ORIVE-native listings */
  listingLabel?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  /** White text on hero photo (default). Pass false for light surfaces. */
  overlay?: boolean;
  className?: string;
};

const itemClass = "inline-flex h-4 items-center gap-1.5 leading-none";

/**
 * Shared hero copy for all offering detail pages:
 * title + one meta row (category, listing/rating, location, host) on one baseline.
 */
export function OfferingHeroHeading({
  title,
  category,
  location,
  facilitatorName,
  listingLabel,
  rating,
  reviewCount,
  overlay = true,
  className,
}: OfferingHeroHeadingProps) {
  const showRating = typeof rating === "number" && rating > 0;
  const categoryLabel = String(category || "").trim();
  const place = String(location || "").trim();
  const host = String(facilitatorName || "").trim();
  const listing = String(listingLabel || "").trim();

  return (
    <div className={cn(overlay ? "text-white" : "text-foreground", className)}>
      <h1
        className={cn(
          "max-w-3xl font-semibold tracking-tight leading-[1.1]",
          overlay ? "text-3xl sm:text-5xl text-white" : "text-3xl sm:text-5xl",
        )}
      >
        {title}
      </h1>

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-none",
          overlay ? "text-white/85" : "text-muted-foreground",
        )}
      >
        {categoryLabel ? (
          <span
            className={cn(
              itemClass,
              "text-[11px] font-semibold uppercase tracking-[0.18em]",
              overlay ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {categoryLabel}
          </span>
        ) : null}

        {showRating ? (
          <span className={itemClass}>
            <Star className={cn("h-3.5 w-3.5 shrink-0", overlay ? "fill-white text-white" : "fill-foreground")} />
            <span className="leading-none">{rating!.toFixed(1)}</span>
            {reviewCount ? (
              <span className={cn("leading-none", overlay ? "text-white/55" : "text-muted-foreground/70")}>
                ({reviewCount})
              </span>
            ) : null}
          </span>
        ) : listing ? (
          <span className={itemClass}>{listing}</span>
        ) : null}

        {place ? (
          <span className={itemClass}>
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-none">{place}</span>
          </span>
        ) : null}

        {host ? <span className={itemClass}>{host}</span> : null}
      </div>
    </div>
  );
}
