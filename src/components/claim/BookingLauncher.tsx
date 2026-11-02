"use client";
import { useEffect, useState } from "react";
import { SessionBookingModal } from "@/components/SessionBookingModal";
import type { ClaimableOffer } from "@/lib/claim/types";

/** Opens the existing session booking calendar for buttons rendered as [data-book=<offering_id>] in the profile. */
export function BookingLauncher({ offers, facilitatorId, facilitatorName }: { offers: ClaimableOffer[]; facilitatorId: string; facilitatorName: string }) {
  const [offer, setOffer] = useState<ClaimableOffer | null>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-book]") as HTMLElement | null;
      if (!el) return;
      const o = offers.find((x) => x.offering_id === el.dataset.book && !x.is_preset);
      if (o) { e.preventDefault(); setOffer(o); }
    };
    const k = (e: KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement)?.matches?.(".card[data-book]")) h(e as unknown as MouseEvent); };
    document.addEventListener("click", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("click", h); document.removeEventListener("keydown", k); };
  }, [offers]);
  if (!offer) return null;
  return (
    <SessionBookingModal open onOpenChange={(v) => !v && setOffer(null)} sessionTitle={offer.title}
      sessionPrice={offer.price_amount === null ? "" : String(offer.price_amount)} sessionDuration={offer.duration_minutes ?? undefined}
      facilitatorId={facilitatorId} facilitatorName={facilitatorName} isClaimed offeringId={offer.offering_id!} />
  );
}
