"use client";
import { usePathname } from 'next/navigation';
import { useEffect } from "react";


function upsertMetaName(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function isNoIndexPath(pathname: string): boolean {
  // Private / non-indexable areas
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return true;
  if (pathname === "/reset-password" || pathname.startsWith("/reset-password/")) return true;

  // Logged-in experience
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) return true;
  if (pathname === "/app" || pathname.startsWith("/app/")) return true;

  // Admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;

  // Other authenticated-only routes that exist outside /app
  if (pathname === "/profile-preview" || pathname.startsWith("/profile-preview/")) return true;
  if (pathname === "/saved-sessions" || pathname.startsWith("/saved-sessions/")) return true;

  return false;
}

export function RobotsMetaManager() {
  const _pathname = usePathname(); const location = { pathname: _pathname };

  useEffect(() => {
    const noindex = isNoIndexPath(location.pathname);
    const robotsContent = noindex ? "noindex, nofollow" : "index, follow";

    upsertMetaName("robots", robotsContent);
  }, [location.pathname]);

  return null;
}
