"use client";

import { Suspense } from "react";
import CustomerBookingPass from "@/views/CustomerBookingPass";

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#02182B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#00CDAC] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CustomerBookingPass />
    </Suspense>
  );
}
