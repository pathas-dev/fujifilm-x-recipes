'use client';

import { useCallback, useEffect, useState } from 'react';

export default function ErrorCommon({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(error.message);
  }, [error]);

  const handleReset = useCallback(() => reset(), [reset]);

  return (
    <main className="flex h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Error Occured</h2>
      <p className="text-xl">{message}</p>
      <button onClick={handleReset} className="btn btn-outline btn-error mt-2">
        Try again
      </button>
    </main>
  );
}
