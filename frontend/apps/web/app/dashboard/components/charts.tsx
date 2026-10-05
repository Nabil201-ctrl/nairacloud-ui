"use client";

export function ResourceBar({ label, pct, color = "var(--accent)" }: { label: string; pct: number; color?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px] text-text-muted">
        <span className="font-medium tracking-tight">{label}</span>
        <span className="font-mono text-[11px]">{safe}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-sm bg-ring-track"
      >
        <div className="h-full rounded-sm transition-all duration-500 ease-out" style={{ width: `${safe}%`, background: color }} />
      </div>
    </div>
  );
}
