import * as React from "react";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        animate-pulse rounded-md bg-border/50
        ${className ?? ""}
      `}
      {...props}
    />
  );
}

export function CardSkeleton({
  className,
  lines = 3,
  ...props
}: { className?: string; lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        rounded-xl border border-border/70 bg-surface/30 p-5 space-y-3 animate-pulse
        ${className ?? ""}
      `}
      {...props}
    >
      <div className="h-6 w-1/4 bg-border/60 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-border/40 rounded w-full" />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  ...props
}: { rows?: number; columns?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-surface/30 shadow-sm animate-pulse" {...props}>
      <div className="border-b border-border/70 bg-surface/50 px-5 py-3.5 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 bg-border/60 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-border/40 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({
  items = 5,
  ...props
}: { items?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-3 animate-pulse" {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-surface/30 p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-md bg-border/60" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-border/60 rounded" />
            <div className="h-3 w-1/4 bg-border/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({
  items = 6,
  cols = { base: 1, sm: 2, lg: 3 },
  ...props
}: {
  items?: number;
  cols?: { base?: number; sm?: number; lg?: number };
} & React.HTMLAttributes<HTMLDivElement>) {
  const colClasses = [
    `grid-cols-${cols.base ?? 1}`,
    cols.sm ? `sm:grid-cols-${cols.sm}` : null,
    cols.lg ? `lg:grid-cols-${cols.lg}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid gap-4 ${colClasses} animate-pulse`} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/70 bg-surface/30 p-5 space-y-3"
        >
          <div className="h-6 w-1/4 bg-border/60 rounded" />
          <div className="h-8 w-1/2 bg-border/80 rounded" />
          <div className="h-3 w-1/3 bg-border/40 rounded" />
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton({
  items = 4,
  ...props
}: { items?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse" {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/70 bg-surface/30 p-6 space-y-3">
          <div className="h-3 w-24 bg-border/60 rounded" />
          <div className="h-8 w-32 bg-border/80 rounded" />
          <div className="h-3 w-16 bg-border/40 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-pulse" {...props}>
      <div className="space-y-2">
        <div className="h-6 w-48 bg-border/60 rounded" />
        <div className="h-4 w-64 bg-border/40 rounded" />
      </div>
      <div className="h-10 w-32 bg-border/60 rounded" />
    </div>
  );
}

export function EmptyStateSkeleton({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/20 px-6 py-14 text-center animate-pulse" {...props}>
      <div className="mb-4 h-12 w-12 rounded-full bg-border/60" />
      <div className="h-4 w-48 bg-border/60 rounded" />
      <div className="mt-2 h-3 w-64 bg-border/40 rounded" />
      <div className="mt-5 h-10 w-28 bg-border/60 rounded" />
    </div>
  );
}