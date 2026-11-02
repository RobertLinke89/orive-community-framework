"use client";

import FacilitatorStart from "@/views/FacilitatorStart";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f8]" />}>
      <FacilitatorStart />
    </Suspense>
  );
}
