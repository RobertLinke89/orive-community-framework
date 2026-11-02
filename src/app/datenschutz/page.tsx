"use client";

import { Suspense } from "react";
import Datenschutz from "@/views/Datenschutz";

export default function DatenschutzPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <Datenschutz />
    </Suspense>
  );
}
