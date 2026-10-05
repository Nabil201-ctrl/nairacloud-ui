"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Cloud,
  Coins,
  Cpu,
  HardDrives,
  WarningOctagon,
  ArrowRight,
  ArrowClockwise,
  Plus,
  ShieldCheck,
  CheckCircle,
  Hourglass,
  Package,
} from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, StatCard, StatSkeleton, LivePulse, CopyBadge, btnPrimary, btnGhost } from "@/components/ui";
import { api } from "@/lib/api";

type OverviewNode = {
  id: string;
  name: string;
  status: string;
  allocatedRamMb?: number;
  totalRamMb?: number;
  usedRamMb?: number;
  ip?: string;
  region?: string;
};

type Incident = {
  id: string;
  title: string;
  status: string;
  component: string;
  severity?: "low" | "medium" | "high";
  message?: string;
  summary?: string;
  createdAt?: string;
  startedAt?: string;
  updatedAt?: string;
};

function capacityPct(nodes: OverviewNode[]): number | null {
  const total = nodes.reduce((a, n) => a + (n.totalRamMb ?? 0), 0);
  const allocated = nodes.reduce((a, n) => a + (n.allocatedRamMb ?? 0), 0);
  if (total <= 0) return null;
  return Math.round((allocated / total) * 100);
}

function nodeRamPct(n: OverviewNode): number | null {
  if (!n.totalRamMb || n.totalRamMb <= 0) return null;
  const used = n.usedRamMb ?? n.allocatedRamMb ?? 0;
  return Math.round((used / n.totalRamMb) * 100);
}

