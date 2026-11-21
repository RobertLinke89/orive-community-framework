import type { Metadata } from "next";
import { BuyerProtection } from "@/views/BuyerProtection";

export const metadata: Metadata = {
  title: "Buchung & Zahlung (derzeit nicht aktiv) | ORIVE",
  description: "Buchung und Zahlung über ORIVE sind derzeit nicht aktiv. So soll es funktionieren, sobald die Funktion freigeschaltet ist.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <BuyerProtection />;
}
