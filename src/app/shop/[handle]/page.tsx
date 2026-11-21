import { notFound } from "next/navigation";

// 2026-11-10: the shop is not active; product pages answer 404 (old view: src/views/ProductDetail.tsx).
export default function Page() {
  notFound();
}
