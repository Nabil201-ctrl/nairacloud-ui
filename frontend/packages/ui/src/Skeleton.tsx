import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-surface-hover rounded", className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className, lines = 3, ...props }: { className?: string; lines?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4, ...props }: { rows?: number; columns?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-3" {...props}>
      <div className="flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {[...Array(columns)].map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-3 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 5, ...props }: { items?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-3" {...props}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ items = 6, cols = { base: 1, sm: 2, lg: 3 }, ...props }: {
  items?: number;
  cols?: { base: number; sm?: number; lg?: number };
} & HTMLAttributes<HTMLDivElement>) {
  const colClasses = [
    `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("grid gap-3", colClasses)} {...props}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="elev-1">
          <CardSkeleton className="p-4" lines={4} />
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton({ items = 4, ...props }: { items?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" {...props}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="elev-1 p-4 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          {i >= 2 && <Skeleton className="h-3 w-1/4" />}
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({ ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-4" {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}

export function EmptyStateSkeleton({ ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="elev-1 p-8 text-center space-y-4" {...props}>
      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <Skeleton className="h-10 w-40 mx-auto" />
    </div>
  );
}
