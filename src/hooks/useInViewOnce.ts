"use client";
import { RefObject, useEffect, useState } from "react";

/**
 * Returns true once the element is (nearly) in the viewport.
 * Useful for lazy-mounting heavy below-the-fold sections.
 */
export function useInViewOnce<T extends Element>(
  ref: RefObject<T>,
  options?: {
    rootMargin?: string;
    threshold?: number | number[];
  }
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin ?? "300px 0px",
        threshold: options?.threshold ?? 0.01,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, options?.rootMargin, options?.threshold, ref]);

  return inView;
}
