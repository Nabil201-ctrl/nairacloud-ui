"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatNaira } from "@nairacloud/ui";
import { Modal } from "@/components/modal";
import { ProbeAgentConsole } from "@/components/probe-agent-console";
import { api } from "@/lib/api";
import type { ProbeProgressData } from "@/hooks/use-realtime";

type ProbeStep = { cmd: string; out: string; code: number };
type CapacitySlice = { cpu: number; ramMb: number; storageGb: number };

type ProbeResult = {
  ip: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  os?: string;
  arch?: string;
  dockerInstalled: boolean;
  containers: { id: string; name: string; image: string; status: string }[];
  useCase?: string;
  floor?: CapacitySlice;
  ceiling?: CapacitySlice;
  transcript: ProbeStep[];
};

type CatalogPlan = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: string;
};

function roundCpu(n: number): number {
  return Math.round(n * 100) / 100;
}

function fits(plan: CatalogPlan, sellable: CapacitySlice): boolean {
  return plan.cpu <= sellable.cpu + 1e-9 && plan.ramMb <= sellable.ramMb && plan.storageGb <= sellable.storageGb;
}

export function OnboardModal({
  open,
  onClose,
  onDone,
  liveEvents = [],
  liveConnected = false,
  liveError = null,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  liveEvents?: ProbeProgressData[];
  liveConnected?: boolean;
  liveError?: string | null;
}) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState(22);
  const [user, setUser] = useState("root");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [catalog, setCatalog] = useState<CatalogPlan[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [floor, setFloor] = useState<CapacitySlice>({ cpu: 0.25, ramMb: 512, storageGb: 5 });
  const [ceiling, setCeiling] = useState<CapacitySlice>({ cpu: 1, ramMb: 1024, storageGb: 20 });

  const field = "w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none";

  useEffect(() => {
    if (!open) return;
    void api()
      .get("/v1/admin/plans")
      .then((data) => {
        const plans = (data as CatalogPlan[]) ?? [];
        setCatalog(plans.filter((p) => p.status !== "DISABLED"));
      })
      .catch(() => {
        toast.error("Could not load catalog plans");
      });
  }, [open]);

  const sellable = useMemo((): CapacitySlice => {
    if (!probe) return { cpu: 0, ramMb: 0, storageGb: 0 };
    return {
      cpu: roundCpu(Math.max(0, Math.min(ceiling.cpu, probe.cpu - floor.cpu))),
      ramMb: Math.max(0, Math.min(ceiling.ramMb, probe.ramMb - floor.ramMb)),
      storageGb: Math.max(0, Math.min(ceiling.storageGb, probe.storageGb - floor.storageGb)),
    };
  }, [probe, floor, ceiling]);

  const catalogRows = useMemo(() => {
    return catalog.map((p) => ({
      plan: p,
      fits: fits(p, sellable),
      maxInstances:
        p.cpu > 0 && p.ramMb > 0 && p.storageGb > 0
          ? Math.min(
              Math.floor(sellable.cpu / p.cpu),
              Math.floor(sellable.ramMb / p.ramMb),
              Math.floor(sellable.storageGb / p.storageGb),
            )
          : 0,
    }));
  }, [catalog, sellable]);

  useEffect(() => {
    // Drop selections that no longer fit after floor/ceiling changes.
    setSelectedPlanIds((ids) => ids.filter((id) => catalogRows.some((r) => r.plan.id === id && r.fits && r.maxInstances >= 1)));
  }, [catalogRows]);

  const togglePlan = (id: string, enabled: boolean) => {
    if (!enabled) return;
    setSelectedPlanIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const doProbe = async () => {
    if (!ip || !user) return toast.error("IP and SSH user are required");
    setBusy(true);
    try {
      const r = (await api().post("/v1/admin/nodes/probe", {
        ip,
        sshPort: port,
        sshUser: user,
        sshPassword: password || undefined,
      })) as ProbeResult;
      setProbe(r);
      const nextFloor = r.floor ?? {
        cpu: roundCpu(Math.max(0.25, r.cpu * 0.15)),
        ramMb: Math.max(512, Math.round(r.ramMb * 0.2)),
        storageGb: Math.max(5, Math.round(r.storageGb * 0.1)),
      };
      const nextCeiling = r.ceiling ?? {
        cpu: roundCpu(Math.max(0.25, r.cpu - nextFloor.cpu)),
        ramMb: Math.max(256, r.ramMb - nextFloor.ramMb),
        storageGb: Math.max(5, r.storageGb - nextFloor.storageGb),
      };
      setFloor(nextFloor);
      setCeiling(nextCeiling);
      setSelectedPlanIds([]);
      setOnboardError(null);
      setShowLog(true);
      toast.success(`Probed ${r.ip} — ${r.cpu}vCPU / ${r.ramMb}MB / ${r.storageGb}GB`);
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "Probe failed — check IP/password";
      setOnboardError(message);
      toast.error(message);
    }
    setBusy(false);
  };

  const onboard = async () => {
    if (!probe) return;
    if (selectedPlanIds.length === 0) return toast.error("Select at least one catalog plan this node can sell");
    const chosen = catalog.filter((p) => selectedPlanIds.includes(p.id));
    const nodeName = (name || `box-${ip.replace(/[^a-zA-Z0-9]/g, "-")}`).slice(0, 64);
    setBusy(true);
    setOnboardError(null);
    try {
      await api().post("/v1/admin/nodes/onboard", {
        name: nodeName,
        provider: "manual",
        region: "probed",
        ip,
        sshPort: port,
        sshUser: user,
        sshPassword: password || undefined,
        cpu: probe.cpu,
        ramMb: probe.ramMb,
        storageGb: probe.storageGb,
        reservedCpu: floor.cpu,
        reservedRamMb: floor.ramMb,
        reservedStorageGb: floor.storageGb,
        sellPlan: {
          mode: chosen.length === 1 ? "one" : "catalog",
          label: chosen.map((p) => p.name).join(", "),
          planIds: chosen.map((p) => p.id),
          plans: chosen.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            cpu: p.cpu,
            ramMb: p.ramMb,
            storageGb: p.storageGb,
            priceNgn: p.priceNgn,
          })),
          floor,
          ceiling,
          sellable,
        },
        commandLog: probe.transcript,
      });
      toast.success("Node queued — install log will show on the node page");
      setIp("");
      setPassword("");
      setName("");
      setProbe(null);
      setSelectedPlanIds([]);
      setOnboardError(null);
      onClose();
      onDone();
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Onboard failed";
      setOnboardError(message);
      setShowLog(true);
      toast.error(message);
    }
    setBusy(false);
  };

  return (
    <Modal
      open={open}
      title="Add node"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="press rounded-sm border border-border px-4 py-2 text-sm hover:border-border-hover">Cancel</button>
          <button type="button" onClick={onboard} disabled={busy || !probe || selectedPlanIds.length === 0} className="press rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover">Onboard</button>
        </>
      }
    >
      <div className="space-y-3">
        <input placeholder="Node name (optional)" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="IP or hostname · e.g. 192.0.2.10" value={ip} onChange={(e) => setIp(e.target.value)} className={field} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value) || 22)} className={field} placeholder="Port" />
          </div>
          <input placeholder="SSH user · root" value={user} onChange={(e) => setUser(e.target.value)} className={field} />
          <input type="password" placeholder="SSH password (or leave blank for key)" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </div>
        <button type="button" onClick={doProbe} disabled={busy} className="press rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-surface hover:text-info transition-colors">
          {busy ? "Probing…" : "Probe box (detect specs)"}
        </button>
        <p className="text-[11px] leading-relaxed text-text-muted">
          Groq reads this form while probing. If the host asks for a password, username, yes/no, or a host-key fingerprint, it types the values above. The password is never shown in the live log.
        </p>
        {(busy || liveEvents.some((e) => e.nodeId === ip)) && ip && (
          <ProbeAgentConsole
            name={ip}
            events={liveEvents.filter((e) => e.nodeId === ip)}
            connected={liveConnected}
            connectionError={liveError}
          />
        )}
      </div>

      {probe && (
        <div className="mt-4 space-y-3">
          <p className="font-mono text-xs text-text-muted">
            {probe.cpu}vCPU · {probe.ramMb}MB · {probe.storageGb}GB · {probe.os ?? ""} {probe.arch ?? ""}
          </p>
          <p className="text-sm text-text-muted">
            Docker {probe.dockerInstalled ? "installed" : "not detected"}
            {probe.containers.length > 0 ? ` · ${probe.containers.length} live container(s)` : " · no containers"}
          </p>
          {probe.useCase && <p className="text-sm text-text-muted">{probe.useCase}</p>}

          <div className="rounded-sm border border-border bg-surface/30 p-3 space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">Floor &amp; ceiling</p>
            <p className="text-[11px] text-text-muted">
              Floor stays on the host for the OS and live containers. Ceiling is the most you will sell from this box. Sellable right now: {sellable.cpu}vCPU · {sellable.ramMb}MB · {sellable.storageGb}GB.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-[11px] text-text-muted">Floor CPU
                <input type="number" step={0.25} min={0} value={floor.cpu} onChange={(e) => setFloor({ ...floor, cpu: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
              <label className="text-[11px] text-text-muted">Floor RAM MB
                <input type="number" min={0} value={floor.ramMb} onChange={(e) => setFloor({ ...floor, ramMb: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
              <label className="text-[11px] text-text-muted">Floor disk GB
                <input type="number" min={0} value={floor.storageGb} onChange={(e) => setFloor({ ...floor, storageGb: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
              <label className="text-[11px] text-text-muted">Ceiling CPU
                <input type="number" step={0.25} min={0} value={ceiling.cpu} onChange={(e) => setCeiling({ ...ceiling, cpu: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
              <label className="text-[11px] text-text-muted">Ceiling RAM MB
                <input type="number" min={0} value={ceiling.ramMb} onChange={(e) => setCeiling({ ...ceiling, ramMb: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
              <label className="text-[11px] text-text-muted">Ceiling disk GB
                <input type="number" min={0} value={ceiling.storageGb} onChange={(e) => setCeiling({ ...ceiling, storageGb: Number(e.target.value) || 0 })} className={`${field} mt-1`} />
              </label>
            </div>
          </div>

          {onboardError && (
            <div className="rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              <p className="font-semibold">Onboard failed</p>
              <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{onboardError}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            className="press rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-surface hover:text-info transition-colors"
          >
            {showLog ? "Hide probe log" : "Show probe log"}
          </button>
          {showLog && (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-surface/30 p-3 font-mono text-xs text-text-muted">
              {probe.transcript.length === 0 ? (
                <span>No commands were recorded.</span>
              ) : (
                probe.transcript.map((t, i) => (
                  <div key={i} className="mb-2">
                    <div><span className="text-accent">$ </span><span className="text-text">{t.cmd}</span></div>
                    <div className={t.code === 0 ? "text-text-muted" : "text-danger"}>{t.out || "(no output)"}{t.code !== 0 ? ` [exit ${t.code}]` : ""}</div>
                  </div>
                ))
              )}
            </pre>
          )}

          <div className="space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">Catalog plans on this node</p>
            <p className="text-[11px] text-text-muted">
              These are your current Plan Matrix sizes. Selecting them here only decides what this host can sell — the plans themselves are not changed. Edit or add plans under Plan Matrix.
            </p>
            {catalogRows.length === 0 ? (
              <p className="text-sm text-warning">No catalog plans loaded. Open Plan Matrix and create or refresh plans, then reopen Add node.</p>
            ) : (
              catalogRows.map(({ plan: p, fits: ok, maxInstances }) => {
                const checked = selectedPlanIds.includes(p.id);
                const enabled = ok && maxInstances >= 1;
                return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 rounded-sm border p-3 transition-colors ${
                      !enabled
                        ? "cursor-not-allowed border-border/50 opacity-55"
                        : checked
                          ? "cursor-pointer border-accent bg-accent/5"
                          : "cursor-pointer border-border hover:border-border-hover"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-accent"
                      checked={checked}
                      disabled={!enabled}
                      onChange={() => togglePlan(p.id, enabled)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold text-text">{p.name}</span>
                        <span className="font-mono text-[11px] text-text-muted">{p.slug}</span>
                        <span className="font-mono text-[11px] text-text">{p.priceNgn === 0 ? "Free" : `${formatNaira(p.priceNgn)}/mo`}</span>
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-text-muted">
                        {p.cpu}vCPU · {p.ramMb}MB · {p.storageGb}GB
                        {enabled ? ` · up to ${maxInstances} on this host` : " · does not fit sellable capacity"}
                      </span>
                      {p.description && <span className="mt-0.5 block text-[11px] text-text-muted">{p.description}</span>}
                    </span>
                  </label>
                );
              })
            )}
            {catalogRows.some((r) => r.fits && r.maxInstances >= 1) === false && catalogRows.length > 0 && (
              <p className="text-sm text-warning">No catalog plan fits this floor/ceiling. Lower the floor, raise the ceiling, or add a smaller plan in Plan Matrix.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
