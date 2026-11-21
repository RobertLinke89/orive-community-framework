import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warteliste | ORIVE",
  description: "Trag dich in die ORIVE Warteliste ein.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
