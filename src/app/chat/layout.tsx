import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KI-Suche | ORIVE",
  description: "Beschreib, was du suchst – die ORIVE KI-Suche findet passende Facilitators und Angebote.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
