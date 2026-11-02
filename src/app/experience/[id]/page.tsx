"use client";
import PageComponent from '../../../views/ExperienceDetail';
import { Suspense } from 'react';;

export default function Page(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent {...props} />
    </Suspense>
  );
}
