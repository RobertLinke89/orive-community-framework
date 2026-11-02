import type { Metadata } from "next";
import { AuthCallback } from "@/components/auth/AuthCallback";

export const metadata: Metadata = { title: "Orive", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return <AuthCallback />;
}
