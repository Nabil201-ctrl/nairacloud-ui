"use client";

import { useEffect, useState } from "react";
import { ChartBar, Cpu, HardDrives, ArrowsClockwise } from "@phosphor-icons/react";
import { PageHead, Meter, StatCard, TableSkeleton, btnGhost } from "@/components/ui";
import { api } from "@/lib/api";

type Node = {
  id: string;
  name: string;
  status: string;
  totalCpu: number;
  totalRamMb: number;
  allocatedCpu: number;
  allocatedRamMb: number;
  allocatedStorageGb?: number;
  totalStorageGb?: number;
  lastHeartbeatMeta?: { cpuPct?: number; ramUsedMb?: number; instanceCount?: number } | null;
  instanceCount?: number;
  _count?: { instances?: number };
};

type ChartPoint = { label: string; cpuAlloc: number; ramAlloc: number; instances: number };

function capacityPct(nodes: Node[]): number | null {
  const total = nodes.reduce((a, n) => a + (n.totalRamMb ?? 0), 0);
  const allocated = nodes.reduce((a, n) => a + (n.allocatedRamMb ?? 0), 0);
  if (total <= 0) return null;
  return Math.round((allocated / total) * 100);
}

function nodeRamPct(n: Node): number | null {
  if (!n.totalRamMb || n.totalRamMb <= 0) return null;
  if (n.lastHeartbeatMeta?.ramUsedMb != null) {
    return Math.round((n.lastHeartbeatMeta.ramUsedMb / n.totalRamMb) * 100);
  }
  return Math.round(((n.allocatedRamMb ?? 0) / n.totalRamMb) * 100);
}

function nodeCpuPct(n: Node): number | null {
  if (n.lastHeartbeatMeta?.cpuPct != null) return Math.round(n.lastHeartbeatMeta.cpuPct);
  if (!n.totalCpu || n.totalCpu <= 0) return null;
  return Math.round(((n.allocatedCpu ?? 0) / n.totalCpu) * 100);
}

function normalizeSamples(samples: unknown): ChartPoint[] {
  if (!Array.isArray(samples) || samples.length === 0) return [];
  return samples.map((s, i) => {
    const row = s as Record<string, unknown>;
    const label =
      (typeof row.month === "string" && row.month) ||
      (typeof row.periodStart === "string" &&
        new Date(row.periodStart).toLocaleDateString("en-NG", { month: "short", day: "numeric" })) ||
      (typeof row.label === "string" && row.label) ||
      `#${i + 1}`;
    const cpuAlloc = Number(row.cpuAlloc ?? row.avgCpuPct ?? row.cpuPct ?? 0);
    const ramAlloc = Number(row.ramAlloc ?? row.avgRamMb ?? row.ramPct ?? 0);
    const instances = Number(row.instances ?? row.samples ?? 0);
    return { label, cpuAlloc: Math.max(0, Math.min(100, Math.round(cpuAlloc))), ramAlloc, instances };
  });
}

export default function UsagePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [sampleCount, setSampleCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [nodeData, usage] = await Promise.all([
        api().get("/v1/admin/nodes") as Promise<Node[]>,
        api().get("/v1/admin/usage/aggregate") as Promise<{ samples: unknown }>,
      ]);
      setNodes(nodeData ?? []);
      if (typeof usage?.samples === "number") {
        setSampleCount(usage.samples);
      } else if (Array.isArray(usage?.samples)) {
        setPoints(normalizeSamples(usage.samples));
        setSampleCount(usage.samples.length);
      }
    } catch (err) {
      console.error("Failed to load usage metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const capPct = capacityPct(nodes);
  const totalRam = nodes.reduce((a, n) => a + (n.totalRamMb ?? 0), 0);
  const memoryVals = nodes.map(nodeRamPct).filter((v): v is number => v != null);
  const memory = memoryVals.length ? memoryVals.reduce((a, v) => a + v, 0) / memoryVals.length : null;

  return (
    <div className="space-y-8">
      <PageHead
        title="Fleet Usage & Saturation"
        sub="Cluster-wide physical memory allocation and hardware capacity trends across all nodes."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadData();
            }}
            className={btnGhost}
          >
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Metrics</span>
          </button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Cluster Saturation"
          value={capPct == null ? "—" : `${capPct}%`}
          hint={<span>AGGREGATE ALLOCATION</span>}
          tone={capPct != null && capPct >= 80 ? "danger" : capPct != null && capPct >= 70 ? "warn" : "accent"}
          icon={<Cpu size={20} />}
        />
        <StatCard
          label="Physical Hosts"
          value={`${nodes.length}`}
          hint={<span>ACTIVE REGISTRATION</span>}
          tone="info"
          icon={<HardDrives size={20} />}
        />
        <StatCard
          label="Telemetry Samples"
          value={sampleCount.toLocaleString()}
          hint={<span>RECORDED DATA POINTS</span>}
          tone="accent"
          icon={<ChartBar size={20} />}
        />
      </div>

      {/* Cluster Capacity Bar */}
      <section
        aria-label="Capacity"
        className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/50 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-text">Fleet Capacity Allocation vs Total</h2>
            <p className="text-xs text-text-muted mt-0.5">Physical host RAM committed to customer workloads</p>
          </div>
          <p className="font-mono text-sm font-bold text-accent tabular-nums">
            {capPct == null ? "—" : `${capPct}% committed`}
          </p>
        </div>

        {capPct == null ? (
          <p className="text-sm text-text-muted py-4">Capacity telemetry not yet reported.</p>
        ) : (
          <div className="space-y-4">
            <div aria-hidden className="flex h-3 w-full overflow-hidden rounded-full bg-border/60 shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${
                  capPct >= 85 ? "bg-danger" : capPct >= 75 ? "bg-warning" : "bg-accent"
                }`}
                style={{ width: `${capPct}%` }}
                title="Allocated RAM"
              />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${
                    capPct >= 85 ? "bg-danger" : capPct >= 75 ? "bg-warning" : "bg-accent"
                  }`}
                />
                <span>Allocated ({capPct}%)</span>
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 rounded-full bg-text-muted/40" />
                <span>Available Headroom ({Math.max(0, 100 - capPct)}%)</span>
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Combined RAM pressure is <span className="font-mono font-bold text-text">{memory == null ? "—" : `${Math.round(memory)}%`}</span>.{" "}
              {memory == null
                ? ""
                : memory >= 75
                ? "Review memory headroom on hot nodes to avoid overcommit paging."
                : "Comfortable headroom for the current tenant mix."}
            </p>
          </div>
        )}
      </section>

      {/* Per Node Hardware Status */}
      <section aria-label="Per-node metrics" className="space-y-4">
        <h2 className="text-base font-bold text-text">Per-Node Saturation</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {nodes.map((n) => {
            const ram = nodeRamPct(n);
            const cpu = nodeCpuPct(n);
            const count = n.lastHeartbeatMeta?.instanceCount ?? n.instanceCount ?? n._count?.instances ?? 0;

            return (
              <div
                key={n.id}
                className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="font-mono text-sm font-bold text-text">{n.name}</span>
                  <span className="font-mono text-xs text-text-muted">{count} instances allocated</span>
                </div>

                <div className="space-y-3">
                  <Meter
                    label="CPU ALLOCATION"
                    pct={cpu ?? 0}
                    totalText={`${n.allocatedCpu ?? 0} / ${n.totalCpu ?? "—"} vCPU`}
                  />
                  <Meter
                    label="RAM ALLOCATION"
                    pct={ram ?? 0}
                    totalText={`${n.allocatedRamMb ?? 0} / ${n.totalRamMb ?? "—"} MB`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
