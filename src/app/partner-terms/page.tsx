import type { Metadata } from "next";
import { PartnerTerms } from "@/views/PartnerTerms";

export const metadata: Metadata = {
  title: "Partnerbedingungen | ORIVE",
  description: "Vergütung, 60-Tage-Attribution und Auszahlung im ORIVE-Partnerprogramm.",
};

export default function Page() {
  return <PartnerTerms />;
}
