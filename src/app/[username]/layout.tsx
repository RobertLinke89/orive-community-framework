import type { ReactNode } from "react";
import { permanentRedirect } from "next/navigation";
import { canonicalPathForUsername } from "@/lib/claim/service";
import { categoryFromSlug } from "@/lib/claim/slugs";

/**
 * Old root profile URL orive.co/{username}: if the username belongs to a claimed (live + consented) facilitator
 * profile, redirect permanently to /{category}/{slug}. Everybody else keeps the existing PublicProfile page unchanged.
 * Category slugs themselves are never treated as usernames (prevents /yoga/... loops).
 */
export default async function UsernameLayout({ children, params }: { children: ReactNode; params: { username: string } }) {
  const u = params.username;
  if (!categoryFromSlug(u)) {
    const to = await canonicalPathForUsername(u).catch(() => null);
    if (to) permanentRedirect(to);
  }
  return <>{children}</>;
}
