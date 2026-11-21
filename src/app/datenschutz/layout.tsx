import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | ORIVE",
  description: "Wie ORIVE (orive.co) personenbezogene Daten verarbeitet.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
