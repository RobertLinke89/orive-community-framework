import type { Metadata } from "next";

// Not yet a live product: kept reachable for testing, but out of navigation and out of search engines.
export const metadata: Metadata = {
  title: "ORIVE Formation (in Vorbereitung)",
  description: "Digitale Firmengründung für Facilitators – in Vorbereitung.",
  robots: { index: false, follow: false },
};

export default function FormationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
