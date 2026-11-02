"use client";

import Link from "next/link";
import type { FulfillmentMode } from "@/lib/fulfillment";
import { partnerLabel } from "@/lib/fulfillment";
import { useLanguage } from "@/hooks/useLanguage";

type OfferingThingsToKnowProps = {
  fulfillment: FulfillmentMode;
  partner?: string | null;
  cancellation?: string | null;
  isDe?: boolean;
};

export function bookingPriceNote(fulfillment: FulfillmentMode, isDe: boolean, partner?: string | null) {
  if (fulfillment === "orive") {
    return isDe
      ? "Zahlung über Stripe. ORIVE sieht keine Kartennummern."
      : "Paid on Stripe. ORIVE never sees card numbers.";
  }
  if (fulfillment === "external") {
    const name = partnerLabel(partner);
    return isDe
      ? `Gelisteter Preis. Endpreis und Plätze bei ${name}.`
      : `Listed price. Final price and seats on ${name}.`;
  }
  return isDe ? "Derzeit nicht über ORIVE verkauft." : "Not sold by ORIVE.";
}

export function OfferingThingsToKnow({
  fulfillment,
  partner,
  cancellation,
  isDe = false,
}: OfferingThingsToKnowProps) {
  const { copy } = useLanguage();
  const name = partnerLabel(partner);
  const stated = String(cancellation || "").trim();

  const cancelText = stated
    ? stated
    : fulfillment === "orive"
      ? copy(
          "Kein pauschales Sofort-Storno. Änderungen und Rückzahlungen prüft ORIVE einzeln über contact@orive.app. Termingebundene Angebote können vom Widerruf ausgenommen sein.",
          "No one-click refund. Changes and repayments are reviewed case by case via contact@orive.app. Time-specific services may be excluded from withdrawal rights."
        )
      : fulfillment === "external"
        ? copy(
            `Storno und Rückerstattung liegen bei ${name}, nicht bei ORIVE.`,
            `Cancellation and refunds are handled by ${name}, not ORIVE.`
          )
        : copy(
            "Für dieses Listing ist keine Stornoregel hinterlegt.",
            "No cancellation rule is on file for this listing."
          );

  const payText = bookingPriceNote(fulfillment, isDe, partner);

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
        {copy("Gut zu wissen", "Things to know")}
      </h2>
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {copy("Storno", "Cancellation")}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{cancelText}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {copy("Zahlung", "Payment")}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{payText}</p>
          <Link
            href="/protection"
            className="inline-block mt-2 text-sm text-[#008975] dark:text-[#00CDAC] hover:underline"
          >
            {copy("Buchung & Zahlung", "Booking & payment")}
          </Link>
        </div>
      </div>
    </section>
  );
}
