"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHead, Pill, Meter, RTable } from "@/components/ui";
import { NodeTerminal } from "@/components/node-terminal";
import { ProbeAgentConsole } from "@/components/probe-agent-console";
import { api } from "@/lib/api";
import { eventMatchesNode, useRealtime } from "@/hooks/use-realtime";

type HeartbeatMeta = {
  cpuPct?: number;
  ramUsedMb?: number;
  diskUsedGb?: number;
  networkMbps?: number;
  instanceCount?: number;
};

type Node = {
  id: string;
  name: string;
  status: string;
  region: string;
  hostname?: string | null;
  ip?: string | null;
  agentVersion?: string | null;
  totalCpu: number;
  totalRamMb: number;
  totalStorageGb: number;
  allocatedCpu: number;
  allocatedRamMb: number;
  allocatedStorageGb: number;
  lastHeartbeatAt?: string | null;
  lastHeartbeatMeta?: HeartbeatMeta | null;
  commandLog?: { at?: string; stage?: string; cmd: string; out: string; code: number }[] | null;
  onboardError?: string | null;
};

type Instance = { id: string; hostname: string; ownerId: string; plan: string; status: string; ip: string; nodeId: string; os: string; createdAt: string; usage: { cpu: number; ram: number; disk: number } };

const STATUS_TONE: Record<string, "accent" | "warn" | "danger" | "info" | "muted"> = {
  Running: "accent",
  Stopped: "muted",
  Error: "danger",
  Suspended: "warn",
  Creating: "info",
};

function pctOrNull(used: number | undefined, total: number | undefined): number | null {
  if (used == null || total == null || total <= 0) return null;
  return Math.round((used / total) * 100);
}

export default function NodeDetailPage() {
  const params = useParams<{ id: string }>();
  const [node, setNode] = useState<Node | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [onNode, setOnNode] = useState<Instance[]>([]);
  const { isConnected, probeProgress, error: socketError } = useRealtime();
  const liveEvents = node ? probeProgress.filter((e) => eventMatchesNode(e, node)) : [];
  const completes = liveEvents.filter((e) => e.step === "complete").length;

  useEffect(() => {
    const load = async () => {
      try {
        const n = await api().get(`/v1/admin/nodes/${params.id}`) as Node;
        setNode(n ?? null);
        const insts = await api().get("/v1/admin/instances") as { items: Instance[]; meta: { page: number; limit: number; total: number } };
        setOnNode((insts.items ?? []).filter((i) => i.nodeId === params.id));
      } catch (err) {
        console.error("Failed to load node", err);
      } finally {
        setLoaded(true);
      }
    };
    void load();
  }, [params.id, completes]);

  useEffect(() => {
    if (node?.status !== "PROVISIONING") return;
    const timer = setInterval(() => {
      void api().get(`/v1/admin/nodes/${params.id}`).then((n) => setNode(n as Node)).catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [node?.status, params.id]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <PageHead title="Node" sub="Loading host…" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="space-y-4">
        <PageHead title="Node not found" />
        <p className="text-sm text-text-muted">We could not find that node. <Link href="/nodes" className="text-accent hover:underline">Back to Nodes.</Link></p>
      </div>
    );
  }

  const meta = node.lastHeartbeatMeta ?? {};
  const cpuPct = meta.cpuPct != null ? Math.round(meta.cpuPct) : pctOrNull(node.allocatedCpu, node.totalCpu);
  const ramPct = meta.ramUsedMb != null ? pctOrNull(meta.ramUsedMb, node.totalRamMb) : pctOrNull(node.allocatedRamMb, node.totalRamMb);
  const diskPct = meta.diskUsedGb != null ? pctOrNull(meta.diskUsedGb, node.totalStorageGb) : pctOrNull(node.allocatedStorageGb, node.totalStorageGb);
  const heartbeat = node.lastHeartbeatAt
    ? new Date(node.lastHeartbeatAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const extras: [string, string][] = [
    ["CPU allocated", `${node.allocatedCpu} / ${node.totalCpu}`],
    ["RAM allocated", `${node.allocatedRamMb} / ${node.totalRamMb} MB`],
    ["Storage allocated", `${node.allocatedStorageGb} / ${node.totalStorageGb} GB`],
  ];
  if (meta.ramUsedMb != null) extras.push(["Memory used", `${meta.ramUsedMb} MB`]);
  if (meta.diskUsedGb != null) extras.push(["Disk used", `${meta.diskUsedGb} GB`]);
  if (meta.networkMbps != null) extras.push(["Network", `${meta.networkMbps} Mbps`]);
  if (meta.instanceCount != null) extras.push(["Reported instances", String(meta.instanceCount)]);
  if (meta.cpuPct == null && meta.ramUsedMb == null && meta.diskUsedGb == null && meta.networkMbps == null) {
    extras.push(["Live hardware", "Not reported"]);
  }

  return (
    <div className="space-y-8">
      <PageHead
        title={node.name}
        sub={`${node.hostname ?? node.region} · agent ${node.agentVersion ?? "—"} · heartbeat ${heartbeat}`}
        actions={<Pill tone={node.status === "ONLINE" ? "accent" : node.status === "DEGRADED" ? "warn" : node.status === "OFFLINE" ? "danger" : "muted"}>{node.status}</Pill>}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section aria-label="Raw metrics" className="rounded-md border border-border bg-surface p-6">
            <h2 className="font-semibold">Raw metrics</h2>
            <div className="mt-4 max-w-md space-y-3">
              {cpuPct != null ? <Meter label="CPU" pct={cpuPct} /> : (
                <p className="text-sm text-text-muted">CPU — Not reported</p>
              )}
              {ramPct != null ? <Meter label="RAM" pct={ramPct} /> : (
                <p className="text-sm text-text-muted">RAM — Not reported</p>
              )}
              {diskPct != null ? <Meter label="Storage" pct={diskPct} /> : (
                <p className="text-sm text-text-muted">Storage — Not reported</p>
              )}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              {extras.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-text-muted">{k}</dt>
                  <dd className="mt-0.5 font-mono tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Instances on node">
            <h2 className="mb-3 font-semibold">Instances on node ({onNode.length})</h2>
            <RTable
              head={["Hostname", "Owner", "Plan", "Status", "IP", "Created"]}
              rows={onNode.map((i) => [
                { v: <Link href={`/instances/${i.id}`} className="font-mono text-sm hover:text-accent">{i.hostname}</Link> },
                { v: <span className="text-sm">{i.ownerId.replace("c_", "")}</span> },
                { v: <span className="font-mono text-sm">{i.plan}</span> },
                { v: <Pill tone={STATUS_TONE[i.status]}>{(i.status as string).toLowerCase()}</Pill> },
                { v: <span className="font-mono text-sm">{i.ip}</span> },
                { v: <span className="text-sm text-text-muted">{new Date(i.createdAt).toLocaleDateString("en-NG")}</span> },
              ])}
            />
          </section>
        </div>

        <aside aria-label="Groq probe agent" className="space-y-4 lg:sticky lg:top-6">
          {node.onboardError && (
            <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              <p className="font-semibold">Onboard failed</p>
              <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{node.onboardError}</p>
            </div>
          )}
          <ProbeAgentConsole name={node.name} events={liveEvents} connected={isConnected} connectionError={socketError} />
          <NodeTerminal name={node.name} log={node.commandLog ?? null} />
        </aside>
      </div>
    </div>
  );
}
