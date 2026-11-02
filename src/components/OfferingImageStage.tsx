"use client";

import { useState } from "react";

type OfferingImageStageProps = {
  images: string[];
  title: string;
  tall?: boolean;
};

export function OfferingImageStage({ images, title, tall = false }: OfferingImageStageProps) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] || images[0];
  if (!current) return null;

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-[#01223F] ${tall ? "h-[58vh] min-h-[420px] max-h-[640px]" : "h-[300px] md:h-[400px]"}`}>
      <img
        src={current}
        alt={title}
        className="h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#011627] via-[#011627]/30 to-transparent" />
      {images.length > 1 ? (
        <div className="absolute bottom-5 right-4 z-20 flex gap-2">
          {images.slice(0, 3).map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Photo ${index + 1}`}
              onClick={() => setSelected(index)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white/15 shadow-lg backdrop-blur-sm ${
                selected === index ? "border-white" : "border-white/40"
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
