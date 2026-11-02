"use client";

import Auth from '@/views/Auth';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Auth />
    </Suspense>
  );
}

