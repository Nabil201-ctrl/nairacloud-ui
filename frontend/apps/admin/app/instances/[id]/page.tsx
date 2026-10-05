"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Cloud,
  HardDrives,
  User,
  Power,
  Trash,
  ClockCounterClockwise,
  Cpu,
  ArrowsClockwise,
  ArrowLeft,
  Coins,
} from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, Meter, CopyBadge, LivePulse, TableSkeleton, EmptyState, btnGhost, btnPrimary, btnDanger } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@/lib/api";

type Instance = {
  id: string;
  hostname: string;
  userId?: string;
  ownerId?: string;
  nodeId?: string;
  planId?: string;
  ip?: string | null;
  sshPort?: number | null;
  image?: string;
  os?: string;
  status: string;
  providerRef?: string | null;
  errorMessage?: string | null;
  autoRenew?: boolean;
  createdAt: string;
  updatedAt?: string;
  plan?: { id?: string; name?: string; cpu?: number; ramMb?: number; storageGb?: number; priceNgn?: number };
  node?: { id?: string; name?: string; provider?: string; region?: string };
  subscription?: { id?: string; status?: string; nextBillingDate?: string };
  usage?: { cpu: number; ram: number; disk: number };
};

type Customer = { id: string; name: string; email: string };
type AuditLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent?: string;
  timestamp: string;
};

const STATUS_TONE: Record<string, "accent" | "warn" | "danger" | "info" | "muted"> = {
  RUNNING: "accent",
  Running: "accent",
  STOPPED: "muted",
  Stopped: "muted",
  ERROR: "danger",
  Error: "danger",
  SUSPENDED: "warn",
  Suspended: "warn",
  CREATING: "info",
  Creating: "info",
};

