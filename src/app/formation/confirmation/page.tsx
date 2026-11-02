"use client";

import PageComponent from "../../../views/FormationConfirmation";
import { Suspense } from "react";

export default function Page(props: any) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading Confirmation...</div>}>
      <PageComponent {...props} />
    </Suspense>
  );
}
