"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  SquaresFour,
  TerminalWindow,
  Plus,
  ArrowClockwise,
  Cpu,
  HardDrives,
  CheckCircle,
  Warning,
  XCircle,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import { PageHead, Pill, Meter, CopyBadge, LivePulse, TableSkeleton, EmptyState, btnPrimary, btnGhost } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { NodeTerminal, CommandLogEntry } from "@/components/node-terminal";
import { ProbeAgentConsole } from "@/components/probe-agent-console";
import { OnboardModal } from "./onboard-modal";
import { api } from "@/lib/api";
import { useRealtime, ProbeProgressData } from "@/hooks/use-realtime";

type HeartbeatMeta = {
  cpuPct?: number;
  ramUsedMb?: number;
  diskUsedGb?: number;
  instanceCount?: number;
};

type Node = {
  id: string;
  name: string;
  status: string;
  region: string;
  provider?: string | null;
  hostname?: string | null;
  ip?: string | null;
  agentVersion?: string | null;
  agentTargetVersion?: string | null;
  totalCpu: number;
  totalRamMb: number;
  totalStorageGb: number;
  allocatedCpu: number;
  allocatedRamMb: number;
  allocatedStorageGb: number;
  lastHeartbeatAt?: string | null;
  lastHeartbeatMeta?: HeartbeatMeta | null;
  sellPlan?: { mode?: string; plan?: string; slices?: number; cpuPerSlice?: number; ramMbPerSlice?: number; storageGbPerSlice?: number } | null;
  commandLog?: CommandLogEntry[] | null;
  onboardError?: string | null;
  _count?: { instances?: number };
};

type AgentRelease = {
  id: string;
  version: string;
  sha256: string;
  sizeBytes?: number;
  fileName?: string;
  notes?: string;
  active: boolean;
  createdAt?: string;
};

