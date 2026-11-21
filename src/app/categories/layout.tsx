import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategorien: Breathwork, Yoga, Sound Healing & mehr | ORIVE",
  description: "Sessions, Events und Retreats nach Kategorie entdecken – Breathwork, Yoga, Meditation, Klangheilung, Kältetherapie und mehr.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
