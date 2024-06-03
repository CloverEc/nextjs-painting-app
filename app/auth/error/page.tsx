'use client';

import { Suspense } from 'react';
import ErrorPage from '../../components/ErrorPage';

export default function ErrorPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPage />
    </Suspense>
  );
}

