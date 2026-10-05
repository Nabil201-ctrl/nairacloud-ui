"use client";

import { LockSimple } from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";

export type SegmentOption<T extends string = string> = {
  value: T;
  label: string;
  locked?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  accentActive = false,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  accentActive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border border-border-segment bg-segment p-0.5",
        size === "sm" ? "h-[30px]" : "h-[34px]",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={opt.locked}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-full items-center justify-center gap-1 rounded-[5px] px-2.5 text-[12px] transition-colors duration-150",
              active
                ? accentActive
                  ? "bg-segment-active text-white"
                  : "bg-control-active text-white"
                : "text-text-muted hover:text-text-hover",
              opt.locked && "cursor-not-allowed opacity-50",
            )}
          >
            {opt.locked ? <LockSimple size={11} weight="fill" className="text-text-disabled" aria-hidden /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TimeRangePicker({
  value,
  onChange,
  className,
}: {
  value: "24h" | "7d" | "30d";
  onChange: (value: "24h" | "7d" | "30d") => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-[34px] items-center rounded-sm border border-border-control bg-control p-0.5",
        className,
      )}
      role="tablist"
      aria-label="Time range"
    >
      {(
        [
          { value: "24h", label: "24H" },
          { value: "7d", label: "7D" },
          { value: "30d", label: "30D" },
        ] as const
      ).map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-full items-center justify-center rounded-[5px] px-2.5 text-[12px] transition-colors duration-150",
              active ? "bg-control-active text-white" : "text-text-disabled hover:text-text-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
