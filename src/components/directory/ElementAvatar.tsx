"use client";

// Small card avatar: the profile's element emblem (same SVG as on the profile page, no element name),
// or the facilitator's own uploaded avatar once a profile is claimed. No crawled photos (no image rights).
// Lightweight: inline SVG + CSS transform/opacity animations, frozen with prefers-reduced-motion.
// A claimed photo that 404s or is blocked falls back to the emblem — never a broken-image icon.
import { useCallback, useEffect, useState } from "react";
import { emblemSvg, type ElementKey } from "./elements";
import { isSafeAvatarUrl } from "@/lib/safeImage";

const KEYS: ElementKey[] = ["fire", "water", "air", "earth", "aether"];
// Prefix class names and ids so the card emblems never collide with page CSS or with the profile hero emblem.
const SMALL: Record<string, string> = {};
for (const k of KEYS) {
  SMALL[k] = emblemSvg(k)
    .replace(/class="([^"]+)"/g, (_m, c: string) => `class="${c.split(/\s+/).map((x) => `oav-${x}`).join(" ")}"`)
    .replace(/id="([^"]+)"/g, 'id="oav-$1"')
    .replace(/url\(#([^)]+)\)/g, "url(#oav-$1)")
    .replace("<svg ", '<svg focusable="false" ');
}

function Emblem({ element, size }: { element: ElementKey; size: number }) {
  return (
    <span
      className={`oav oav-el-${element}`}
      style={{ width: size, height: size, display: "inline-flex", overflow: "hidden", flexShrink: 0 }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: SMALL[element]! }}
    />
  );
}

export function ElementAvatar({ element, avatar, size = 40 }: { element?: ElementKey | null; avatar?: string | null; size?: number }) {
  const el = element && SMALL[element] ? element : "aether";
  const safe = isSafeAvatarUrl(avatar) ? String(avatar).trim() : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safe]);

  const onError = useCallback(() => setFailed(true), []);
  const refCb = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0 && img.getAttribute("src")) setFailed(true);
  }, []);

  if (safe && !failed) {
    return (
      <span
        className="oav oav-photo"
        style={{ width: size, height: size, display: "inline-flex", overflow: "hidden", flexShrink: 0 }}
        aria-hidden="true"
      >
        <img
          src={safe}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={onError}
          ref={refCb}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }
  return <Emblem element={el} size={size} />;
}
