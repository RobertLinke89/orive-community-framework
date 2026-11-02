"use client";

import SofiaTeamDesk from "@/views/SofiaTeamDesk";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SofiaTeamDesk />
    </Suspense>
  );
}
