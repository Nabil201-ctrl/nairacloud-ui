"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StatusDot, CopyField, EmptyState } from "@nairacloud/ui";
import { ArrowLeft, Play, Stop, ArrowClockwise, TerminalWindow, HardDrive, ShieldCheck, Pulse, GearSix, HardDrives } from "@phosphor-icons/react";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  PrimaryButton,
  SecondaryButton,
  DashCard,
  SegmentedControl,
} from "@/components/dashboard";

type Instance = {
  id: string;
  hostname: string;
  status: string;
  plan: string;
  ip: string;
  sshHost: string;
  sshPort: number;
  node: string;
  region: string;
  os: string;
  createdAt: string;
  expiresAt: string;
  autoRenew: boolean;
  authMethod: "ssh-key" | "password";
  rootPassword?: string;
  usage: { cpu: number; ram: number; disk: number };
};
type Plan = { id: string; slug: string; name: string; description: string; cpu: number; ramMb: number; storageGb: number; priceNgn: number; status: string };

type MetricPoint = {
  timestamp: string;
  cpuPct: number;
  ramMb: number;
  diskGb: number;
  networkMb: number;
};

const TABS = [
  { id: "Overview", icon: HardDrives },
  { id: "Console", icon: TerminalWindow },
  { id: "Metrics", icon: Pulse },
  { id: "Networking", icon: ShieldCheck },
  { id: "Backups", icon: HardDrive },
  { id: "Settings", icon: GearSix },
] as const;
type Tab = (typeof TABS)[number]["id"];

