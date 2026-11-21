import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marktplatz: Sessions, Events & Retreats | ORIVE",
  description: "Breathwork, Yoga, Sound Healing, Retreats und mehr in ganz Europa entdecken.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
