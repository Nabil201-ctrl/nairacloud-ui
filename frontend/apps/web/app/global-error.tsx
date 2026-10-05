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
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-zinc-400">A critical error occurred. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-sm bg-white px-6 py-3 font-semibold text-black"
          >
            Try again
          </button>
          <div className="sr-only">
            <NextError statusCode={0} />
          </div>
        </div>
      </body>
    </html>
  );
}
