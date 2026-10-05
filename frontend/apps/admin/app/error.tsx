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
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="font-mono text-2xl font-bold tracking-tight text-text">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        This error has been logged. You can retry or return to the command center.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="press inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-xs font-bold text-accent-fg"
        >
          Retry
        </button>
        <a
          href="/"
          className="press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs font-bold text-text"
        >
          Command center
        </a>
      </div>
    </div>
  );
}
