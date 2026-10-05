"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";

export type Tone = "accent" | "warn" | "danger" | "info" | "muted" | "purple";

const TONE: Record<Tone, string> = {
  accent: "border-accent/40 bg-accent/10 text-accent",
  warn: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
  info: "border-info/40 bg-info/10 text-info",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  muted: "border-border bg-surface/60 text-text-muted",
};

export function LivePulse({ status = "ONLINE", className }: { status?: "ONLINE" | "RUNNING" | "DEGRADED" | "OFFLINE" | "ERROR" | "CREATING" | string; className?: string }) {
  const isHealthy = status === "ONLINE" || status === "RUNNING";
  const isWarn = status === "DEGRADED" || status === "SUSPENDED" || status === "CREATING" || status === "DRAINING";
  const isDanger = status === "OFFLINE" || status === "ERROR";

  return (
    <span className={cn("relative inline-flex h-2 w-2", className)} aria-hidden="true">
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          isHealthy ? "bg-accent" : isWarn ? "bg-warning" : isDanger ? "bg-danger" : "bg-text-muted"
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          isHealthy ? "bg-accent shadow-[0_0_8px_rgba(0,217,160,0.8)]" : isWarn ? "bg-warning shadow-[0_0_8px_rgba(255,170,0,0.8)]" : isDanger ? "bg-danger shadow-[0_0_8px_rgba(255,51,102,0.8)]" : "bg-text-muted"
        )}
      />
    </span>
  );
}

export function SecurityBadge({
  level = "9",
  label = "ROOT ADMIN",
  className,
  compact = false,
}: {
  level?: string;
  label?: string;
  className?: string;
  /** Shorter badge for narrow headers (hides level suffix). */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 font-mono text-[10px] font-bold uppercase tracking-wider text-danger shadow-[0_0_12px_rgba(255,92,92,0.25)] select-none",
        compact ? "px-2 py-0.5" : "px-2.5 py-0.5",
        className
      )}
      title="Restricted Control Plane Session"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
      <span>{compact ? (label.length > 5 ? "ADM" : label) : label}</span>
      {!compact && (
        <span className="text-danger/60 font-mono text-[9px] border-l border-danger/30 pl-1.5">L{level}</span>
      )}
    </div>
  );
}

export function Pill({
  tone = "muted",
  children,
  className,
  dot = false,
}: {
  tone?: Tone | undefined;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  const toneKey = tone ?? "muted";
  const glow =
    toneKey === "accent"
      ? "shadow-[0_0_10px_rgba(0,217,160,0.15)]"
      : toneKey === "danger"
      ? "shadow-[0_0_10px_rgba(255,92,92,0.15)]"
      : toneKey === "warn"
      ? "shadow-[0_0_10px_rgba(255,176,32,0.15)]"
      : toneKey === "info"
      ? "shadow-[0_0_10px_rgba(78,161,255,0.15)]"
      : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
        TONE[toneKey],
        glow,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            toneKey === "accent"
              ? "bg-accent shadow-[0_0_6px_rgba(0,217,160,0.8)]"
              : toneKey === "danger"
              ? "bg-danger"
              : toneKey === "warn"
              ? "bg-warning"
              : toneKey === "info"
              ? "bg-info"
              : "bg-text-muted"
          )}
        />
      )}
      {children}
    </span>
  );
}

export function CopyBadge({
  text,
  label,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard write failed
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface/60 px-2 py-0.5 font-mono text-xs text-text transition-all hover:border-accent/40 hover:bg-surface hover:text-accent select-all",
        className
      )}
    >
      <span className="truncate">{label ?? text}</span>
      {copied ? (
        <Check size={12} weight="bold" className="shrink-0 text-accent" />
      ) : (
        <Copy size={12} className="shrink-0 text-text-muted group-hover:text-accent transition-colors opacity-70" />
      )}
    </button>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "accent",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm transition-all duration-200 hover:border-border-hover hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        {icon && <div className="text-text-muted/60 shrink-0">{icon}</div>}
      </div>
      <div
        className={cn(
          "mt-3 font-mono text-3xl font-bold tracking-tight tabular-nums",
          tone === "accent" ? "text-text" : tone === "danger" ? "text-danger" : tone === "warn" ? "text-warning" : tone === "info" ? "text-info" : "text-text"
        )}
      >
        {value}
      </div>
      {hint && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide",
            tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger" : tone === "warn" ? "text-warning" : "text-text-muted"
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function PageHead({
  title,
  sub,
  actions,
  badge,
}: {
  title: React.ReactNode;
  sub?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/50 pb-6 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">{title}</h1>
          {badge}
        </div>
        {sub && <p className="mt-2 max-w-3xl text-sm text-text-muted leading-relaxed">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Bar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "warn" | "danger" }) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-border/60 shadow-inner">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "danger"
            ? "bg-danger shadow-[0_0_10px_rgba(255,92,92,0.4)]"
            : tone === "warn"
            ? "bg-warning shadow-[0_0_10px_rgba(255,176,32,0.4)]"
            : "bg-accent shadow-[0_0_10px_rgba(0,217,160,0.4)]"
        )}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