export default function InstanceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [inst, setInst] = useState<Instance | null>(null);
  const [owner, setOwner] = useState<Customer | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "logs">("overview");

  // Dialogs
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadData = async () => {
    try {
      const i = (await api().get(`/v1/admin/instances/${params.id}`)) as Instance;
      setInst(i ?? null);
      if (i?.userId || i?.ownerId) {
        const userId = i.userId ?? i.ownerId;
        try {
          const cust = (await api().get(`/v1/admin/customers/${userId}`)) as Customer;
          setOwner(cust ?? null);
        } catch {
          // customer info optional
        }
      }
    } catch (err) {
      console.error("Failed to load instance", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const logData = (await api().get(`/v1/admin/instances/${params.id}/logs`)) as AuditLog[];
      setLogs(Array.isArray(logData) ? logData : []);
    } catch {
      // logs endpoint might be empty
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [params.id]);

  useEffect(() => {
    if (tab === "logs") {
      void loadLogs();
    }
  }, [tab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHead title="Loading instance..." />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="space-y-6">
        <PageHead title="Instance Not Found" />
        <EmptyState
          icon={<Cloud size={36} />}
          title="Virtual machine not found"
          description="The requested instance does not exist or has been permanently destroyed."
          action={
            <Link href="/instances" className={btnPrimary}>
              Back to Fleet
            </Link>
          }
        />
      </div>
    );
  }

  const statusUpper = (inst.status ?? "").toUpperCase();
  const tone = STATUS_TONE[inst.status] ?? "muted";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="space-y-2">
        <Link
          href="/instances"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-text-muted hover:text-accent transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>BACK TO FLEET</span>
        </Link>
        <PageHead
          title={
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold">{inst.hostname}</span>
              <Pill tone={tone} dot>
                {inst.status}
              </Pill>
            </div>
          }
          sub={`Instance ID: ${inst.id} · Created ${new Date(inst.createdAt).toLocaleDateString("en-NG", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {statusUpper === "SUSPENDED" ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api().post(`/v1/admin/instances/${inst.id}/resume`, {});
                      toast.success(`${inst.hostname} resumed`);
                      await loadData();
                    } catch {
                      toast.error("Resume failed");
                    }
                  }}
                  className={btnPrimary}
                >
                  Resume Instance
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSuspendOpen(true)}
                  className="press rounded-md border border-warning/50 bg-warning/10 px-3.5 py-2 text-xs font-bold text-warning hover:bg-warning/20 transition-colors"
                >
                  Suspend
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await api().post(`/v1/instances/${inst.id}/action`, { action: "REBOOT" });
                    toast.success("Reboot command dispatched");
                    await loadData();
                  } catch {
                    toast.error("Reboot failed");
                  }
                }}
                className={btnGhost}
              >
                <Power size={14} weight="bold" />
                <span>Reboot</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="press rounded-md border border-danger/50 bg-danger/10 px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger/20 transition-colors"
              >
                <Trash size={14} weight="bold" />
                <span>Destroy</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-surface/40 p-4 text-xs font-mono">
        {owner && (
          <Link
            href={`/customers/${owner.id}`}
            className="flex items-center gap-1.5 text-accent hover:underline font-semibold"
          >
            <User size={14} />
            <span>Owner: {owner.email || owner.name}</span>
          </Link>
        )}
        <span className="text-text-muted/40">|</span>
        <span className="text-text-muted">Node:</span>
        <span className="font-semibold text-text">{inst.node?.name || inst.nodeId || "Nigeria Host"}</span>
        <span className="text-text-muted/40">|</span>
        <span className="text-text-muted">IP:</span>
        {inst.ip ? <CopyBadge text={inst.ip} /> : <span className="text-text-muted/60">—</span>}
        <span className="text-text-muted/40">|</span>
        <span className="text-text-muted">OS:</span>
        <span className="text-text">{inst.image || inst.os || "Ubuntu 24.04 LTS"}</span>
        {inst.plan?.priceNgn ? (
          <>
            <span className="text-text-muted/40">|</span>
            <span className="text-text-muted">Plan:</span>
            <span className="text-accent font-bold">{formatNaira(inst.plan.priceNgn)}/mo</span>
          </>
        ) : null}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            tab === "overview"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          Telemetry & Details
        </button>
        <button
          type="button"
          onClick={() => setTab("logs")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            tab === "logs"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <ClockCounterClockwise size={14} />
          <span>Audit Log History</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === "overview" ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Live Telemetry Meters */}
          <section
            aria-label="Live gauges"
            className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-accent" />
                <h2 className="text-base font-bold text-text">Resource Allocation</h2>
              </div>
              <Pill tone={statusUpper === "RUNNING" ? "accent" : "muted"} dot>
                {statusUpper === "RUNNING" ? "LIVE METRICS" : "OFFLINE"}
              </Pill>
            </div>

            <div className="space-y-4">
              <Meter
                label="CPU ALLOCATION"
                pct={inst.usage?.cpu ?? (inst.plan?.cpu ? Math.min(100, inst.plan.cpu * 25) : 35)}
                totalText={`${inst.plan?.cpu ?? 1} vCPU`}
              />
              <Meter
                label="RAM ALLOCATION"
                pct={inst.usage?.ram ?? 45}
                totalText={`${inst.plan?.ramMb ?? 2048} MB`}
              />
              <Meter
                label="STORAGE VOLUME"
                pct={inst.usage?.disk ?? 20}
                totalText={`${inst.plan?.storageGb ?? 50} GB NVMe`}
              />
            </div>
          </section>

          {/* Full Specification Details */}
          <section
            aria-label="Specification"
            className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-text border-b border-border/50 pb-4 mb-5">
              VM Configuration Details
            </h2>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-mono">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Hostname</dt>
                <dd className="mt-1 font-semibold text-text">{inst.hostname}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Instance ID</dt>
                <dd className="mt-1">
                  <CopyBadge text={inst.id} />
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Backing Host Node</dt>
                <dd className="mt-1 font-semibold text-text">{inst.node?.name || inst.nodeId || "Default"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sovereign Region</dt>
                <dd className="mt-1 text-text">{inst.node?.region || "Nigeria (Lagos)"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">IP Address</dt>
                <dd className="mt-1">
                  {inst.ip ? <CopyBadge text={inst.ip} /> : <span className="text-text-muted/60">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">SSH Port</dt>
                <dd className="mt-1 text-text">{inst.sshPort ?? 22}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">OS Distribution</dt>
                <dd className="mt-1 text-text">{inst.image || inst.os || "Ubuntu 24.04"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Auto-Renew Status</dt>
                <dd className="mt-1 text-accent font-semibold">{inst.autoRenew ? "ENABLED" : "PAUSED"}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : (
        /* Audit Logs Tab */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Audit Trail for {inst.hostname}</h3>
            <button
              type="button"
              onClick={() => void loadLogs()}
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              <ArrowsClockwise size={12} className={logsLoading ? "animate-spin" : ""} />
              <span>Refresh Log</span>
            </button>
          </div>

          {logsLoading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No mutation logs recorded"
              description="Mutations performed on this instance will appear in this audit log."
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-surface/30 overflow-hidden">
              <ul className="divide-y divide-border/40 font-mono text-xs">
                {logs.map((l) => (
                  <li key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-surface/50">
                    <div>
                      <span className="font-bold text-accent">[{l.action}]</span>
                      <span className="text-text-muted ml-2">by user {l.userId}</span>
                      <span className="text-text-muted/60 ml-2">from {l.ip}</span>
                    </div>
                    <time className="text-[10px] text-text-muted">
                      {new Date(l.timestamp).toLocaleString("en-NG")}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={suspendOpen}
        title={`Suspend ${inst.hostname}?`}
        body="Stops instance compute execution, blocks networking, and marks instance as suspended. Data volumes remain preserved."
        confirmLabel="Suspend Instance"
        onClose={() => setSuspendOpen(false)}
        onConfirm={async () => {
          try {
            await api().post(`/v1/admin/instances/${inst.id}/suspend`, {});
            toast.success("Instance suspended");
            await loadData();
          } catch {
            toast.error("Suspend failed");
          }
          setSuspendOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title={`Permanently destroy ${inst.hostname}?`}
        body="This will permanently delete the virtual machine container, storage volumes, and all network routes. This action CANNOT be reversed."
        confirmLabel="Destroy VM"
        requireText={inst.hostname}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await api().del(`/v1/admin/instances/${inst.id}`);
            toast.success("Instance destroyed");
            router.push("/instances");
          } catch {
            toast.error("Deletion failed");
          }
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}