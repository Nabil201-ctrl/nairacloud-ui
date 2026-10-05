"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@nairacloud/ui";

export type ChartPoint = { label: string; value: number };

export function SmoothLineChart({
  data,
  height = 180,
  color = "var(--accent)",
  className,
  valueFormatter,
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  className?: string;
  valueFormatter?: (v: number) => string;
}) {
  const empty = data.length === 0 || data.every((d) => d.value === 0);

  const chartData = useMemo(() => data.map((d) => ({ ...d })), [data]);

  if (empty) {
    return (
      <div
        className={cn("flex items-center justify-center text-[12px] text-text-muted", className)}
        style={{ height }}
      >
        No samples in this range yet.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--text-axis)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "var(--text-axis)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text)",
              fontSize: 12,
              boxShadow: "none",
            }}
            labelFormatter={() => ""}
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value ?? 0);
              return [valueFormatter ? valueFormatter(n) : String(n), ""];
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Optional filled variant kept available but Usage uses stroke-only. */
export function SmoothAreaChart({
  data,
  height = 180,
  color = "var(--accent)",
  className,
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  className?: string;
}) {
  const empty = data.length === 0;
  if (empty) {
    return (
      <div className={cn("flex items-center justify-center text-[12px] text-text-muted", className)} style={{ height }}>
        No samples in this range yet.
      </div>
    );
  }
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--text-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-axis)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text)",
              fontSize: 12,
              boxShadow: "none",
            }}
            labelFormatter={() => ""}
            formatter={(value) => [String(value ?? 0), ""]}
          />
          <Area type="monotone" dataKey="value" stroke={color} fill="transparent" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
