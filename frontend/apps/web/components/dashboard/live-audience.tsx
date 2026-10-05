"use client";

import { cn } from "@nairacloud/ui";

/** Concentric grayscale rings; green only for the live center state. */
export function LiveAudience({
  liveCount,
  label = "Live instances",
  className,
}: {
  liveCount: number;
  label?: string;
  className?: string;
}) {
  const live = liveCount > 0;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-4", className)}>
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-[#BDBDBD]/40" />
        <span className="absolute inset-4 rounded-full border border-[#6F6F6F]/50" />
        <span className="absolute inset-8 rounded-full border border-[#343434]" />
        <span className="absolute inset-12 rounded-full bg-[#151515]" />
        <span
          className={cn(
            "relative z-10 h-2.5 w-2.5 rounded-full",
            live ? "bg-accent dot-live" : "bg-text-muted",
          )}
          aria-hidden
        />
      </div>
      <div className="text-center">
        <p className="text-[22px] font-medium tracking-tight text-white">{liveCount}</p>
        <p className="mt-0.5 text-[12px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}
