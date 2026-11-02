import type { Metadata } from "next";
import Invest from "@/views/Invest";

export const metadata: Metadata = {
  title: "Investoren | ORIVE",
  description:
    "ORIVE ist das Zuhause einer Generation, die Einkommen, Körper und Unternehmen aus dem Arbeitsvertrag löst. Die Einordnung für Investoren.",
  openGraph: {
    title: "Eine Generation verlässt den Arbeitsvertrag. | ORIVE",
    description:
      "Kapital in ORIVE steht im Gesellschaftswechsel: frei im Einkommen, reguliert im Körper, handlungsfähig als Unternehmen.",
    url: "/invest",
  },
};

export default function Page() {
  return <Invest />;
}