export default function OverviewPage() {
  const [nodes, setNodes] = useState<OverviewNode[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalInstances, setTotalInstances] = useState(0);
  const [runningInstances, setRunningInstances] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [revenue24hNgn, setRevenue24hNgn] = useState(0);
  const [payments24h, setPayments24h] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [overview, inc] = await Promise.all([
        api().get("/v1/admin/overview") as Promise<{
          users: number;
          instances: number;
          running: number;
          pendingOrders: number;
          nodes: OverviewNode[];
          revenue24hNgn: number;
          payments24h: number;
        }>,
        api().get("/v1/admin/incidents") as Promise<Incident[]>,
      ]);

      setNodes(overview.nodes ?? []);
      setTotalCustomers(overview.users ?? 0);
      setTotalInstances(overview.instances ?? 0);
      setRunningInstances(overview.running ?? 0);
      setPendingOrders(overview.pendingOrders ?? 0);
      setRevenue24hNgn(overview.revenue24hNgn ?? 0);
      setPayments24h(overview.payments24h ?? 0);
      setIncidents(inc ?? []);
    } catch (err) {
      console.error("Failed to load overview metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const capPct = capacityPct(nodes);

  // Active alerts from offline/degraded nodes and non-resolved incidents
  const alerts: { tone: "danger" | "warn"; title: string; at: string; href: string; body: string }[] = [
    ...nodes
      .filter((n) => n.status !== "ONLINE")
      .map((n) => {
        const ram = nodeRamPct(n);
        return {
          tone: (n.status === "OFFLINE" ? "danger" : "warn") as "danger" | "warn",
          title: `Node ${n.name} is ${n.status.toLowerCase()}`,
          at: "",
          href: `/nodes/${n.id}`,
          body:
            ram == null
              ? `Host reported status ${n.status}. No capacity telemetry available.`
              : `RAM allocated at ${ram}% (${n.allocatedRamMb ?? 0} / ${n.totalRamMb} MB).`,
        };
      }),
    ...incidents
      .filter((i) => i.status.toLowerCase() !== "resolved")
      .map((i) => ({
        tone: (i.severity === "high" ? "danger" : "warn") as "danger" | "warn",
        title: `[${i.component.toUpperCase()}] ${i.title}`,
        at: i.updatedAt ?? i.startedAt ?? "",
        href: "/incidents",
        body: i.summary ?? i.message ?? "Active operational incident under investigation.",
      })),
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Heading */}
      <PageHead
        title="Command Center"
        sub="Global control plane for NairaCloud infrastructure. 100% data sovereignty."
        badge={
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] font-bold text-accent">
            <LivePulse status="ONLINE" />
            <span>ALL SYSTEMS ONLINE</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadData();
              }}
              title="Refresh telemetry"
              className={btnGhost}
            >
              <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link href="/instances" className={btnGhost}>
              Fleet View
            </Link>
            <Link href="/nodes" className={btnPrimary}>
              <Plus size={14} weight="bold" />
              <span>Manage Nodes</span>
            </Link>
          </div>
        }
      />

      {/* Pending Orders Banner */}
      {!loading && pendingOrders > 0 && (
        <section
          aria-label="Pending orders"
          className="flex flex-col gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-warning/20 text-warning">
              <Hourglass size={18} weight="bold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                <strong className="text-warning">{pendingOrders}</strong> order{pendingOrders === 1 ? "" : "s"} placed and waiting for capacity
              </p>
              <p className="text-xs text-text-muted">Acknowledgment emails already sent. Provision once a node frees up.</p>
            </div>
          </div>
          <Link href="/orders" className="press flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/5 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/15 transition-colors">
            <Package size={13} weight="bold" />
            <span>Review Orders</span>
          </Link>
        </section>
      )}

      {/* Primary KPI Metrics Strip */}
      {loading ? (
        <StatSkeleton count={4} />
      ) : (
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Customers"
            value={totalCustomers.toLocaleString()}
            hint={
              <span className="text-accent flex items-center gap-1">
                <CheckCircle size={13} weight="fill" />
                <span>ACTIVE USER DIRECTORY</span>
              </span>
            }
            tone="accent"
            icon={<Users size={22} />}
          />

          <StatCard
            label="Active Instances"
            value={`${runningInstances}`}
            hint={
              <span className="text-info flex items-center gap-1 font-mono">
                <Cloud size={13} weight="fill" />
                <span>OUT OF {totalInstances} PROVISIONED</span>
              </span>
            }
            tone="info"
            icon={<Cloud size={22} />}
          />

          <StatCard
            label="24h Gross Revenue"
            value={formatNaira(revenue24hNgn)}
            hint={
              <span className="text-accent flex items-center gap-1 font-mono">
                <Coins size={13} weight="fill" />
                <span>{payments24h} TRANSACTIONS TODAY</span>
              </span>
            }
            tone="accent"
            icon={<Coins size={22} />}
          />

          <StatCard
            label="Fleet RAM Capacity"
            value={capPct == null ? "—" : `${capPct}%`}
            hint={
              <span
                className={
                  capPct != null && capPct >= 85
                    ? "text-danger flex items-center gap-1"
                    : capPct != null && capPct >= 75
                    ? "text-warning flex items-center gap-1"
                    : "text-accent flex items-center gap-1"
                }
              >
                <Cpu size={13} weight="fill" />
                <span>
                  {capPct == null
                    ? "Telemetry Pending"
                    : capPct >= 85
                    ? "Critical Threshold"
                    : capPct >= 75
                    ? "Approaching Limit"
                    : "Optimal Headroom"}
                </span>
              </span>
            }
            tone={capPct != null && capPct >= 85 ? "danger" : capPct != null && capPct >= 75 ? "warn" : "accent"}
            icon={<Cpu size={22} />}
          />
        </section>
      )}

      {/* Main Grid: Alerts on Left, Physical Hardware Nodes on Right */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Live Alerts & Active Incidents */}
        <div className="lg:col-span-2 space-y-6">
          <section
            aria-label="Live alerts"
            className="rounded-xl border border-border/80 bg-surface/30 shadow-sm overflow-hidden backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-border/60 p-5 bg-surface/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/10 text-warning">
                  <WarningOctagon size={16} weight="bold" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text">System Alerts & Incidents</h2>
                  <p className="text-[11px] text-text-muted">Live alarms from compute nodes, webhooks, and provisioning</p>
                </div>
              </div>
              <Link
                href="/incidents"
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                <span>View all incidents</span>
                <ArrowRight size={12} weight="bold" />
              </Link>
            </div>

            <div className="p-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center bg-surface/20">
                  <ShieldCheck size={28} className="mx-auto text-accent mb-2" />
                  <p className="text-sm font-medium text-text">All systems operating within normal parameters.</p>
                  <p className="text-xs text-text-muted mt-1">Zero active anomalies or hardware disruptions detected.</p>
                </div>
              ) : (
                alerts.map((a, i) => (
                  <Link
                    key={i}
                    href={a.href}
                    className="flex items-start gap-4 rounded-lg border border-border/70 bg-surface/50 p-4 transition-all hover:border-border-hover hover:bg-surface"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Pill tone={a.tone} dot>
                        {a.tone === "danger" ? "CRITICAL" : "NOTICE"}
                      </Pill>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text truncate">{a.title}</h3>
                      <p className="mt-1 text-xs text-text-muted leading-relaxed">{a.body}</p>
                      {a.at && (
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-muted/60">
                          {new Date(a.at).toLocaleString("en-NG")}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-text-muted self-center" />
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Quick Operations Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/nodes"
              className="flex items-center justify-between rounded-lg border border-border/70 bg-surface/40 p-4 hover:border-accent/40 hover:bg-surface transition-all group"
            >
              <div>
                <p className="font-semibold text-xs text-text">Inspect Nodes</p>
                <p className="text-[11px] text-text-muted mt-0.5">Slicing & SSH probes</p>
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/transactions"
              className="flex items-center justify-between rounded-lg border border-border/70 bg-surface/40 p-4 hover:border-accent/40 hover:bg-surface transition-all group"
            >
              <div>
                <p className="font-semibold text-xs text-text">Wallet Ledger</p>
                <p className="text-[11px] text-text-muted mt-0.5">Deductions & balances</p>
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/abuse"
              className="flex items-center justify-between rounded-lg border border-border/70 bg-surface/40 p-4 hover:border-accent/40 hover:bg-surface transition-all group"
            >
              <div>
                <p className="font-semibold text-xs text-text">SecOps & Abuse</p>
                <p className="text-[11px] text-text-muted mt-0.5">Automated detection queue</p>
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Right Column: Physical Server Nodes Cluster */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border/80 bg-surface/30 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border/60 p-5 bg-surface/50">
              <div className="flex items-center gap-2">
                <HardDrives size={18} className="text-accent" />
                <h2 className="text-sm font-semibold text-text">Hardware Hosts</h2>
              </div>
              <span className="font-mono text-xs text-text-muted">{nodes.length} registered</span>
            </div>

            <div className="p-5 space-y-3">
              {nodes.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">No physical hosts discovered.</p>
              ) : (
                nodes.map((n) => {
                  const ram = nodeRamPct(n);
                  const isOnline = n.status.toUpperCase() === "ONLINE";

                  return (
                    <Link
                      key={n.id}
                      href={`/nodes/${n.id}`}
                      className="block rounded-lg border border-border/70 bg-surface/50 p-4 transition-all hover:border-border-hover hover:bg-surface"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <LivePulse status={n.status} />
                          <span className="font-mono text-sm font-bold text-text truncate">{n.name}</span>
                        </div>
                        <Pill tone={isOnline ? "accent" : "warn"} dot>
                          {n.status}
                        </Pill>
                      </div>

                      <div className="space-y-2 font-mono text-[11px] text-text-muted">
                        <div className="flex justify-between items-center">
                          <span>RAM Utilization</span>
                          <span className="font-bold text-text">{ram == null ? "—" : `${ram}%`}</span>
                        </div>
                        <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              ram != null && ram >= 85
                                ? "bg-danger"
                                : ram != null && ram >= 70
                                ? "bg-warning"
                                : "bg-accent"
                            }`}
                            style={{ width: `${Math.min(100, ram ?? 0)}%` }}
                          />
                        </div>
                        <div className="flex justify-between pt-1 border-t border-border/40 text-[10px]">
                          <span>Allocated</span>
                          <span className="text-text font-semibold">
                            {n.allocatedRamMb ?? n.usedRamMb ?? 0} / {n.totalRamMb ?? "—"} MB
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="border-t border-border/50 p-3 bg-surface/40 text-center">
              <Link
                href="/nodes"
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Open Nodes Control Hub &rarr;
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
