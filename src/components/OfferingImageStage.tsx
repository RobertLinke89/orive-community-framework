"use client";

import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { isPlausibleImageUrl } from "@/lib/safeImage";

type OfferingImageStageProps = {
  images: string[];
  title: string;
  tall?: boolean;
  /** Self-hosted topic photo, not the offer's own picture */
  symbolic?: boolean;
};

export function OfferingImageStage({ images, title, tall = false, symbolic = false }: OfferingImageStageProps) {
  const usable = images.filter((u) => isPlausibleImageUrl(u));
  const [selected, setSelected] = useState(0);
  const current = usable[selected] || usable[0];

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-[#01223F] ${tall ? "h-[58vh] min-h-[420px] max-h-[640px]" : "h-[300px] md:h-[400px]"}`}>
      <SafeImage
        src={current}
        alt={title}
        className="h-full w-full object-cover"
        loading="eager"
        kind="cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#011627] via-[#011627]/30 to-transparent" />
      {(symbolic || (current || "").startsWith("/topic-images/")) ? (
        <span className="pointer-events-none absolute bottom-3 left-4 z-20 text-[10px] font-medium uppercase tracking-[0.14em] text-white/75">
          Symbolbild
        </span>
      ) : null}
      {usable.length > 1 ? (
        <div className="absolute bottom-5 right-4 z-20 flex gap-2">
          {usable.slice(0, 3).map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Photo ${index + 1}`}
              onClick={() => setSelected(index)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white/15 shadow-lg backdrop-blur-sm ${
                selected === index ? "border-white" : "border-white/40"
              }`}
            >
              <SafeImage src={image} alt="" className="h-full w-full object-cover" kind="cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
