"use client";

import Link from 'next/link';
import Image, { type ImageLoader } from 'next/image';
import { useState } from 'react';
import { Heart, Star } from "lucide-react";
import { type PublicOffering } from "@/hooks/usePublicOfferings";
import { getTopicImageUrl, optimizeOfferingImage, offeringCardImageWidth, resolveOfferingImage } from "@/lib/imageUrl";
import { isTopicImageSrc, topicImageFor } from "@/lib/topicImages";
import { CoverPlaceholder } from "@/components/SafeImage";
import { isSafeAvatarUrl } from "@/lib/safeImage";
import { partnerLabel, resolveFulfillment } from "@/lib/fulfillment";
import { useLanguage } from "@/hooks/useLanguage";
import { formatOfferingWhenLine, offeringSpan } from "@/lib/offeringSpan";
import { cn } from "@/lib/utils";

export type OfferingCardSize = 'hero' | 'wide' | 'tall' | 'featured' | 'default' | 'compact';

interface OfferingCardProps {
  offering: PublicOffering;
  showFacilitator?: boolean;
  size?: OfferingCardSize;
  fill?: boolean;
  categoryLabel?: string;
  priority?: boolean;
  realImageOnly?: boolean;
  onImageError?: () => void;
  /** custom loader (homepage feed: cached WebP thumbnails instead of /_next/image) */
  imageLoader?: ImageLoader;
  /** Optional overrides for feed tiles (homepage offer feed links to the facilitator profile). */
  href?: string;
  badgeLabel?: string;
}

