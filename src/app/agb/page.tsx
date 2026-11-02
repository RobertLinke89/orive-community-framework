import type { Metadata } from "next";
import { Terms } from "@/views/Terms";

export const metadata: Metadata = {
  title: "AGB | ORIVE",
  description: "Vertragsbedingungen für Buchungen über orive.co.",
};

export default function Page() {
  return <Terms />;
}
