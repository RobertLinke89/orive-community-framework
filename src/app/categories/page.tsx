"use client";

import CategoryDetailView from '@/views/CategoryDetail';
import { Suspense } from 'react';

export default function AllCategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading categories...</div>}>
      <CategoryDetailView />
    </Suspense>
  );
}