function normalizeInstance(raw: Record<string, unknown>): Instance {
  const plan = raw.plan;
  const node = raw.node as { name?: string; region?: string; ip?: string } | null | undefined;
  const subscription = raw.subscription as { nextBillingDate?: string } | null | undefined;
  const usage = raw.usage as Instance["usage"] | undefined;
  const sshPort = Number(raw.sshPort ?? 22) || 22;
  const privateIp = String(raw.ip ?? "");
  const sshHost = node?.ip || privateIp || "";
  return {
    id: String(raw.id ?? ""),
    hostname: String(raw.hostname ?? ""),
    status: String(raw.status ?? ""),
    plan: typeof raw.plan === "string" ? raw.plan : String((raw.plan as { name?: string } | null)?.name ?? ""),
    ip: privateIp,
    sshHost,
    sshPort,
    node: typeof node === "string" ? node : String(node?.name ?? ""),
    region: String(raw.region ?? node?.region ?? ""),
    os: String(raw.os ?? raw.image ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    expiresAt: String(raw.expiresAt ?? subscription?.nextBillingDate ?? ""),
    autoRenew: Boolean(raw.autoRenew ?? true),
    authMethod: raw.authMethod === "password" ? "password" : "ssh-key",
    rootPassword: String(raw.rootPassword ?? ""),
    usage: usage ?? { cpu: 0, ram: 0, disk: 0 },
  };
}

function isRunningStatus(status: string): boolean {
  return status === "Running" || status === "RUNNING";
}

function sshCommand(host: string, port: number): string | null {
  if (!host) return null;
  const base = `ssh root@${host}`;
  return port && port !== 22 ? `${base} -p ${port}` : base;
}

function sshCopyIdCommand(host: string, port: number): string | null {
  if (!host) return null;
  const base = `ssh-copy-id -i ~/.ssh/id_ed25519.pub root@${host}`;
  return port && port !== 22 ? `${base} -p ${port}` : base;
}

export default function InstanceDetailPage() {
  return (
    <Suspense fallback={<div className="pt-8"><p className="text-[13px] text-text-muted">Loading instance…</p></div>}>
      <InstanceDetailInner />
    </Suspense>
  );
}

function InstanceDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null);
  const [instance, setInstance] = useState<Instance | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>(initialTab && TABS.some((t) => t.id === initialTab) ? initialTab : "Overview");
  const [confirm, setConfirm] = useState<"rebuild" | "delete" | "destroy" | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [inst, pl] = await Promise.all([
          api().get(`/v1/instances/${params.id}`) as Promise<Record<string, unknown>>,
          api().get("/v1/plans") as Promise<Plan[]>,
        ]);
        setInstance(inst ? normalizeInstance(inst) : null);
        setPlans(pl ?? []);
      } catch (err) {
        console.error("Failed to load instance", err);
        setInstance(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  const plan = instance
    ? plans.find((p) => p.name === instance.plan || p.slug === instance.plan.toLowerCase() || p.name.toLowerCase() === instance.plan.toLowerCase())
    : undefined;

  useEffect(() => {
    if (loading || instance) return;
    const t = setTimeout(() => router.push("/dashboard/instances"), 2500);
    return () => clearTimeout(t);
  }, [instance, loading, router]);

  if (loading) {
    return (
      <div className="pt-8">
        <p className="text-[13px] text-text-muted">Loading instance…</p>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="pt-8">
        <EmptyState
          title="Instance not found"
          body="That instance is gone or the link is wrong."
          action={
            <PrimaryButton onClick={() => router.push("/dashboard/instances")}>
              Back to instances
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/instances")}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={14} /> Back to Instances
        </button>

        <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-[20px] font-medium tracking-tight text-white sm:text-[22px]">{instance.hostname}</h1>
              <StatusDot status={instance.status as "Running" | "Stopped" | "Error" | "Suspended" | "Creating" | "Paused"} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-text-muted">
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">{instance.plan}</span>
              <span aria-hidden>·</span>
              <span>{instance.os}</span>
              <span aria-hidden>·</span>
              <span>{instance.region}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {instance.status === "Paused" || instance.status === "SUSPENDED" ? (
              <PrimaryButton onClick={() => router.push("/dashboard/billing/wallet")}>
                Renew to Unpause
              </PrimaryButton>
            ) : !isRunningStatus(instance.status) ? (
              <PrimaryButton
                onClick={async () => {
                  try {
                    await api().post(`/v1/instances/${instance.id}/action`, { action: "START" });
                    toast.success(`${instance.hostname} starting`);
                  } catch {
                    toast.error("Action failed");
                  }
                }}
              >
                <Play size={14} weight="fill" /> Start
              </PrimaryButton>
            ) : (
              <SecondaryButton
                onClick={async () => {
                  try {
                    await api().post(`/v1/instances/${instance.id}/action`, { action: "STOP" });
                    toast.success(`${instance.hostname} stopping`);
                  } catch {
                    toast.error("Action failed");
                  }
                }}
              >
                <Stop size={14} weight="fill" /> Stop
              </SecondaryButton>
            )}
            {instance.status !== "Paused" && instance.status !== "SUSPENDED" && (
              <SecondaryButton onClick={() => setConfirm("rebuild")}>
                <ArrowClockwise size={14} /> Rebuild
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>

      {(instance.status === "Paused" || instance.status === "SUSPENDED") && (
        <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-[13px] text-text">
          <strong className="text-warning">Instance Paused.</strong> Your prepaid cycle has ended. Please fund your wallet and renew the subscription to restore access and avoid data loss.
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-border-subtle" role="tablist" aria-label="Instance sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
              tab === t.id
                ? "border-accent text-white"
                : "border-transparent text-text-muted hover:border-border hover:text-text-secondary"
            }`}
          >
            <t.icon size={14} weight={tab === t.id ? "fill" : "regular"} className={tab === t.id ? "text-accent" : "text-text-muted"} />
            {t.id}
          </button>
        ))}
      </div>

      <div className="pb-8">
        {tab === "Overview" && <OverviewTab instance={instance} plan={plan ?? null} />}
        {tab === "Console" && <ConsoleTab id={instance.id} ip={instance.sshHost} hostname={instance.hostname} status={instance.status} />}
        {tab === "Metrics" && <MetricsTab id={instance.id} planName={instance.plan} plan={plan ?? null} />}
        {tab === "Networking" && <NetworkingTab ip={instance.sshHost} />}
        {tab === "Backups" && <BackupsTab planName={instance.plan} />}
        {tab === "Settings" && (
          <SettingsTab
            instanceId={instance.id}
            hostname={instance.hostname}
            autoRenew={instance.autoRenew}
            onAutoRenewChange={(v) => setInstance((prev) => (prev ? { ...prev, autoRenew: v } : prev))}
            onRequestRebuild={() => setConfirm("rebuild")}
            onRequestDestroy={() => setConfirm("destroy")}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirm === "rebuild"}
        title={`Rebuild ${instance.hostname}?`}
        body="The operating system is reinstalled from the image and all data on the disk is destroyed. This action is irreversible."
        confirmLabel="Rebuild instance"
        onClose={() => setConfirm(null)}
        onConfirm={async () => { try { await api().post(`/v1/instances/${instance.id}/action`, { action: "REBUILD" }); toast.success(`${instance.hostname} rebuild started`); } catch { toast.error("Rebuild failed"); } setConfirm(null); }}
      />
      <ConfirmDialog
        open={confirm === "destroy"}
        title={`Destroy ${instance.hostname}?`}
        body="The instance and all of its data will be permanently erased from the server and cannot be recovered. Type the hostname to confirm."
        confirmLabel="Destroy instance"
        requireText={instance.hostname}
        onClose={() => setConfirm(null)}
        onConfirm={async () => { try { await api().del(`/v1/instances/${instance.id}`); toast.success(`${instance.hostname} destroyed`); router.push("/dashboard/instances"); } catch { toast.error("Failed to destroy instance"); setConfirm(null); } }}
      />
    </div>
  );
}

function OverviewTab({ instance, plan }: { instance: Instance; plan: Plan | null }) {
  const uptime = isRunningStatus(instance.status) ? hoursSince(instance.createdAt) : null;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-text-muted">Connection</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex-1"><CopyField value={instance.sshHost || "—"} label="Address" /></div>
            <div className="flex-1"><CopyField value={instance.sshPort ? String(instance.sshPort) : "22"} label="SSH Port" /></div>
            <div className="flex-1 sm:col-span-2"><CopyField value={sshCommand(instance.sshHost, instance.sshPort) ?? "—"} label="SSH Command" /></div>
            <div className="flex-1 sm:col-span-2"><CopyField value={sshCopyIdCommand(instance.sshHost, instance.sshPort) ?? "—"} label="SSH Copy ID" /></div>
            {instance.authMethod === "password" && instance.rootPassword ? (
              <div className="flex-1 sm:col-span-2"><CopyField value={instance.rootPassword} label="Root Password" /></div>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-text-muted">Configuration</h2>
          <DashCard padding={false} className="overflow-hidden">
            <dl className="divide-y divide-border-faint">
              <SpecRow k="Plan" v={instance.plan || "—"} mono />
              <SpecRow k="OS Image" v={instance.os || "—"} mono />
              <SpecRow k="Compute" v={plan ? `${plan.cpu} vCPU, ${plan.ramMb / 1024}GB RAM` : "—"} mono />
              <SpecRow k="Storage" v={plan ? `${plan.storageGb}GB NVMe SSD` : "—"} mono />
            </dl>
          </DashCard>
        </section>

        <section>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-text-muted">Lifecycle</h2>
          <DashCard padding={false} className="overflow-hidden">
            <dl className="divide-y divide-border-faint">
              <SpecRow k="Status" v={instance.status} />
              <SpecRow k="Region" v={instance.region || "—"} />
              <SpecRow k="Server" v={instance.node || "—"} mono />
              <SpecRow k="Created" v={instance.createdAt ? new Date(instance.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
              <SpecRow k="Uptime" v={uptime ?? "—"} mono />
            </dl>
          </DashCard>
        </section>
      </div>
    </div>
  );
}

function SpecRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-surface-hover/40 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-40 shrink-0 text-[13px] text-text-muted">{k}</dt>
      <dd className={`text-[13px] text-white ${mono ? "font-mono text-[12px]" : ""}`}>{v}</dd>
    </div>
  );
}

function hoursSince(iso: string): string {
  const h = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (h < 1) return "<1h";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

function ConsoleTab({ id, ip, hostname, status }: { id: string; ip: string; hostname: string; status: string }) {
  const [tokenInfo, setTokenInfo] = useState<{ token: string; expiresIn: number; namespace: string } | null>(null);
  const [connectStatus, setConnectStatus] = useState<"idle" | "fetching" | "ready" | "subscribed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isRunningStatus(status)) {
      setConnectStatus("error");
      setErrorMsg("Console is only available when the instance is running.");
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    const run = async () => {
      setConnectStatus("fetching");
      setErrorMsg(null);
      try {
        const data = await api().get(`/v1/instances/${id}/console-token`) as { token: string; expiresIn: number; namespace: string };
        if (cancelled) return;
        setTokenInfo(data);
        setConnectStatus("ready");

        const wsBase = process.env.NEXT_PUBLIC_WS_URL;
        if (wsBase) {
          const namespace = data.namespace || "/ws";
          socket = io(`${wsBase}${namespace}`, { withCredentials: true, transports: ["websocket", "polling"] });
          socket.on("connect", () => {
            socket?.emit("console.subscribe", { instanceId: id, token: data.token });
          });
          socket.on("instance.provisioning.progress", (payload: { instanceId?: string; step?: string }) => {
            if (payload?.instanceId === id && payload.step === "console-attached") {
              setConnectStatus("subscribed");
            }
          });
          socket.on("error", (err: { message?: string }) => {
            setConnectStatus("error");
            setErrorMsg(err?.message ?? "Console connection failed");
          });
          socket.on("connect_error", () => {
            setConnectStatus("ready");
            setErrorMsg("WebSocket unavailable — session token is still valid for 60s.");
          });
        }
      } catch (err) {
        if (cancelled) return;
        setConnectStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to fetch console token");
      }
    };

    void run();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [id, status]);

  return (
    <div className="max-w-4xl space-y-4">
      <DashCard className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface text-accent">
            <TerminalWindow size={18} weight="fill" />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-white">Console session</h2>
            <p className="font-mono text-[12px] text-text-muted">{hostname}{ip ? ` · ${ip}` : ""}</p>
          </div>
        </div>

        {connectStatus === "fetching" && <p className="text-[13px] text-text-muted">Requesting console token…</p>}
        {connectStatus === "ready" && (
          <p className="text-[13px] font-medium text-success">Console session ready ({tokenInfo?.expiresIn ?? 60}s)</p>
        )}
        {connectStatus === "subscribed" && (
          <p className="text-[13px] font-medium text-success">Connected — console channel attached</p>
        )}
        {errorMsg && <p className="text-[13px] text-danger">{errorMsg}</p>}

        {tokenInfo && (
          <div className="overflow-hidden rounded-md border border-border-faint">
            <dl className="divide-y divide-border-faint">
              <SpecRow k="Hostname" v={hostname} mono />
              <SpecRow k="IP" v={ip || "—"} mono />
              <SpecRow k="Namespace" v={tokenInfo.namespace} mono />
              <SpecRow k="Token TTL" v={`${tokenInfo.expiresIn}s`} mono />
            </dl>
          </div>
        )}

        <p className="text-[12px] leading-relaxed text-text-muted">
          Use SSH for a full interactive shell: <span className="font-mono text-text-secondary">{ip ? `ssh root@${ip}` : "ssh root@&lt;ip&gt;"}</span>.
          To install your public key for passwordless access, run <span className="font-mono text-text-secondary">{ip ? `ssh-copy-id -i ~/.ssh/id_ed25519.pub root@${ip}` : "ssh-copy-id -i ~/.ssh/id_ed25519.pub root@&lt;ip&gt;"}</span> from your local machine.
          The browser console attaches via a short-lived token; refresh this tab to renew.
        </p>
      </DashCard>
    </div>
  );
}

type Range = "1h" | "24h" | "7d";

function MiniChart({ points, color }: { points: number[]; color: string }) {
  const w = 260;
  const h = 56;
  if (points.length === 0) {
    return <div className="flex h-14 items-center justify-center text-[12px] text-text-muted">No data</div>;
  }
  const max = Math.max(...points, 1);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const line = points.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" role="img" aria-label="Resource trend chart">
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function MetricsTab({ id, planName, plan }: { id: string; planName: string; plan: Plan | null }) {
  const [range, setRange] = useState<Range>("24h");
  const [points, setPoints] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api().get(`/v1/instances/${id}/metrics?range=${range}`) as { range: string; points: MetricPoint[] };
        if (!cancelled) setPoints(Array.isArray(data.points) ? data.points : []);
      } catch {
        if (!cancelled) {
          setPoints([]);
          toast.error("Failed to load metrics");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [id, range]);

  const cpu = points.map((p) => p.cpuPct);
  const ram = points.map((p) => p.ramMb);
  const disk = points.map((p) => p.diskGb);
  const net = points.map((p) => p.networkMb);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[14px] font-medium text-white">Live metrics</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Resource usage on your {planName || "instance"} plan
            {plan ? ` (${plan.cpu}c / ${plan.ramMb / 1024}g)` : ""}.
          </p>
        </div>
        <SegmentedControl
          size="sm"
          value={range}
          onChange={setRange}
          options={[
            { value: "1h", label: "1H" },
            { value: "24h", label: "24H" },
            { value: "7d", label: "7D" },
          ]}
        />
      </div>

      {loading ? (
        <p className="text-[13px] text-text-muted">Loading metrics…</p>
      ) : points.length === 0 ? (
        <DashCard className="py-10 text-center">
          <p className="text-[13px] font-medium text-white">No metrics yet</p>
          <p className="mt-2 text-[13px] text-text-muted">Samples appear once our server starts reporting usage for this range.</p>
        </DashCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricChartCard label="CPU Utilization" peakLabel={`${Math.round(peak(cpu))}%`} color="var(--accent)" points={cpu} />
          <MetricChartCard label="Memory Usage" peakLabel={`${formatPeak(peak(ram), "MB")}`} color="var(--info)" points={ram} />
          <MetricChartCard label="Disk Usage" peakLabel={`${formatPeak(peak(disk), "GB")}`} color="var(--warning)" points={disk} />
          <MetricChartCard label="Network Traffic" peakLabel={`${formatPeak(peak(net), "MB")}`} color="var(--text)" points={net} />
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Resource usage · range {range}</p>
    </div>
  );
}

function peak(points: number[]): number {
  return points.reduce((a, b) => Math.max(a, b), 0);
}

function formatPeak(value: number, unit: "MB" | "GB"): string {
  if (unit === "MB" && value >= 1024) return `${(value / 1024).toFixed(1)} GB`;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

function MetricChartCard({ label, peakLabel, color, points }: { label: string; peakLabel: string; color: string; points: number[] }) {
  return (
    <DashCard padding={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-faint px-4 py-3">
        <span className="text-[13px] font-medium text-white">{label}</span>
        <span className="font-mono text-[11px] text-text-muted">Peak: {peakLabel}</span>
      </div>
      <div className="bg-bg/40 p-4"><MiniChart points={points} color={color} /></div>
    </DashCard>
  );
}

function NetworkingTab({ ip }: { ip: string }) {
  return (
    <div className="max-w-4xl space-y-4">
      <div className="max-w-sm">
        <CopyField value={ip || "—"} label="Public IP Address" />
      </div>

      <div>
        <h2 className="text-[14px] font-medium text-white">Platform network defaults</h2>
        <p className="mt-1 text-[13px] text-text-muted">These are documented platform defaults for all instances — not live per-instance firewall rules.</p>
      </div>

      <DashCard padding={false} className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-medium uppercase tracking-wider text-text-muted">
              <th className="px-4 py-2.5 font-medium">Protocol</th>
              <th className="px-4 py-2.5 font-medium">Port Range</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
              <th className="px-4 py-2.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-faint">
            <FirewallRow p="TCP" port="22" rule="Allow" note="SSH access (platform default)" />
            <FirewallRow p="TCP" port="25" rule="Block" note="Outbound SMTP blocked (anti-spam)" block />
          </tbody>
        </table>
      </DashCard>
      <p className="text-[13px] text-text-muted">Per-instance firewall management is not available yet. Custom rules cannot be edited from this panel.</p>
    </div>
  );
}

function FirewallRow({ p, port, rule, note, block }: { p: string; port: string; rule: string; note: string; block?: boolean }) {
  return (
    <tr className={`transition-colors hover:bg-surface-hover/40 ${block ? "bg-danger/5" : ""}`}>
      <td className={`px-4 py-3 font-mono text-[12px] ${block ? "text-danger" : "text-white"}`}>{p}</td>
      <td className={`px-4 py-3 font-mono text-[12px] ${block ? "text-danger" : "text-white"}`}>{port}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${block ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>{rule}</span>
      </td>
      <td className={`px-4 py-3 text-[12px] ${block ? "text-danger/80" : "text-text-muted"}`}>{note}</td>
    </tr>
  );
}

function BackupsTab({ planName }: { planName: string }) {
  return (
    <DashCard className="max-w-xl py-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted">
        <HardDrive size={20} weight="fill" />
      </div>
      <h2 className="text-[14px] font-medium text-white">Backups unavailable</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
        Backups are not available yet{planName ? ` on the ${planName} plan` : " on this plan"}. Snapshot scheduling and restore will appear here when the backups API ships.
      </p>
    </DashCard>
  );
}

function SettingsTab({
  instanceId,
  hostname,
  autoRenew,
  onAutoRenewChange,
  onRequestRebuild,
  onRequestDestroy,
}: {
  instanceId: string;
  hostname: string;
  autoRenew: boolean;
  onAutoRenewChange: (v: boolean) => void;
  onRequestRebuild: () => void;
  onRequestDestroy: () => void;
}) {
  const [name, setName] = useState(hostname);
  const [renewing, setRenewing] = useState(false);
  const valid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name.trim()) && name.trim().length >= 3 && name.trim().length <= 24;

  const toggleAutoRenew = async () => {
    const next = !autoRenew;
    setRenewing(true);
    try {
      await api().patch(`/v1/instances/${instanceId}`, { autoRenew: next });
      onAutoRenewChange(next);
      toast.success(next ? "Auto-renew enabled" : "Auto-renew disabled");
    } catch {
      toast.error("Failed to update auto-renew");
    } finally {
      setRenewing(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <h2 className="mb-3 text-[14px] font-medium text-white">Rename instance</h2>
        <DashCard>
          <label htmlFor="rename" className="mb-2 block text-[13px] text-text-muted">Instance Hostname</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex h-9 flex-1 items-center rounded-sm border border-border-secondary bg-control px-3 focus-within:border-border-hover">
              <input
                id="rename"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                spellCheck={false}
                className="w-full bg-transparent font-mono text-[13px] text-text focus:outline-none"
              />
              <span className="font-mono text-[12px] text-text-muted">.nairacloud.app</span>
            </div>
            <PrimaryButton
              disabled={!valid || name.trim() === hostname}
              onClick={async () => {
                try {
                  await api().patch(`/v1/instances/${instanceId}`, { hostname: name.trim() });
                  toast.success(`Renamed to ${name.trim()}.nairacloud.app`);
                } catch {
                  toast.error("Rename failed");
                }
              }}
            >
              Save changes
            </PrimaryButton>
          </div>
        </DashCard>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-medium text-white">Billing & Renewal</h2>
        <DashCard className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[13px] font-medium text-white">Auto-Renew Subscription</h3>
            <p className="mt-1 max-w-sm text-[13px] text-text-muted">Automatically deduct the monthly fee from your Wallet balance to prevent the instance from pausing.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoRenew}
            disabled={renewing}
            onClick={() => void toggleAutoRenew()}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 ${autoRenew ? "bg-accent" : "bg-border"}`}
          >
            <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoRenew ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </DashCard>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-medium text-danger">Danger Zone</h2>
        <div className="rounded-md border border-danger/30 bg-danger/5">
          <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[13px] font-medium text-white">Rebuild OS</h3>
              <p className="mt-1 text-[13px] text-text-muted">Reinstall the operating system. <strong className="text-danger">Disk data will be permanently destroyed.</strong></p>
            </div>
            <SecondaryButton onClick={onRequestRebuild} className="shrink-0 border-danger/40 text-danger hover:border-danger hover:bg-danger/10">
              Rebuild...
            </SecondaryButton>
          </div>
          <div className="border-t border-danger/20" />
          <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[13px] font-medium text-danger">Destroy instance</h3>
              <p className="mt-1 text-[13px] text-text-muted">Permanently delete the instance and all its data. <strong className="text-danger">This cannot be undone.</strong></p>
            </div>
            <button
              type="button"
              onClick={onRequestDestroy}
              className="press inline-flex h-9 shrink-0 items-center justify-center rounded-sm bg-danger px-3.5 text-[13px] font-medium text-bg transition-colors hover:opacity-90"
            >
              Destroy...
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
