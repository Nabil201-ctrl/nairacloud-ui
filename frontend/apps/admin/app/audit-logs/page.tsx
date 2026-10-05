"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClockCounterClockwise, DownloadSimple, ArrowsClockwise, User, Globe } from "@phosphor-icons/react";
import { PageHead, Pill, CopyBadge, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost } from "@/components/ui";
import { api } from "@/lib/api";

type AuditEntry = {
  id: string;
  userId?: string;
  actor?: string;
  action: string;
  resource?: string;
  target?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  at?: string;
};

const ACTIONS = [
  "admin.instance",
  "admin.node",
  "admin.plan",
  "admin.payment",
  "admin.customer",
  "admin.abuse",
  "admin.incident",
  "admin.settings",
  "instance.create",
  "instance.delete",
  "instance.action",
  "system",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const loadLogs = async () => {
    try {
      const data = (await api().get("/v1/admin/audit-logs")) as {
        items?: AuditEntry[];
        meta?: { page: number; limit: number; total: number };
      } | AuditEntry[];

      const items = Array.isArray(data) ? data : data.items ?? [];
      setLogs(items);
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return logs.filter((e) => {
      const actor = (e.userId || e.actor || "").toLowerCase();
      const action = (e.action || "").toLowerCase();
      const target = (e.resource || e.target || "").toLowerCase();
      const ip = (e.ip || "").toLowerCase();

      if (actionFilter !== "all" && !action.includes(actionFilter.toLowerCase())) return false;
      if (ql && !(actor.includes(ql) || action.includes(ql) || target.includes(ql) || ip.includes(ql))) {
        return false;
      }
      return true;
    });
  }, [logs, q, actionFilter]);

  const exportCsv = () => {
    const head = "timestamp,actor,action,resource,ip";
    const csvRows = logs.map((e) =>
      [
        e.timestamp || e.at || "",
        e.userId || e.actor || "",
        e.action || "",
        e.resource || e.target || "",
        e.ip || "",
      ]
        .map((v) => `"${v}"`)
        .join(",")
    );
    const blob = new Blob([[head, ...csvRows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nairacloud-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit trail exported as CSV");
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Immutable Audit Trail"
        sub="Every administrative mutation, resource allocation, and security action logged cryptographically with actor ID, IP origin, and timestamp."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadLogs();
              }}
              className={btnGhost}
            >
              <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={exportCsv} className={btnGhost}>
              <DownloadSimple size={14} weight="bold" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Filter Strip */}
      <section
        aria-label="Filters"
        className="grid gap-3 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Search Trail
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="actor ID, action, resource, IP..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Action Domain
          </label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={selectCls}>
            <option value="all">All Mutation Events</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>SHOWING {rows.length} AUDIT LOG ENTRIES</span>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={36} />}
          title="No audit entries found"
          description="Zero audit log events match your filter query."
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-surface/30 shadow-sm overflow-hidden">
          <ul className="divide-y divide-border/40 font-mono text-xs">
            {rows.map((e) => {
              const timeStr = e.timestamp || e.at;
              const actor = e.userId || e.actor || "system";
              const target = e.resource || e.target || "resource";

              return (
                <li
                  key={e.id}
                  className="flex flex-wrap items-start justify-between gap-4 p-4 transition-colors hover:bg-surface/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-accent/10 border border-accent/30 px-2 py-0.5 text-[11px] font-bold text-accent">
                        {e.action}
                      </span>
                      <span className="text-text-muted/60">&rarr;</span>
                      <span className="font-semibold text-text">{target}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        <span>Actor: {actor}</span>
                      </span>
                      {e.ip && (
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          <span>IP: {e.ip}</span>
                        </span>
                      )}
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <span className="text-text-muted/60 truncate max-w-sm">
                          meta: {JSON.stringify(e.metadata)}
                        </span>
                      )}
                    </div>
                  </div>

                  <time className="shrink-0 text-[11px] text-text-muted pt-0.5">
                    {timeStr ? new Date(timeStr).toLocaleString("en-NG") : "—"}
                  </time>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}