function pctOrNull(used: number | undefined, total: number | undefined): number {
  if (used == null || total == null || total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

function nodeMetrics(n: Node) {
  const meta = n.lastHeartbeatMeta ?? {};
  const cpuPct = meta.cpuPct != null ? Math.round(meta.cpuPct) : pctOrNull(n.allocatedCpu, n.totalCpu);
  const ramPct = meta.ramUsedMb != null ? pctOrNull(meta.ramUsedMb, n.totalRamMb) : pctOrNull(n.allocatedRamMb, n.totalRamMb);
  const diskPct = meta.diskUsedGb != null ? pctOrNull(meta.diskUsedGb, n.totalStorageGb) : pctOrNull(n.allocatedStorageGb, n.totalStorageGb);
  const instances = meta.instanceCount ?? n._count?.instances ?? 0;
  const heartbeat = n.lastHeartbeatAt
    ? new Date(n.lastHeartbeatAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return { cpuPct, ramPct, diskPct, instances, heartbeat };
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "terminal">("grid");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [releases, setReleases] = useState<AgentRelease[]>([]);
  const [updateNode, setUpdateNode] = useState<Node | null>(null);
  const [updateReleaseId, setUpdateReleaseId] = useState("");
  const [updatingAgent, setUpdatingAgent] = useState(false);
  const [probeFeed, setProbeFeed] = useState<ProbeProgressData[]>([]);

  // Dialog actions
  const [actionNode, setActionNode] = useState<{ node: Node; type: "drain" | "maintenance" | "reconcile" } | null>(null);

  const { isConnected, probeProgress, error: socketError, clearProbeProgress } = useRealtime();

  useEffect(() => {
    if (probeProgress.length > 0) {
      setProbeFeed(probeProgress);
    }
  }, [probeProgress]);

  const loadNodes = async () => {
    try {
      const data = (await api().get("/v1/admin/nodes")) as Node[];
      setNodes(data ?? []);
      if (!selectedNodeId && data?.length) {
        setSelectedNodeId(data[0]!.id);
      }
    } catch (err) {
      toast.error("Failed to load compute nodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNodes();
  }, []);

  useEffect(() => {
    if (!nodes.some((n) => n.status === "PROVISIONING")) return;
    const timer = setInterval(() => { void loadNodes(); }, 4000);
    return () => clearInterval(timer);
  }, [nodes]);

  const handleDrain = async (node: Node) => {
    try {
      await api().post(`/v1/admin/nodes/${node.id}/drain`, {});
      toast.success(`${node.name} marked as DRAINING`, {
        description: "No new instances will be scheduled on this machine.",
      });
      await loadNodes();
    } catch {
      toast.error("Failed to drain node");
    }
    setActionNode(null);
  };

  const handleMaintenance = async (node: Node) => {
    try {
      await api().post(`/v1/admin/nodes/${node.id}/maintenance`, {});
      toast.success(`${node.name} set to MAINTENANCE mode`);
      await loadNodes();
    } catch {
      toast.error("Failed to set maintenance mode");
    }
    setActionNode(null);
  };

  const handleUpdateAgent = async (node: Node, releaseId: string) => {
    setUpdatingAgent(true);
    try {
      const res = await api().post<{ from?: string | null; to?: string }>(
        `/v1/admin/nodes/${node.id}/restart-agent`,
        releaseId ? { releaseId } : {},
      );
      toast.success(`Agent update started on ${node.name}`, {
        description: `v${res.from ?? "?"} → v${res.to ?? "?"}. The binary swaps in place; running instances are never restarted.`,
      });
      setUpdateNode(null);
      await loadNodes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start agent update");
    } finally {
      setUpdatingAgent(false);
    }
  };

  const openUpdateAgent = async (node: Node) => {
    setUpdateNode(node);
    setUpdateReleaseId("");
    try {
      const rows = await api().get<AgentRelease[]>("/v1/admin/agent-releases");
      const list = Array.isArray(rows) ? rows : [];
      setReleases(list);
      setUpdateReleaseId(list.find((r) => r.active)?.id ?? list[0]?.id ?? "");
    } catch (err) {
      setReleases([]);
      toast.error(err instanceof Error ? err.message : "Failed to load agent releases");
    }
  };

  const handleRetryOnboard = async (node: Node) => {
    try {
      await api().post(`/v1/admin/nodes/${node.id}/retry-onboard`, {});
      toast.success(`Onboard re-queued for ${node.name}`, {
        description: "Watch the live feed and node page for the install log.",
      });
      await loadNodes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to retry onboard");
    }
  };

  const handleReconcile = async (node: Node) => {
    try {
      await api().post(`/v1/admin/nodes/${node.id}/reconcile-containers`, {});
      toast.success(`Container reconciliation triggered for ${node.name}`);
      await loadNodes();
    } catch {
      toast.error("Failed to trigger reconciliation");
    }
    setActionNode(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHead
        title="Compute Nodes"
        sub="Bare-metal and virtualized hosts powering NairaCloud instances. Monitor live hardware, drain capacity, or onboard new machines over SSH."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-border/70 bg-surface/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid" ? "bg-accent font-bold text-accent-fg shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                <SquaresFour size={14} weight="bold" />
                <span>Rack View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("terminal")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "terminal" ? "bg-accent font-bold text-accent-fg shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                <TerminalWindow size={14} weight="bold" />
                <span>Console Log</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadNodes();
              }}
              title="Refresh nodes"
              className={btnGhost}
            >
              <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={() => setOnboardOpen(true)}
              className={btnPrimary}
            >
              <Plus size={14} weight="bold" />
              <span>Onboard Node</span>
            </button>
          </div>
        }
      />

      {probeFeed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setProbeFeed([]);
                clearProbeProgress();
              }}
              className="text-xs font-mono text-text-muted underline hover:text-text"
            >
              Dismiss live feed
            </button>
          </div>
          <ProbeAgentConsole
            name={probeFeed[probeFeed.length - 1]?.nodeName || probeFeed[probeFeed.length - 1]?.nodeId || "host"}
            events={probeFeed}
            connected={isConnected}
            connectionError={socketError}
          />
        </div>
      )}

      {loading && nodes.length === 0 ? (
        <TableSkeleton rows={4} cols={4} />
      ) : nodes.length === 0 ? (
        <EmptyState
          icon={<HardDrives size={36} />}
          title="No compute nodes enrolled"
          description="You haven't onboarded any server nodes to the cluster yet. Add your first Linux host via SSH."
          action={
            <button type="button" onClick={() => setOnboardOpen(true)} className={btnPrimary}>
              <Plus size={14} weight="bold" />
              <span>Onboard Server Host</span>
            </button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {nodes.map((node) => {
            const m = nodeMetrics(node);
            const statusUpper = node.status.toUpperCase();
            const tone =
              statusUpper === "ONLINE"
                ? "accent"
                : statusUpper === "DEGRADED" || statusUpper === "DRAINING"
                ? "warn"
                : "danger";

            return (
              <div
                key={node.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm transition-all duration-200 hover:border-border-hover hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface border border-border/80 shadow-inner">
                        <HardDrives size={20} className="text-accent" />
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <LivePulse status={node.status} />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/nodes/${node.id}`}
                          className="font-mono text-base font-bold text-text hover:text-accent transition-colors truncate block"
                        >
                          {node.name}
                        </Link>
                        <p className="text-xs text-text-muted truncate">
                          {node.region || "Nigeria"} {node.provider ? `· ${node.provider}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Pill tone={tone} dot>
                        {node.status}
                      </Pill>
                    </div>
                  </div>

                  {/* Node IP & Specs Bar */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    {node.ip && <CopyBadge text={node.ip} label={`IP: ${node.ip}`} />}
                    {node.hostname && <CopyBadge text={node.hostname} label={node.hostname} />}
                    {node.agentVersion && (
                      <span className="rounded bg-surface/70 border border-border/60 px-2 py-0.5 font-mono text-[10px] text-text-muted">
                        agent v{node.agentVersion}
                      </span>
                    )}
                    {node.agentTargetVersion && node.agentTargetVersion !== node.agentVersion && (
                      <span className="rounded border border-accent/50 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                        updating → v{node.agentTargetVersion}
                      </span>
                    )}
                  </div>

                  {/* Resource Gauges */}
                  <div className="space-y-3.5 bg-surface/30 rounded-lg p-3.5 border border-border/50">
                    <Meter
                      label="RAM ALLOCATION"
                      pct={m.ramPct}
                      totalText={`${node.allocatedRamMb ?? 0} / ${node.totalRamMb} MB`}
                    />
                    <Meter
                      label="CPU ALLOCATION"
                      pct={m.cpuPct}
                      totalText={`${node.allocatedCpu ?? 0} / ${node.totalCpu} vCPU`}
                    />
                    <Meter
                      label="STORAGE USED"
                      pct={m.diskPct}
                      totalText={`${node.allocatedStorageGb ?? 0} / ${node.totalStorageGb} GB`}
                    />
                  </div>

                  {/* Heartbeat & Instance count info */}
                  {node.onboardError && (
                    <p className="mt-3 whitespace-pre-wrap rounded-md border border-danger/40 bg-danger/10 p-2 font-mono text-[11px] text-danger">
                      Onboard failed: {node.onboardError}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs font-mono text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-text-muted/70" />
                      <span>Last heartbeat: {m.heartbeat}</span>
                    </span>
                    <span className="font-semibold text-text">
                      {m.instances} {m.instances === 1 ? "VM running" : "VMs running"}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActionNode({ node, type: "drain" })}
                      disabled={statusUpper === "DRAINING"}
                      title="Set to DRAINING mode to stop assigning new VMs"
                      className="press rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-warning/50 hover:text-warning disabled:opacity-40"
                    >
                      Drain
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionNode({ node, type: "maintenance" })}
                      disabled={statusUpper === "MAINTENANCE"}
                      title="Set node to maintenance"
                      className="press rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-warning/50 hover:text-warning disabled:opacity-40"
                    >
                      Maintenance
                    </button>
                    <button
                      type="button"
                      onClick={() => void openUpdateAgent(node)}
                      title="Update the node agent binary in place (instances keep running)"
                      className="press rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-accent/50 hover:text-accent"
                    >
                      Update Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRetryOnboard(node)}
                      disabled={statusUpper === "PROVISIONING"}
                      title="Re-run SSH onboard using stored credentials"
                      className={`press rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
                        statusUpper === "FAILED" || node.onboardError
                          ? "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
                          : "border-border/70 bg-surface/40 text-text-muted hover:border-accent/50 hover:text-accent"
                      }`}
                    >
                      Retry Onboard
                    </button>
                  </div>

                  <Link
                    href={`/nodes/${node.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>Node Metrics</span>
                    <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Terminal View */
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface/40 p-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold uppercase text-text-muted">Target Host:</span>
              <select
                value={selectedNode?.id ?? ""}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="rounded-md border border-border/80 bg-surface px-3 py-1.5 font-mono text-xs text-text focus:border-accent focus:outline-none"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.ip ?? n.id})
                  </option>
                ))}
              </select>
            </div>
            {selectedNode && (
              <div className="flex items-center gap-2">
                <Pill tone={selectedNode.status === "ONLINE" ? "accent" : "warn"} dot>
                  {selectedNode.status}
                </Pill>
              </div>
            )}
          </div>

          {selectedNode && (
            <div className="space-y-4">
              <ProbeAgentConsole
                name={selectedNode.name}
                events={probeFeed.filter((e) => e.nodeDbId === selectedNode.id || (selectedNode.ip != null && e.nodeId === selectedNode.ip))}
                connected={isConnected}
                connectionError={socketError}
              />
              <NodeTerminal name={selectedNode.name} log={selectedNode.commandLog ?? []} />
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modals for Node Actions */}
      {actionNode && (
        <ConfirmDialog
          open={!!actionNode}
          title={
            actionNode.type === "drain"
              ? `Drain node ${actionNode.node.name}?`
              : actionNode.type === "maintenance"
              ? `Set ${actionNode.node.name} to Maintenance?`
              : `Reconcile containers on ${actionNode.node.name}?`
          }
          body={
            actionNode.type === "drain"
              ? "Existing instances will continue running, but the scheduler will cease placing any new instances onto this machine."
              : actionNode.type === "maintenance"
              ? "Sets the node into maintenance mode. Console tokens and automated tasks for this node will be temporarily paused."
              : "Scans Docker container state on the host and reconciles allocated memory, vCPU, and network bridges."
          }
          confirmLabel={
            actionNode.type === "drain"
              ? "Drain Node"
              : actionNode.type === "maintenance"
              ? "Set Maintenance"
              : "Restart Agent"
          }
          onClose={() => setActionNode(null)}
          onConfirm={() => {
            if (actionNode.type === "drain") void handleDrain(actionNode.node);
            else if (actionNode.type === "maintenance") void handleMaintenance(actionNode.node);
            else if (actionNode.type === "reconcile") void handleReconcile(actionNode.node);
          }}
        />
      )}

      {/* Update Agent modal — in-place binary swap, instances untouched */}
      <Modal
        open={!!updateNode}
        title={`Update agent on ${updateNode?.name ?? ""}`}
        onClose={() => setUpdateNode(null)}
        footer={
          <>
            <button type="button" onClick={() => setUpdateNode(null)} className={btnGhost}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!updateReleaseId || updatingAgent}
              onClick={() => updateNode && void handleUpdateAgent(updateNode, updateReleaseId)}
              className={btnPrimary}
            >
              {updatingAgent ? "Starting…" : "Update Agent"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          The agent downloads the selected release, verifies its sha256, self-checks it and binary-swaps
          itself in place (same PID, same supervisor). Running instances are never stopped or recreated;
          if the new agent fails to report a healthy heartbeat it rolls back to the previous binary
          automatically.
        </p>
        {releases.length === 0 ? (
          <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            No agent releases uploaded yet. Add one under Agent Releases first.
          </p>
        ) : (
          <div className="space-y-2">
            {releases.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                  updateReleaseId === r.id ? "border-accent/60 bg-accent/10" : "border-border/70 bg-surface/40"
                }`}
              >
                <input
                  type="radio"
                  name="agent-release"
                  value={r.id}
                  checked={updateReleaseId === r.id}
                  onChange={() => setUpdateReleaseId(r.id)}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-text">v{r.version}</span>
                    {r.active && <Pill tone="accent">active</Pill>}
                    {updateNode?.agentVersion === r.version && <Pill tone="muted">running</Pill>}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[10px] text-text-muted">
                    sha256 {r.sha256?.slice(0, 16)}… · {r.fileName ?? "agent binary"}
                    {r.sizeBytes ? ` · ${(r.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}
                  </span>
                  {r.notes && <span className="mt-1 block text-xs text-text-muted">{r.notes}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </Modal>

      {/* SSH Onboard Modal */}
      <OnboardModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onDone={() => void loadNodes()}
        liveEvents={probeFeed}
        liveConnected={isConnected}
        liveError={socketError}
      />
    </div>
  );
}
