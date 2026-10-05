"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  MagnifyingGlass,
  ArrowClockwise,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Cloud,
} from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, RTable, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost } from "@/components/ui";
import { api } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt?: string;
  joinedAt?: string;
  lastLoginAt?: string;
  instanceCount?: number;
  walletBalance?: number;
  mrrNgn?: number;
  openTickets?: number;
  _count?: { instances?: number };
};

const STATUS_TONE: Record<string, "accent" | "warn" | "danger" | "muted"> = {
  ACTIVE: "accent",
  active: "accent",
  PAST_DUE: "warn",
  past_due: "warn",
  SUSPENDED: "danger",
  suspended: "danger",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const loadData = async () => {
    try {
      const data = (await api().get("/v1/admin/customers")) as {
        items: Customer[];
        meta?: { page: number; limit: number; total: number };
      };
      setCustomers(data.items ?? []);
    } catch (err) {
      toast.error("Failed to load customer accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return customers.filter((c) => {
      const st = (c.status ?? "").toLowerCase();
      if (status !== "all" && st !== status.toLowerCase()) return false;
      if (ql && !(c.name?.toLowerCase().includes(ql) || c.email?.toLowerCase().includes(ql) || c.id.includes(ql))) {
        return false;
      }
      return true;
    });
  }, [customers, q, status]);

  return (
    <div className="space-y-6">
      <PageHead
        title="Customer Directory"
        sub="All registered developers and enterprise accounts on NairaCloud. Monitor active VMs, wallet balances, and user statuses."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadData();
            }}
            className={btnGhost}
          >
            <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Directory</span>
          </button>
        }
      />

      {/* Filter Row */}
      <section
        aria-label="Filters"
        className="grid gap-3 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Search User
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search by name, email, or user ID..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </section>

      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>
          SHOWING <strong className="text-text">{rows.length}</strong> OF {customers.length} CUSTOMERS
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users size={36} />}
          title="No customers match criteria"
          description="Try broadening your search term or selecting All Accounts."
        />
      ) : (
        <RTable
          head={["Customer", "Status", "VM Instances", "Wallet Balance", "Joined Date", ""]}
          rows={rows.map((c) => {
            const tone = STATUS_TONE[c.status] ?? "muted";
            const instancesCount = c.instanceCount ?? c._count?.instances ?? 0;
            const joined = c.createdAt ?? c.joinedAt;

            return [
              {
                v: (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface border border-border/80 font-mono text-xs font-bold text-accent">
                      {(c.name?.[0] || c.email?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-semibold text-text hover:text-accent transition-colors truncate block"
                      >
                        {c.name || "Customer"}
                      </Link>
                      <p className="text-xs text-text-muted truncate max-w-[200px]">{c.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                v: (
                  <Pill tone={tone} dot>
                    {c.status.replace("_", " ")}
                  </Pill>
                ),
              },
              {
                v: (
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-text">
                    <Cloud size={14} className="text-text-muted" />
                    <span>{instancesCount} VMs</span>
                  </div>
                ),
              },
              {
                v: (
                  <span className="font-mono text-sm font-bold text-text tabular-nums">
                    {c.walletBalance != null ? formatNaira(c.walletBalance) : "—"}
                  </span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {joined
                      ? new Date(joined).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                ),
              },
              {
                v: (
                  <Link
                    href={`/customers/${c.id}`}
                    className="press inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface/40 px-3 py-1 text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={12} weight="bold" />
                  </Link>
                ),
              },
            ];
          })}
        />
      )}
    </div>
  );
}