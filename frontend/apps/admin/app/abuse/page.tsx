"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldWarning, CheckCircle, ArrowsClockwise, User, Cloud } from "@phosphor-icons/react";
import { PageHead, Pill, CopyBadge, TableSkeleton, EmptyState, btnGhost, btnPrimary, btnDanger } from "@/components/ui";
import { api } from "@/lib/api";

type AbuseFlag = {
  id: string;
  instanceId?: string;
  userId?: string;
  customerId?: string;
  targetLabel?: string;
  kind?: string;
  reason?: string;
  severity?: string;
  status: string;
  createdAt?: string;
  flaggedAt?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  evidence?: any;
};

export default function AbusePage() {
  const [flags, setFlags] = useState<AbuseFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFlags = async () => {
    try {
      const data = (await api().get("/v1/admin/abuse-queue")) as {
        items: AbuseFlag[];
        meta?: { page: number; limit: number; total: number };
      };
      setFlags(data.items ?? []);
    } catch (err) {
      toast.error("Failed to load abuse cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFlags();
  }, []);

  const handleResolve = async (id: string, reason: string) => {
    try {
      await api().post(`/v1/admin/abuse-queue/${id}/resolve`, {});
      toast.success(`Abuse case resolved: ${reason}`);
      await loadFlags();
    } catch (err) {
      toast.error("Failed to resolve abuse case");
    }
  };

  const handleSuspendInstance = async (instanceId: string) => {
    try {
      await api().post(`/v1/admin/instances/${instanceId}/suspend`, {});
      toast.success(`Target instance ${instanceId} suspended`);
      await loadFlags();
    } catch {
      toast.error("Failed to suspend instance");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="SecOps & Abuse Queue"
        sub="Automated threat monitoring, port scans, outbound volumetric floods, and mining heuristics detected by node daemons."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadFlags();
            }}
            className={btnGhost}
          >
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Queue</span>
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : flags.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={36} className="text-accent" />}
          title="Abuse queue is clean"
          description="Zero flagged virtual machines or suspicious traffic incidents detected by node heuristics."
        />
      ) : (
        <div className="space-y-4">
          {flags.map((f) => {
            const isOpen = (f.status ?? "").toUpperCase() === "OPEN";
            const dateStr = f.createdAt ?? f.flaggedAt;
            const targetInstance = f.instanceId ?? f.targetLabel;
            const targetUser = f.userId ?? f.customerId;
            const reason = f.reason ?? f.kind ?? "Suspicious network pattern";

            // Evidence parsing
            const evidenceStr =
              typeof f.evidence === "string"
                ? f.evidence
                : f.evidence?.report
                ? JSON.stringify(f.evidence.report, null, 2)
                : f.evidence
                ? JSON.stringify(f.evidence, null, 2)
                : "No telemetry payload attached.";

            return (
              <article
                key={f.id}
                className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm transition-all hover:border-border-hover"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-danger bg-danger/10 border border-danger/30 px-2 py-0.5 rounded">
                        {f.severity || "HIGH PRIORITY"}
                      </span>
                      <h2 className="text-base font-bold text-text font-mono">{reason}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted mt-2">
                      {targetInstance && (
                        <div className="flex items-center gap-1">
                          <Cloud size={13} />
                          <span>VM:</span>
                          <Link href={`/instances/${targetInstance}`} className="text-accent hover:underline">
                            {targetInstance}
                          </Link>
                        </div>
                      )}
                      {targetUser && (
                        <div className="flex items-center gap-1">
                          <User size={13} />
                          <span>User:</span>
                          <Link href={`/customers/${targetUser}`} className="text-accent hover:underline">
                            {targetUser}
                          </Link>
                        </div>
                      )}
                      {dateStr && (
                        <span>
                          FLAGGED: {new Date(dateStr).toLocaleString("en-NG")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Pill tone={isOpen ? "danger" : "accent"} dot>
                      {f.status}
                    </Pill>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="space-y-1.5 mb-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Automated Detection Evidence:
                  </span>
                  <pre className="rounded-lg border border-border/60 bg-bg p-3.5 font-mono text-xs text-text-muted leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {evidenceStr}
                  </pre>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                  {isOpen ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {targetInstance && (
                        <button
                          type="button"
                          onClick={() => void handleSuspendInstance(targetInstance)}
                          className="press rounded-md border border-danger/50 bg-danger/10 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-danger hover:bg-danger/20 transition-colors"
                        >
                          Suspend Target VM
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleResolve(f.id, reason)}
                        className="press rounded-md border border-border/70 bg-surface/40 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-text hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        Dismiss / Mark Resolved
                      </button>
                    </div>
                  ) : (
                    <p className="font-mono text-[11px] text-accent font-semibold flex items-center gap-1.5">
                      <CheckCircle size={14} weight="fill" />
                      <span>Case marked resolved in audit records.</span>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}