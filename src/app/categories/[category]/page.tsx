"use client";

import CategoryDetailView from '@/views/CategoryDetail';
import { Suspense } from 'react';

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading category...</div>}>
      <CategoryDetailView />
    </Suspense>
  );
}