export function OfferingCard({ offering, size = 'default', fill = false, categoryLabel, priority = false, realImageOnly = false, onImageError, href, badgeLabel, imageLoader }: OfferingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [broken, setBroken] = useState(false);
  const { language } = useLanguage();
  const isDe = language === 'de';
  const whenLine = formatOfferingWhenLine(offeringSpan(offering), isDe);
  const offeringId = String(offering.id || '');
  const isFacilitator = offeringId.startsWith('fac-card-');

  const targetHref = href ? href : isFacilitator
    ? (offering.source_url || `/facilitator/${offering.facilitator_id}`)
    : offering.type === 'individual'
    ? `/session/${offeringId}`
    : `/experience/${offeringId}`;

  const fulfillment = resolveFulfillment(offering);
  const showRating = fulfillment === 'orive' && typeof offering.rating === 'number' && offering.rating > 0;
  const cleanPrice = offering.price != null && String(offering.price).trim()
    ? String(offering.price).replace('/hr', '').trim()
    : '';
  // country prefix ("DE · ") removed from titles – location is shown on the detail page

  const titleClass = size === 'hero' || size === 'featured'
    ? "text-sm sm:text-base"
    : size === 'compact' || size === 'tall'
      ? "text-xs"
      : "text-sm";

  const imageWidth = offeringCardImageWidth(size);
  const topicText = `${offering.title || ""} ${(offering.tags || []).join(" ")} ${categoryLabel || ""}`;
  const topic = !isFacilitator ? topicImageFor(String(offering.id || offering.title || ""), topicText) : null;
  const hasOwnImage = Boolean(offering.image_url) && !isTopicImageSrc(offering.image_url);
  const primarySrc = isFacilitator
    ? (isSafeAvatarUrl(offering.image_url) ? offering.image_url! : '')
    : offering.image_url
      ? optimizeOfferingImage(offering.image_url, imageWidth)
      : (topic?.src || (!realImageOnly ? optimizeOfferingImage(resolveOfferingImage(offering.image_url, offering.tags, offering.title, offering.type), imageWidth) : ''));
  const fallbackSrc = isFacilitator ? '' : (topic?.src || getTopicImageUrl(offering.tags, offering.title, offering.type));
  const fallbackIsSame = Boolean(fallbackSrc && primarySrc && fallbackSrc === primarySrc);
  const usePlaceholder = Boolean(broken && (isFacilitator || !fallbackSrc || fallbackIsSame));
  const imageSrc = broken && !usePlaceholder ? fallbackSrc : primarySrc;
  const imageSizes =
    size === 'hero' || size === 'wide' || size === 'featured'
      ? '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'
      : '(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw';
  const solidOrive = fulfillment === 'orive' && !offering.image_url && !topic?.src;

  return (
    <div className={cn("group relative flex flex-col w-full text-left transition-all duration-300", fill && "h-full min-h-0")}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#01223F]",
          fill ? "h-full mb-0" : "mb-3",
          !fill && size === 'hero' && "aspect-[16/10]",
          !fill && size === 'featured' && "aspect-[16/10]",
          !fill && size === 'wide' && "aspect-[16/9]",
          !fill && size === 'tall' && "aspect-[3/4]",
          !fill && size === 'default' && "aspect-[20/19]",
          !fill && size === 'compact' && "aspect-[5/4]"
        )}
      >
        <Link href={targetHref} className="block relative w-full h-full overflow-hidden">
          {solidOrive || usePlaceholder || !imageSrc ? (
            <CoverPlaceholder />
          ) : (
            <Image
              key={imageSrc}
              src={imageSrc}
              alt={offering.title}
              fill
              sizes={imageSizes}
              priority={priority}
              loader={isTopicImageSrc(imageSrc) ? undefined : imageLoader}
              quality={60}
              onError={() => {
                if (realImageOnly && hasOwnImage) onImageError?.();
                if (!broken) setBroken(true);
              }}
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          )}
        </Link>

        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center min-w-0 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00CDAC] text-white font-bold text-[10px] tracking-tight shadow-xs">
              {badgeLabel ? badgeLabel : isFacilitator ? 'Facilitator' : offering.type === 'individual' ? '1:1 Session' : offering.type === 'event' ? 'Event' : 'Gruppe'}
            </span>
            {fulfillment === 'orive' && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-slate-900 dark:text-white shadow-xs border border-black/5 dark:border-white/10 tracking-tight">
                ORIVE
              </span>
            )}
            {fulfillment === 'external' && (
              <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[9px] font-medium text-white/80 tracking-tight">
                {partnerLabel(offering.source_platform)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
            className="shrink-0 leading-none p-0 rounded-full hover:scale-110 active:scale-90 transition-transform focus:outline-none"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors stroke-[2]",
                isLiked
                  ? "fill-[#FF385C] stroke-[#FF385C]"
                  : "fill-black/30 stroke-white drop-shadow-md"
              )}
            />
          </button>
        </div>

        {cleanPrice ? (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-slate-900 dark:text-white shadow-xs border border-black/5 dark:border-white/10">
              {cleanPrice}
            </span>
          </div>
        ) : null}

        {fill && (
          <Link href={targetHref} className="absolute inset-x-0 bottom-0 z-[5] pt-10 px-3 pb-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent">
            {categoryLabel && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-0.5 truncate">
                {categoryLabel}
              </p>
            )}
            <div className="flex items-end justify-between gap-2 pr-16">
              <div className="min-w-0">
                <h3 className={cn("font-semibold text-white truncate", titleClass)}>
                  {offering.title}
                </h3>
                {whenLine ? <p className="text-[11px] text-white/70 truncate">{whenLine}</p> : null}
              </div>
              {showRating ? (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{offering.rating!.toFixed(2)}</span>
                </div>
              ) : null}
            </div>
          </Link>
        )}
      </div>

      {!fill && (
        <Link href={targetHref} className="block">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={cn(
                "font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#00CDAC] transition-colors",
                titleClass
              )}
            >
              {offering.title}
            </h3>
            {showRating ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white shrink-0">
                <Star className="w-3.5 h-3.5 fill-current text-slate-900 dark:text-white" />
                <span>{offering.rating!.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
          {whenLine ? (
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-white/45">{whenLine}</p>
          ) : null}
        </Link>
      )}
    </div>
  );
}
