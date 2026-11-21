import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Für Facilitators: Angebote auf ORIVE listen",
  description: "Zeig deine Sessions, Workshops und Retreats auf ORIVE und erreiche Menschen in ganz Europa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
