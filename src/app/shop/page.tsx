import { notFound } from "next/navigation";

// 2026-11-10: the shop is not active (placeholder products with Amazon links, Shopify checkout not set up).
// It answers 404 until it is ready. The old client view is still in src/views/Shop.tsx.
export default function Page() {
  notFound();
}
