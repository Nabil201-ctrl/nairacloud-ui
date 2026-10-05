"use client";

import { useEffect } from "react";
import NextError from "next/error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <h1 className="font-mono text-2xl font-bold">Critical admin error</h1>
          <p className="mt-3 text-sm text-zinc-400">Please try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-lg bg-white px-4 py-2 font-mono text-xs font-bold text-black"
          >
            Retry
          </button>
          <div className="sr-only">
            <NextError statusCode={0} />
          </div>
        </div>
      </body>
    </html>
  );
}
