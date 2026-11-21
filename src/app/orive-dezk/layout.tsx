import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ORIVE dezk – Arbeitsplatz für Facilitators",
  description: "Termine, Angebote und Anfragen an einem Ort: der ORIVE dezk für Facilitators.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
