import type { ReactNode } from "react";
import { cn } from "@nairacloud/ui";

export function DashCard({
  children,
  className,
  padding = true,
  variant = "card",
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: "card" | "surface";
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border-faint transition-colors duration-150 hover:border-border",
        variant === "card" ? "bg-card" : "bg-surface",
        padding && "p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ChartCard({
  title,
  metric,
  controls,
  children,
  className,
}: {
  title: string;
  metric?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DashCard className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[13px] font-medium text-text-secondary">{title}</p>
          {metric != null ? <div className="text-[22px] font-medium tracking-tight text-white">{metric}</div> : null}
        </div>
        {controls ? <div className="shrink-0">{controls}</div> : null}
      </div>
      {children}
    </DashCard>
  );
}
