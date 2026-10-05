"use client";

import { cn } from "@nairacloud/ui";

/** Segmented circular progress — arcs with gaps, not a smooth stroke. */
export function SegmentedRing({
  value,
  max = 100,
  segments = 20,
  size = 88,
  stroke = 7,
  label,
  sublabel,
  className,
}: {
  value: number;
  max?: number;
  segments?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const activeCount = Math.round(pct * segments);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapRatio = 0.28;
  const segLen = circumference / segments;
  const dash = segLen * (1 - gapRatio);
  const gap = segLen * gapRatio;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden>
          {Array.from({ length: segments }).map((_, i) => {
            const active = i < activeCount;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={active ? "var(--accent)" : "var(--ring-track)"}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-(i * segLen) - gap / 2}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label != null ? (
            <span className="text-[18px] font-medium tracking-tight text-white">{label}</span>
          ) : (
            <span className="text-[18px] font-medium tracking-tight text-white">{Math.round(pct * 100)}%</span>
          )}
        </div>
      </div>
      {sublabel ? <p className="mt-3 text-[13px] text-text-secondary">{sublabel}</p> : null}
    </div>
  );
}
