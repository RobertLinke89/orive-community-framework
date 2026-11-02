"use client";
import PageComponent from '../../views/ForFacilitators';
import { Suspense } from 'react';

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PageComponent {...props} />
    </Suspense>
  );
}
