import type { Metadata } from "next";
import { BuyerProtection } from "@/views/BuyerProtection";

export const metadata: Metadata = {
  title: "Käuferschutz | ORIVE",
  description: "ORIVE-Vermittlung: 1,00 € Gebühr, Stripe-Zahlung, Buchungspass und Ansprechpartner.",
};

export default function Page() {
  return <BuyerProtection />;
}