export function Meter({ label, pct, totalText }: { label: string; pct: number; totalText?: string }) {
  const tone = pct >= 85 ? "danger" : pct >= 70 ? "warn" : "accent";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-text-muted font-medium">
        <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
        <span className="font-mono tabular-nums text-text">
          {Math.round(pct)}% {totalText && <span className="text-text-muted text-[10px]">({totalText})</span>}
        </span>
      </div>
      <Bar pct={pct} tone={tone} />
    </div>
  );
}

/** Responsive table: real <table> on md+ with horizontal overflow scrolling, stacked cards below. */
export function RTable({
  head,
  colSizes,
  rows,
}: {
  head: string[];
  colSizes?: string[];
  rows: Array<Array<{ v?: React.ReactNode; label?: string }>>;
}) {
  return (
    <>
      <div className="hidden w-full overflow-x-auto rounded-xl border border-border/70 bg-surface/30 shadow-sm md:block">
        <table className="w-full text-left text-sm min-w-full">
          <thead className="border-b border-border/70 bg-surface/50 whitespace-nowrap">
            <tr>
              {head.map((h, i) => (
                <th
                  key={h}
                  className="px-5 py-3.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted"
                  style={colSizes?.[i] ? { width: colSizes[i] } : undefined}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-bg/30">
            {rows.map((r, ri) => (
              <tr key={ri} className="align-middle transition-colors hover:bg-surface-hover/60 group">
                {r.map((c, ci) => (
                  <td key={ci} className="px-5 py-3.5 text-text">
                    {c.v ?? c.label}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {rows.map((r, ri) => (
          <div key={ri} className="rounded-xl border border-border/70 bg-surface/40 p-4 shadow-sm space-y-2.5">
            {r.map((c, ci) => (
              <div key={ci} className="flex items-start justify-between gap-3 text-sm min-w-0">
                <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted pt-0.5">
                  {head[ci]}
                </span>
                <div className="min-w-0 flex-1 text-right text-text break-words font-medium">{c.v ?? c.label}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-surface/30 shadow-sm animate-pulse">
      <div className="border-b border-border/70 bg-surface/50 px-5 py-3.5 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3.5 bg-border/60 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-border/40 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/70 bg-surface/30 p-6 space-y-3 animate-pulse">
          <div className="h-3 w-24 bg-border/60 rounded" />
          <div className="h-8 w-32 bg-border/80 rounded" />
          <div className="h-3 w-16 bg-border/40 rounded" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/20 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-text-muted/60">{icon}</div>}
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-muted leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
        {hint && <span className="font-mono text-[10px] text-text-muted/70">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-border/70 bg-surface/60 px-3.5 py-2 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-sans";
export const selectCls =
  "w-full rounded-md border border-border/70 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all cursor-pointer font-sans";
export const btnCls = "press inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary = cn(btnCls, "bg-accent font-bold text-accent-fg hover:bg-accent-hover shadow-[0_0_15px_rgba(0,217,160,0.25)] active:scale-[0.98]");
export const btnGhost = cn(btnCls, "border border-border/70 bg-surface/40 font-semibold text-text hover:border-border-hover hover:bg-surface active:scale-[0.98]");
export const btnDanger = cn(btnCls, "border border-danger/50 bg-danger/10 font-bold text-danger hover:border-danger hover:bg-danger/20 shadow-[0_0_15px_rgba(255,92,92,0.15)] active:scale-[0.98]");
