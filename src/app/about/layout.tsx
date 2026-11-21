import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über ORIVE – Vision & Team",
  description: "ORIVE verbindet Menschen mit Facilitators für Breathwork, Yoga, Eisbaden, Sound Healing und mehr – in ganz Europa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
