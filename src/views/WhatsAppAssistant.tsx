"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppAssistant() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chat");
  }, [router]);
  return <div className="min-h-screen bg-background" />;
}
