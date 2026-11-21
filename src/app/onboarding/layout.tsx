import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Willkommen | ORIVE",
  description: "ORIVE einrichten.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
