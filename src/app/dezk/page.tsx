"use client";

import FacilitatorDezk from "@/views/FacilitatorDezk";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f8] dark:bg-[#011424] flex items-center justify-center text-slate-500 dark:text-white/60">Loading ORIVE dezk...</div>}>
      <FacilitatorDezk />
    </Suspense>
  );
}
