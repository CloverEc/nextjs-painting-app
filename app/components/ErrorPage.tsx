'use client';

import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get('error') : 'Unknown error';

  return (
    <div>
      <h1>Error</h1>
      <p>{error}</p>
    </div>
  );
};

export default ErrorPage;

