"use client";

import { Suspense } from "react";
import DezkMarketing from "@/views/DezkMarketing";

export default function OriveDezkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DezkMarketing />
    </Suspense>
  );
}
