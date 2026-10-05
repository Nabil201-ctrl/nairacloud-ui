"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Cloud,
  MagnifyingGlass,
  ArrowClockwise,
  ArrowSquareOut,
  ArrowsLeftRight,
  Power,
  Trash,
  Play,
  Pause,
} from "@phosphor-icons/react";
import { PageHead, Pill, RTable, CopyBadge, LivePulse, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost, btnPrimary } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@/lib/api";

type Customer = { id: string; name: string; email: string; status: string };
type Instance = {
  id: string;
  hostname: string;
  ownerId?: string;
  userId?: string;
  user?: { email?: string; name?: string };
  plan?: string | { id?: string; name?: string; cpu?: number; ramMb?: number; storageGb?: number; priceNgn?: number };
  status: string;
  ip?: string | null;
  nodeId?: string | null;
  node?: { id?: string; name?: string; provider?: string; region?: string };
  os?: string;
  image?: string;
  createdAt: string;
  usage?: { cpu: number; ram: number; disk: number };
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

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableNodes, setAvailableNodes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [nodeFilter, setNodeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Actions
  const [suspendTarget, setSuspendTarget] = useState<Instance | null>(null);
  const [moveTarget, setMoveTarget] = useState<Instance | null>(null);
  const [selectedTargetNode, setSelectedTargetNode] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Instance | null>(null);

  const reload = async () => {
    try {
      const [insts, custs, nodesRes] = await Promise.all([
        api().get("/v1/admin/instances") as Promise<{ items: Instance[]; meta?: { page: number; limit: number; total: number } }>,
        api().get("/v1/admin/customers") as Promise<{ items: Customer[]; meta?: { page: number; limit: number; total: number } }>,
        api().get("/v1/admin/nodes") as Promise<Array<{ id: string; name: string }>>,
      ]);
      setInstances(insts.items ?? []);
      setCustomers(custs.items ?? []);
      setAvailableNodes(nodesRes ?? []);
    } catch (err) {
      toast.error("Failed to load instances directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const getPlanName = (plan: Instance["plan"]): string => {
    if (!plan) return "standard";
    if (typeof plan === "string") return plan;
    return plan.name ?? "custom";
  };

  const getNodeId = (i: Instance): string => {
    return i.nodeId ?? i.node?.name ?? i.node?.id ?? "unknown";
  };

  const getOwnerEmail = (i: Instance): string => {
    if (i.user?.email) return i.user.email;
    const found = customers.find((c) => c.id === (i.ownerId ?? i.userId));
    return found?.email ?? found?.name ?? i.ownerId ?? i.userId ?? "—";
  };

  const uniqueNodes = useMemo(() => {
    return Array.from(new Set(instances.map(getNodeId).filter(Boolean))).sort();
  }, [instances]);

  const uniquePlans = useMemo(() => {
    return Array.from(new Set(instances.map((i) => getPlanName(i.plan)).filter(Boolean))).sort();
  }, [instances]);

  const filteredInstances = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return instances.filter((i) => {
      const owner = getOwnerEmail(i).toLowerCase();
      const node = getNodeId(i);
      const plan = getPlanName(i.plan);
      const status = (i.status ?? "").toUpperCase();

      if (nodeFilter !== "all" && node !== nodeFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (planFilter !== "all" && plan !== planFilter) return false;
      if (ql && !(i.hostname.toLowerCase().includes(ql) || owner.includes(ql) || (i.ip && i.ip.includes(ql)))) {
        return false;
      }
      return true;
    });
  }, [instances, customers, q, nodeFilter, statusFilter, planFilter]);

  const resumeInstance = async (i: Instance) => {
    try {
      await api().post(`/v1/admin/instances/${i.id}/resume`, {});
      toast.success(`${i.hostname} resumed`);
      await reload();
    } catch {
      toast.error("Resume failed");
    }
  };

  const restartInstance = async (i: Instance) => {
    try {
      await api().post(`/v1/instances/${i.id}/action`, { action: "REBOOT" });
      toast.success(`${i.hostname} restart command sent`);
      await reload();
    } catch {
      toast.error("Restart failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Fleet Instances"
        sub="Every virtual machine provisioned across all customers. Filter by node host, plan size, running status, or customer identity."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void reload();
            }}
            title="Refresh fleet"
            className={btnGhost}
          >
            <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      {/* Modern Filter Strip */}
      <section
        aria-label="Filters"
        className="grid gap-3 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Search Fleet
          </label>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="hostname, IP, or owner email…"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Node Host
          </label>
          <select value={nodeFilter} onChange={(e) => setNodeFilter(e.target.value)} className={selectCls}>
            <option value="all">All Nodes</option>
            {uniqueNodes.map((n) => (
              <option key={n} value={n}>
                {n.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Status
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="all">All Statuses</option>
            <option value="RUNNING">RUNNING</option>
            <option value="STOPPED">STOPPED</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="CREATING">CREATING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Plan Size
          </label>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className={selectCls}>
            <option value="all">All Plans</option>
            {uniquePlans.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>
          SHOWING <strong className="text-text">{filteredInstances.length}</strong> OF {instances.length} INSTANCES
        </span>
      </div>

      {/* Main Table or Loading/Empty */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredInstances.length === 0 ? (
        <EmptyState
          icon={<Cloud size={36} />}
          title="No instances match criteria"
          description="Try broadening your search query or adjusting status and node filters."
          action={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setNodeFilter("all");
                setStatusFilter("all");
                setPlanFilter("all");
              }}
              className={btnGhost}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <RTable
          head={["Hostname", "Owner", "Plan", "Node", "Status", "IP Address", "Created", "Actions"]}
          rows={filteredInstances.map((i) => {
            const planName = getPlanName(i.plan);
            const statusUpper = (i.status ?? "STOPPED").toUpperCase();
            const tone = STATUS_TONE[i.status] ?? "muted";
            const ownerEmail = getOwnerEmail(i);
            const nodeId = getNodeId(i);

            return [
              {
                v: (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/instances/${i.id}`}
                      className="font-mono text-sm font-bold text-text hover:text-accent transition-colors"
                    >
                      {i.hostname}
                    </Link>
                  </div>
                ),
              },
              {
                v: (
                  <span className="text-xs text-text-muted truncate max-w-[140px] block" title={ownerEmail}>
                    {ownerEmail}
                  </span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border/60">
                    {planName.toUpperCase()}
                  </span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {nodeId.toUpperCase()}
                  </span>
                ),
              },
              {
                v: (
                  <Pill tone={tone} dot>
                    {i.status}
                  </Pill>
                ),
              },
              {
                v: i.ip ? (
                  <CopyBadge text={i.ip} />
                ) : (
                  <span className="font-mono text-xs text-text-muted/60">—</span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {new Date(i.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </span>
                ),
              },
              {
                v: (
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/instances/${i.id}`}
                      className="press rounded border border-border/70 bg-surface/40 px-2 py-1 text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                    >
                      Detail
                    </Link>

                    {statusUpper === "SUSPENDED" ? (
                      <button
                        type="button"
                        onClick={() => void resumeInstance(i)}
                        title="Resume suspended instance"
                        className="press rounded border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-bold text-accent hover:bg-accent/20 transition-colors"
                      >
                        Resume
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSuspendTarget(i)}
                        title="Suspend instance"
                        className="press rounded border border-warning/50 bg-warning/5 px-2 py-1 text-xs font-bold text-warning hover:bg-warning/15 transition-colors"
                      >
                        Suspend
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void restartInstance(i)}
                      title="Reboot virtual machine"
                      className="press rounded border border-border/70 bg-surface/40 p-1 text-text-muted hover:border-border-hover hover:text-text"
                    >
                      <Power size={13} weight="bold" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoveTarget(i);
                        const otherNode = availableNodes.find((n) => n.id !== i.nodeId)?.id ?? "";
                        setSelectedTargetNode(otherNode);
                      }}
                      title="Migrate VM to another host node"
                      className="press rounded border border-border/70 bg-surface/40 p-1 text-text-muted hover:border-accent/40 hover:text-accent"
                    >
                      <ArrowsLeftRight size={13} weight="bold" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(i)}
                      title="Destroy instance permanently"
                      className="press rounded border border-danger/40 bg-danger/5 p-1 text-danger hover:bg-danger/20"
                    >
                      <Trash size={13} weight="bold" />
                    </button>
                  </div>
                ),
              },
            ];
          })}
        />
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={suspendTarget !== null}
        title={`Suspend ${suspendTarget?.hostname ?? ""}?`}
        body="The instance disk and static IP address are preserved, but networking and CPU runtime are immediately frozen. Billing will remain paused or flagged."
        confirmLabel="Suspend Instance"
        onClose={() => setSuspendTarget(null)}
        onConfirm={async () => {
          if (suspendTarget) {
            try {
              await api().post(`/v1/admin/instances/${suspendTarget.id}/suspend`, {});
              toast.success(`${suspendTarget.hostname} suspended`);
              await reload();
            } catch {
              toast.error("Suspend action failed");
            }
          }
          setSuspendTarget(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Permanently destroy ${deleteTarget?.hostname ?? ""}?`}
        body="This will permanently delete the virtual machine container, storage volumes, and all network routes. This action CANNOT be reversed."
        confirmLabel="Destroy VM"
        requireText={deleteTarget?.hostname ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await api().del(`/v1/admin/instances/${deleteTarget.id}`);
              toast.success(`${deleteTarget.hostname} destroyed`);
              await reload();
            } catch {
              toast.error("Deletion failed");
            }
          }
          setDeleteTarget(null);
        }}
      />

      {/* Node Migration Modal */}
      <Modal
        open={moveTarget !== null}
        title={`Move ${moveTarget?.hostname ?? ""}`}
        onClose={() => setMoveTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMoveTarget(null)} className={btnGhost}>
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (moveTarget && selectedTargetNode) {
                  try {
                    await api().post(`/v1/admin/instances/${moveTarget.id}/move`, {
                      targetNodeId: selectedTargetNode,
                    });
                    toast.success(`${moveTarget.hostname} migration initiated to node ${selectedTargetNode}`);
                    await reload();
                  } catch {
                    toast.error("Migration request failed");
                  }
                } else {
                  toast.error("Please pick a destination node");
                }
                setMoveTarget(null);
              }}
              className={btnPrimary}
            >
              Confirm Migration
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted leading-relaxed">
            Reassign the backing compute node for <strong className="text-text font-mono">{moveTarget?.hostname}</strong>.
            Current host: <strong className="text-accent font-mono">{getNodeId(moveTarget ?? {} as Instance)}</strong>.
          </p>

          <div className="space-y-2">
            <label className="block font-mono text-xs font-bold uppercase text-text-muted">
              Select Destination Node:
            </label>
            <div className="grid gap-2">
              {availableNodes
                .filter((n) => n.id !== moveTarget?.nodeId)
                .map((node) => (
                  <label
                    key={node.id}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedTargetNode === node.id
                        ? "border-accent bg-accent/10 text-accent font-semibold"
                        : "border-border/70 bg-surface/40 hover:bg-surface text-text"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="targetNode"
                        checked={selectedTargetNode === node.id}
                        onChange={() => setSelectedTargetNode(node.id)}
                        className="accent-accent"
                      />
                      <span className="font-mono text-sm">{node.name}</span>
                    </div>
                    <span className="font-mono text-xs text-text-muted">{node.id}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}