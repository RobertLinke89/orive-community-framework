"use client";

import { Suspense } from 'react';
import { AffiliateProgramView } from '@/views/AffiliateProgram';

export default function AffiliatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <AffiliateProgramView />
    </Suspense>
  );
}
