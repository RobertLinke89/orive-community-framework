import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen | ORIVE",
  description: "Passwort für dein ORIVE-Konto zurücksetzen.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
