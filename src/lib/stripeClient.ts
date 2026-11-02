import Stripe from "stripe";
import { isStripeKeyUsable } from "@/lib/payments";

export const STRIPE_API_VERSION = "2024-06-20" as Stripe.StripeConfig["apiVersion"];

let override: Stripe | null | undefined;

/** Server-side Stripe client. Tests inject a mock via setStripeForTests(). */
export function getStripe(): Stripe | null {
  if (override !== undefined) return override;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isStripeKeyUsable(key)) return null;
  return new Stripe(key as string, { apiVersion: STRIPE_API_VERSION });
}

export function setStripeForTests(client: Stripe | null | undefined) {
  override = client;
}

/** Signature verification never needs network; usable with a dummy key. */
export function stripeForWebhooks(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_webhook_verification_only", { apiVersion: STRIPE_API_VERSION });
}
