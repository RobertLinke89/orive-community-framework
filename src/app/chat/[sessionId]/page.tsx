"use client";

import { Suspense } from "react";
import OriveChat from "@/views/OriveChat";

export default function ChatSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#011627]" />}>
      <OriveChat />
    </Suspense>
  );
}
