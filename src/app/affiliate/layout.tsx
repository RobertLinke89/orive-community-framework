import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate- & Partnerprogramm | ORIVE",
  description: "Empfiehl Sessions, Workshops und Retreats auf ORIVE und erhalte eine Provision für vermittelte Buchungen.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
