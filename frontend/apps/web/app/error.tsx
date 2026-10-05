"use client";

import { useEffect } from "react";

export default function Error({
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
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-mono text-sm text-accent">Error</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-text-muted">
          This error was logged. You can try again, or head back to the dashboard.
        </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="press rounded-sm bg-accent px-6 py-3 font-semibold text-accent-fg hover:bg-accent-hover"
        >
          Try again
        </button>
        <a href="/dashboard" className="press rounded-sm border border-border px-6 py-3 hover:border-border-hover">
          Go to dashboard
        </a>
      </div>
    </section>
  );
}
