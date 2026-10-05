"use client";

import { useEffect, useMemo, useState } from "react";
import { PriceTag, StatusDot, GridSkeleton } from "@nairacloud/ui";
import { api } from "@/lib/api";
import {
  ChartCard,
  DashCard,
  LiveAudience,
  PageHeader,
  SegmentedControl,
  SegmentedRing,
  SmoothLineChart,
  TimeRangePicker,
  type ChartPoint,
} from "@/components/dashboard";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: string;
};

type UsageRollup = {
  id: string;
  instanceId: string;
  period: string;
  periodStart: string;
  avgCpuPct: number;
  avgRamMb: number;
  avgDiskGb: number;
  avgNetworkMb: number;
  samples: number;
};

type UsageSummary = {
  instanceCount: number;
  last24h: {
    instanceId: string;
    _avg: {
      cpuPct: number | null;
      ramMb: number | null;
      diskGb: number | null;
      networkMb: number | null;
    };
  }[];
  instances: { id: string; hostname: string; plan: string; status: string }[];
};

type Range = "24h" | "7d" | "30d";
type ChartTab = "cpu" | "ram" | "network";

function planNameOf(plan: unknown): string {
  if (typeof plan === "string") return plan;
  if (plan && typeof plan === "object" && "name" in plan && typeof (plan as { name: unknown }).name === "string") {
    return (plan as { name: string }).name;
  }
  return "";
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const parts = key.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  return new Date(y, m - 1, 1).toLocaleString("en-NG", { month: "short" });
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function isRunning(status: string): boolean {
  const s = status.toUpperCase();
  return s === "RUNNING" || s === "ACTIVE";
}

export default function UsagePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [history, setHistory] = useState<UsageRollup[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("24h");
  const [chartTab, setChartTab] = useState<ChartTab>("network");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pl, sum, hist] = await Promise.all([
          api().get("/v1/plans") as Promise<Plan[]>,
          api().get("/v1/usage/summary") as Promise<UsageSummary>,
          api().get("/v1/usage/history?months=2") as Promise<UsageRollup[]>,
        ]);
        setPlans(pl ?? []);
        setSummary(sum ?? null);
        setHistory(Array.isArray(hist) ? hist : []);
      } catch (err) {
        console.error("Failed to load usage", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const matchPlan = (name: string) =>
    plans.find((p) => p.name === name || p.slug === name.toLowerCase() || p.name.toLowerCase() === name.toLowerCase());

  const instances = summary?.instances ?? [];
  const liveCount = instances.filter((i) => isRunning(i.status)).length;

  const last24hAvgs = useMemo(() => {
    const rows = summary?.last24h ?? [];
    return {
      cpu: avg(rows.map((r) => r._avg?.cpuPct ?? 0)),
      ram: avg(rows.map((r) => r._avg?.ramMb ?? 0)),
      disk: avg(rows.map((r) => r._avg?.diskGb ?? 0)),
      network: avg(rows.map((r) => r._avg?.networkMb ?? 0)),
    };
  }, [summary]);

  const totalStorageGb = useMemo(() => {
    return instances.reduce((sum, i) => {
      const planLabel = planNameOf(i.plan) || i.plan;
      return sum + (matchPlan(planLabel)?.storageGb ?? 0);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, plans]);

  const storagePct = totalStorageGb > 0 ? Math.min(100, (last24hAvgs.disk / totalStorageGb) * 100) : 0;

  const rangeStart = useMemo(() => {
    const now = Date.now();
    if (range === "24h") return now - 24 * 3600 * 1000;
    if (range === "7d") return now - 7 * 24 * 3600 * 1000;
    return now - 30 * 24 * 3600 * 1000;
  }, [range]);

  const filteredHistory = useMemo(
    () => history.filter((r) => new Date(r.periodStart).getTime() >= rangeStart),
    [history, rangeStart],
  );

  const seriesByDay = useMemo(() => {
    const buckets = new Map<string, { cpu: number[]; ram: number[]; disk: number[]; network: number[] }>();
    for (const row of filteredHistory) {
      const key = row.periodStart.slice(0, 10);
      const b = buckets.get(key) ?? { cpu: [], ram: [], disk: [], network: [] };
      b.cpu.push(row.avgCpuPct);
      b.ram.push(row.avgRamMb);
      b.disk.push(row.avgDiskGb);
      b.network.push(row.avgNetworkMb);
      buckets.set(key, b);
    }
    const keys = [...buckets.keys()].sort();
    const toPoints = (sel: (b: { cpu: number[]; ram: number[]; disk: number[]; network: number[] }) => number[]): ChartPoint[] =>
      keys.map((k) => ({ label: formatDay(k), value: Math.round(avg(sel(buckets.get(k)!)) * 10) / 10 }));

    return {
      cpu: toPoints((b) => b.cpu),
      ram: toPoints((b) => b.ram),
      disk: toPoints((b) => b.disk),
      network: toPoints((b) => b.network),
    };
  }, [filteredHistory]);

  const chartSeries = chartTab === "cpu" ? seriesByDay.cpu : chartTab === "ram" ? seriesByDay.ram : seriesByDay.network;
  const chartMetric =
    chartSeries.length > 0
      ? Math.round(avg(chartSeries.map((p) => p.value)) * 10) / 10
      : range === "24h"
        ? Math.round(
            (chartTab === "cpu" ? last24hAvgs.cpu : chartTab === "ram" ? last24hAvgs.ram : last24hAvgs.network) * 10,
          ) / 10
        : 0;

  const chartUnit = chartTab === "cpu" ? "%" : chartTab === "ram" ? " MB" : " MB";

  const instancePlanPrice = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of instances) {
      const planLabel = planNameOf(i.plan) || i.plan;
      map.set(i.id, matchPlan(planLabel)?.priceNgn ?? 0);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, plans]);

  const monthBars = useMemo(() => {
    const now = new Date();
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(monthKey(d));
    }

    const byMonth = new Map<string, Set<string>>();
    for (const key of keys) byMonth.set(key, new Set());

    for (const row of history) {
      const key = monthKey(new Date(row.periodStart));
      if (!byMonth.has(key)) continue;
      byMonth.get(key)!.add(row.instanceId);
    }

    return keys.map((key) => {
      const ids = byMonth.get(key) ?? new Set();
      let spend = 0;
      for (const id of ids) spend += instancePlanPrice.get(id) ?? 0;
      if (spend === 0 && key === monthKey(now) && instances.length > 0) {
        spend = instances.reduce((s, i) => s + (instancePlanPrice.get(i.id) ?? 0), 0);
      }
      return { key, label: monthLabel(key), spend, hasData: ids.size > 0 || (key === monthKey(now) && spend > 0) };
    });
  }, [history, instancePlanPrice, instances]);

  const maxSpend = Math.max(...monthBars.map((b) => b.spend), 1);

  const avgCpuById = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of summary?.last24h ?? []) {
      map.set(row.instanceId, row._avg?.cpuPct ?? 0);
    }
    return map;
  }, [summary]);

  const rows = instances.map((i) => {
    const planLabel = planNameOf(i.plan) || i.plan;
    const p = matchPlan(planLabel);
    return {
      id: i.id,
      hostname: i.hostname,
      plan: planLabel,
      cpu: p?.cpu ?? 0,
      ramMb: p?.ramMb ?? 0,
      cost: p?.priceNgn ?? 0,
      status: i.status,
      cpuNow: Math.round(avgCpuById.get(i.id) ?? 0),
    };
  });

  const totalMonthly = rows.reduce((s, r) => s + r.cost, 0);
  const hasHistorySpend = monthBars.some((b) => b.spend > 0);

  const instanceRingMax = Math.max(instances.length, liveCount, 1);
  const instanceRingValue = liveCount;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Usage"
        description="Instances, CPU, storage, and network usage across your account."
        actions={<TimeRangePicker value={range} onChange={setRange} />}
      />

      {/* Metric rings */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashCard variant="surface" className="flex flex-col items-center py-5">
          <SegmentedRing
            value={instanceRingValue}
            max={instanceRingMax}
            label={`${liveCount}`}
            sublabel="Instances"
          />
          <p className="mt-1 text-[12px] text-text-muted">
            {liveCount} of {instances.length || 0} running
          </p>
        </DashCard>

        <DashCard variant="surface" className="flex flex-col items-center py-5">
          <SegmentedRing value={last24hAvgs.cpu} max={100} label={`${Math.round(last24hAvgs.cpu)}%`} sublabel="CPU" />
          <p className="mt-1 text-[12px] text-text-muted">{range.toUpperCase()} average</p>
        </DashCard>

        <DashCard variant="surface" className="flex flex-col items-center py-5">
          <SegmentedRing
            value={storagePct}
            max={100}
            label={totalStorageGb > 0 ? `${Math.round(last24hAvgs.disk)}` : `${Math.round(storagePct)}%`}
            sublabel="Storage"
          />
          <p className="mt-1 text-[12px] text-text-muted">
            {totalStorageGb > 0
              ? `${Math.round(last24hAvgs.disk)} of ${totalStorageGb} GB`
              : loading
                ? "Loading…"
                : "No capacity data"}
          </p>
        </DashCard>

        <DashCard variant="surface" className="flex flex-col items-center py-5">
          <SegmentedRing
            value={Math.min(100, last24hAvgs.network)}
            max={100}
            label={`${Math.round(last24hAvgs.network)}`}
            sublabel="Network"
          />
          <p className="mt-1 text-[12px] text-text-muted">MB · 24h average</p>
        </DashCard>
      </div>

      {/* Charts + live */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title={chartTab === "cpu" ? "CPU" : chartTab === "ram" ? "Memory" : "Network traffic"}
          metric={
            <>
              {chartMetric}
              <span className="ml-1 text-[13px] font-normal text-text-muted">{chartUnit.trim()}</span>
            </>
          }
          controls={
            <SegmentedControl
              size="sm"
              accentActive
              value={chartTab}
              onChange={setChartTab}
              options={[
                { value: "network", label: "Network" },
                { value: "cpu", label: "CPU" },
                { value: "ram", label: "RAM" },
              ]}
            />
          }
        >
          <SmoothLineChart
            data={
              range === "24h" && chartSeries.length === 0
                ? [
                    {
                      label: "24h",
                      value:
                        chartTab === "cpu"
                          ? last24hAvgs.cpu
                          : chartTab === "ram"
                            ? last24hAvgs.ram
                            : last24hAvgs.network,
                    },
                  ].filter((p) => p.value > 0)
                : chartSeries
            }
            valueFormatter={(v) => `${v}${chartUnit}`}
          />
        </ChartCard>

        <ChartCard title="Live instances" metric={liveCount}>
          <LiveAudience liveCount={liveCount} />
        </ChartCard>
      </div>

      {/* Spend + per-instance */}
      <div className="grid gap-4 lg:grid-cols-5">
        <DashCard className="lg:col-span-2">
          <h2 className="text-[14px] font-medium text-text-secondary">Spend · last 6 months</h2>
          <div className="mt-5 flex h-40 items-end gap-2">
            {loading ? (
              <p className="text-[12px] text-text-muted">Loading spend history…</p>
            ) : !hasHistorySpend ? (
              <p className="text-[12px] text-text-muted">No spend data yet.</p>
            ) : (
              monthBars.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-sm bg-accent/80"
                      style={{
                        height: `${Math.max(m.spend > 0 ? 8 : 0, (m.spend / maxSpend) * 100)}%`,
                        opacity: 0.55 + (m.spend / maxSpend) * 0.45,
                      }}
                      title={`₦${m.spend.toLocaleString("en-NG")} — ${m.label}`}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-text-muted">{m.label}</span>
                </div>
              ))
            )}
          </div>
          <p className="mt-4 text-[12px] text-text-muted">
            Total monthly cost <PriceTag amount={totalMonthly} />
          </p>
        </DashCard>

        <DashCard padding={false} className="overflow-hidden lg:col-span-3">
          <div className="border-b border-border-subtle px-4 py-3">
            <h2 className="text-[14px] font-medium text-white">Per instance</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 p-3">
            {rows.map((r) => (
              <div key={r.id} className="elev-1 transition-colors hover:border-border hover:bg-surface-hover/30">
                <DashCard className="p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-white">{r.hostname}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-text-muted">
                        <StatusDot status={r.status as "Running" | "Stopped" | "Error" | "Suspended" | "Creating" | "Paused"} />
                        {r.cpuNow}% CPU
                      </p>
                      <p className="mt-1 font-mono text-[12px] text-text-secondary">{r.plan}</p>
                      <p className="mt-1 font-mono text-[12px] text-text-muted">
                        {r.cpu} vCore · {r.ramMb / 1024}GB
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <PriceTag amount={r.cost} />
                    </div>
                  </div>
                </DashCard>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="col-span-full text-center py-8 text-[13px] text-text-muted">
                {loading ? "Loading…" : "No instances deployed."}
              </div>
            )}
          </div>
        </DashCard>
      </div>
    </section>
  );
}
