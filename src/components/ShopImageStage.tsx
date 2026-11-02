"use client";

import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";

type ShopImage = { url: string; altText: string | null };

type ShopImageStageProps = {
  images: ShopImage[];
  title: string;
};

export function ShopImageStage({ images, title }: ShopImageStageProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });
  const [lightbox, setLightbox] = useState(false);
  const current = images[selected];

  return (
    <>
      <div className="flex gap-2">
        {images.length > 1 ? (
          <div className="hidden w-12 shrink-0 flex-col gap-1.5 sm:flex">
            {images.slice(0, 7).map((image, index) => (
              <button
                key={image.url}
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={() => setSelected(index)}
                className={`aspect-square overflow-hidden rounded-sm border bg-white ${
                  selected === index
                    ? "border-slate-900 dark:border-white"
                    : "border-slate-200 dark:border-white/15"
                }`}
              >
                <img src={image.url} alt="" className="h-full w-full object-contain p-0.5" />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => current && setLightbox(true)}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            setZoom({
              on: true,
              x: ((event.clientX - box.left) / box.width) * 100,
              y: ((event.clientY - box.top) / box.height) * 100,
            });
          }}
          onMouseLeave={() => setZoom((state) => ({ ...state, on: false }))}
          className="relative aspect-square w-full overflow-hidden rounded-sm bg-white"
        >
          {current ? (
            <img
              src={current.url}
              alt={current.altText || title}
              className="h-full w-full bg-white object-contain p-4 transition-transform duration-150"
              style={
                zoom.on
                  ? { transform: "scale(1.85)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 dark:text-white/20">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
        </button>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:hidden">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setSelected(index)}
              className={`aspect-square overflow-hidden rounded-lg border ${
                selected === index ? "border-[#00CDAC]" : "border-slate-200/80 dark:border-white/10"
              }`}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox && current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={current.url}
            alt={current.altText || title}
            className="max-h-[88vh] max-w-[92vw] object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
