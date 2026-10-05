"use client";

import { useEffect, useState } from "react";

type Status = "operational" | "degraded" | "unknown";

export function StatusBadge() {
  const [status, setStatus] = useState<Status>("unknown");

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/public/status`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => {
          if (!alive) return;
          const overall = b && typeof b === "object" && "data" in b ? (b as { data?: { overall?: string } }).data?.overall : undefined;
          setStatus(overall === "degraded" ? "degraded" : overall === "operational" ? "operational" : "unknown");
          timer = setTimeout(check, 30_000);
        })
        .catch(() => {
          if (!alive) return;
          setStatus("unknown");
          timer = setTimeout(check, 30_000);
        });
    };
    check();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const dot =
    status === "operational" ? "bg-accent" : status === "degraded" ? "bg-warning animation-pulse" : "bg-text-muted/50";
  const label = status === "operational" ? "All systems operational" : status === "degraded" ? "Systems degraded" : "Status unknown";

  return (
    <a
      href="/status"
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted hover:border-border-hover hover:text-text"
    >
      <span aria-hidden className={`dot-live h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </a>
  );
}