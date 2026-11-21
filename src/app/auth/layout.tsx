import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden | ORIVE",
  description: "Bei ORIVE anmelden oder registrieren.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
