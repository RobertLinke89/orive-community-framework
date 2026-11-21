import type { Metadata } from "next";

// Placeholder area: reachable, but not linked in navigation and kept out of search engines until it is ready.
export const metadata: Metadata = {
  title: "Shop (in Vorbereitung) | ORIVE",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
