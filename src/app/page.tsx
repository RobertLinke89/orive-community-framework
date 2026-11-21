import { Suspense } from "react";
import type { Metadata } from "next";
import Index from "../views/Index";

export const metadata: Metadata = {
  title: "ORIVE – Breathwork, Yoga, Eisbaden & Sound Healing in Europa",
  description: "Finde Facilitators, Sessions und Retreats für Breathwork, Yoga, Eisbaden, Sound Healing und mehr – in ganz Europa.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Index />
    </Suspense>
  );
}
