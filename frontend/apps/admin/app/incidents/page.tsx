"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WarningOctagon, Plus, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";
import { PageHead, Pill, Field, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost, btnPrimary } from "@/components/ui";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";

type Incident = {
  id: string;
  title: string;
  status: string;
  component: string;
  severity?: "low" | "medium" | "high";
  createdAt?: string;
  startedAt?: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  message?: string;
  summary?: string;
};

const STATUS_TONE: Record<string, "warn" | "info" | "accent" | "muted"> = {
  open: "warn",
  Open: "warn",
  investigating: "info",
  Investigating: "info",
  resolved: "accent",
  Resolved: "accent",
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [component, setComponent] = useState("compute");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [message, setMessage] = useState("");

  const loadIncidents = async () => {
    try {
      const data = (await api().get("/v1/admin/incidents")) as Incident[];
      setIncidents(data ?? []);
    } catch (err) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIncidents();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return toast.error("Title is required");
    try {
      await api().post("/v1/admin/incidents", {
        title: title.trim(),
        component,
        status: "investigating",
        message: message.trim(),
      });
      toast.success("Incident published", {
        description: `Live on the public status page (${component}).`,
      });
      await loadIncidents();
      setCreating(false);
      setTitle("");
      setMessage("");
    } catch (err) {
      toast.error("Failed to create incident");
    }
  };

  const handleResolve = async (id: string, incidentTitle: string) => {
    try {
      await api().patch(`/v1/admin/incidents/${id}`, { status: "resolved" });
      toast.success(`Resolved: ${incidentTitle}`);
      await loadIncidents();
    } catch (err) {
      toast.error("Resolve failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Incident Operations"
        sub="System disruptions, degraded nodes, and scheduled maintenance. Active incidents automatically sync with the public status page."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadIncidents();
              }}
              className={btnGhost}
            >
              <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
              <Plus size={14} weight="bold" />
              <span>New Incident</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={36} className="text-accent" />}
          title="All systems operational"
          description="Zero incidents currently recorded. Broadcast an incident when nodes, APIs, or billing experience service degradation."
          action={
            <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
              <Plus size={14} weight="bold" />
              <span>Broadcast Incident</span>
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {incidents.map((i) => {
            const isResolved = (i.status ?? "").toLowerCase() === "resolved";
            const tone = STATUS_TONE[i.status] ?? "warn";
            const dateStr = i.startedAt ?? i.createdAt;

            return (
              <article
                key={i.id}
                className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm transition-all hover:border-border-hover"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-text">{i.title}</h2>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <span className="bg-surface-hover px-2 py-0.5 rounded border border-border/60 font-bold mr-2 text-text">
                        {i.component}
                      </span>
                      {dateStr ? `OPENED ${new Date(dateStr).toLocaleString("en-NG")}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Pill tone={tone} dot>
                      {i.status}
                    </Pill>
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => void handleResolve(i.id, i.title)}
                        className="press rounded-md border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-accent/20 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                <p className="max-w-3xl text-sm leading-relaxed text-text/90 mb-4">
                  {i.message || i.summary || "No description provided."}
                </p>

                <div className="pt-3 border-t border-border/40 font-mono text-[10px] text-text-muted flex justify-between">
                  <span>
                    UPDATED: {i.updatedAt ? new Date(i.updatedAt).toLocaleString("en-NG") : "—"}
                  </span>
                  {i.resolvedAt && (
                    <span className="text-accent font-semibold">
                      RESOLVED: {new Date(i.resolvedAt).toLocaleString("en-NG")}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* New Incident Modal */}
      <Modal
        open={creating}
        title="Broadcast System Incident"
        onClose={() => setCreating(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="button" onClick={handleCreate} className={btnPrimary}>
              Publish Incident
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Incident Headline">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node-01 Agent Latency Spike"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Component Affected">
              <select value={component} onChange={(e) => setComponent(e.target.value)} className={selectCls}>
                <option value="compute">Compute Nodes (VMs)</option>
                <option value="api">Control Plane API</option>
                <option value="billing">Paystack & Wallet Billing</option>
                <option value="networking">Bridge Networking</option>
              </select>
            </Field>

            <Field label="Severity">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className={selectCls}
              >
                <option value="low">Low (Minor Impact)</option>
                <option value="medium">Medium (Degraded Performance)</option>
                <option value="high">High (Outage / Disruption)</option>
              </select>
            </Field>
          </div>

          <Field label="Public Status Description">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the incident, engineering response actions, and estimated resolution timeline..."
              className={inputCls}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}