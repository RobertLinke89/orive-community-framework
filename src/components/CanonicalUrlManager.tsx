"use client";
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from "react";


function upsertLinkRelCanonical(href: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertMetaProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function CanonicalUrlManager() {
  const _pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams ? `?${searchParams.toString()}` : '';
  const location = { pathname: _pathname, search };

  function getAllowedQueryKeysForPath(pathname: string): string[] {
    // Default: strip all query params from canonical URLs.
    // Only preserve params when they identify a unique, indexable resource.
    // (Filters, tracking params, auth redirects, and diagnostics should not be canonical.)
    const rules: Array<{ test: (p: string) => boolean; keep: string[] }> = [
      // Deep-linked app screens (kept narrow; still canonicalized to root domain).
      { test: (p) => p === "/app/whatsapp", keep: ["conversationId"] },

      // Example pattern support (currently unused by routes, but requested):
      // If you later introduce pages like /something?id=123, whitelist "id" here.
      // { test: (p) => p === "/something", keep: ["id"] },
    ];

    return rules.find((r) => r.test(pathname))?.keep ?? [];
  }

  function buildCanonicalSearch(pathname: string, search: string): string {
    const allowed = new Set(getAllowedQueryKeysForPath(pathname));
    if (allowed.size === 0) return "";

    const inParams = new URLSearchParams(search);
    const outParams = new URLSearchParams();

    for (const key of Array.from(allowed)) {
      const values = inParams.getAll(key);
      for (const v of values) outParams.append(key, v);
    }

    const qs = outParams.toString();
    return qs ? `?${qs}` : "";
  }

  useEffect(() => {
    // Always canonicalize to root domain (www → root) regardless of current hostname.
    // This ensures search engines treat https://orive.app as canonical.
    const canonicalOrigin = "https://orive.app";
    const canonicalSearch = buildCanonicalSearch(location.pathname, location.search);
    const canonicalUrl = `${canonicalOrigin}${location.pathname}${canonicalSearch}`;

    upsertLinkRelCanonical(canonicalUrl);
    upsertMetaProperty("og:url", canonicalUrl);
  }, [location.pathname, location.search]);

  return null;
}
