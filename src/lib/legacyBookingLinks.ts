import { appOrigin } from "@/lib/appOrigin";
import { createBookingToken } from "@/lib/bookingToken";

/** Booking-pass link with signed token (S2/S9). The pass page forwards ?t= to the API. */
export function bookingPassUrl(bookingId: string, extra = "") {
  return `${appOrigin()}/booking/${encodeURIComponent(bookingId)}?t=${encodeURIComponent(createBookingToken(bookingId))}${extra}`;
}
