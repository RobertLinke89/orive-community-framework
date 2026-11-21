"use client";

import { useCallback, useEffect, useState, type ImgHTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { ElementAvatar } from "@/components/directory/ElementAvatar";
import type { ElementKey } from "@/components/directory/elements";
import { isPlausibleImageUrl, isSafeAvatarUrl } from "@/lib/safeImage";
import { cn } from "@/lib/utils";

/** Teal/navy Orive placeholder used when a cover or card image is missing or fails to load. */
export function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#01223F] via-[#017F80] to-[#00CDAC]",
        className
      )}
      aria-hidden="true"
    >
      <img
        src="/orive-logo-wings.png"
        alt=""
        className="h-[38%] w-auto max-h-16 max-w-[70%] object-contain opacity-90"
      />
    </span>
  );
}

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src?: string | null;
  alt?: string;
  kind?: "cover" | "avatar";
  element?: ElementKey | null;
  avatarSize?: number;
  fallback?: ReactNode;
};

/**
 * Drop-in <img> that never shows a broken-image icon or its alt text.
 * Known-bad URLs are skipped before request; runtime errors (404, hotlink block)
 * and images that already failed before hydration swap to a branded fallback.
 */
export function SafeImage({
  src,
  alt = "",
  kind = "cover",
  element = null,
  avatarSize = 40,
  fallback,
  className,
  onError,
  ...rest
}: SafeImageProps) {
  const raw = typeof src === "string" ? src.trim() : "";
  const allowed = kind === "avatar" ? isSafeAvatarUrl(raw) : isPlausibleImageUrl(raw);
  const [failed, setFailed] = useState(!allowed);

  useEffect(() => {
    const next = typeof src === "string" ? src.trim() : "";
    setFailed(!(kind === "avatar" ? isSafeAvatarUrl(next) : isPlausibleImageUrl(next)));
  }, [src, kind]);

  const fail = useCallback(
    (e?: SyntheticEvent<HTMLImageElement, Event>) => {
      setFailed(true);
      if (e) onError?.(e);
    },
    [onError]
  );

  const refCb = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
    },
    [fail]
  );

  if (failed || !allowed || !raw) {
    if (fallback) return <>{fallback}</>;
    if (kind === "avatar") return <ElementAvatar element={element} size={avatarSize} />;
    return <CoverPlaceholder className={className} />;
  }

  return (
    // alt is kept for the healthy image; the fallback path never renders this img.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={raw}
      alt={alt}
      className={className}
      onError={fail}
      ref={refCb}
    />
  );
}
