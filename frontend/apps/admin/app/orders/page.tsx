"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  MagnifyingGlass,
  ArrowClockwise,
  Hourglass,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import {
  PageHead,
  Pill,
  RTable,
  TableSkeleton,
  EmptyState,
  inputCls,
  selectCls,
  btnGhost,
} from "@/components/ui";
import { api } from "@/lib/api";

type Order = {
  id: string;
  hostname: string;
  userId?: string;
  user?: { email?: string; name?: string };
  plan?: { id?: string; name?: string; cpu?: number; ramMb?: number; storageGb?: number; priceNgn?: number } | null;
  status: string;
  stage: "PENDING" | "PROVISIONING" | "LIVE" | "SUSPENDED" | "ERROR";
  ip?: string | null;
  node?: { id?: string; name?: string; provider?: string; region?: string } | null;
  image?: string;
  createdAt: string;
};

const STAGE_TONE: Record<Order["stage"], "accent" | "warn" | "danger" | "info" | "muted"> = {
  PENDING: "warn",
  PROVISIONING: "info",
  LIVE: "accent",
  SUSPENDED: "muted",
  ERROR: "danger",
};

const STAGE_FILTERS = ["all", "PENDING", "PROVISIONING", "LIVE", "SUSPENDED", "ERROR"] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<(typeof STAGE_FILTERS)[number]>("all");

  const reload = async () => {
    try {
      const res = (await api().get("/v1/admin/orders?page=1&limit=100")) as {
        items: Order[];
        pending?: number;
        meta?: { total?: number };
      };
      setOrders(res.items ?? []);
      setPending(res.pending ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const filteredOrders = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return orders.filter((o) => {
      const owner = o.user?.email ?? o.user?.name ?? o.userId ?? "";
      if (stageFilter !== "all" && o.stage !== stageFilter) return false;
      if (ql && !(o.hostname.toLowerCase().includes(ql) || owner.toLowerCase().includes(ql) || o.id.includes(ql))) {
        return false;
      }
      return true;
    });
  }, [orders, q, stageFilter]);

  const planLabel = (o: Order): string => {
    const p = o.plan;
    return p?.name ?? "standard";
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Orders"
        sub="Every instance order placed by customers, newest first. PENDING orders are awaiting capacity — your acknowledgment email has already been sent to the customer."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void reload();
            }}
            title="Refresh orders"
            className={btnGhost}
          >
            <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      {pending > 0 && (
        <section
          aria-label="Pending orders banner"
          className="flex flex-col gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-warning/20 text-warning">
              <Hourglass size={18} weight="bold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                <strong className="text-warning">{pending}</strong> order{pending === 1 ? "" : "s"} pending capacity
              </p>
              <p className="text-xs text-text-muted">Customers have been told their instance will be live shortly.</p>
            </div>
          </div>
          <Link href="/nodes" className="press inline-flex items-center justify-center gap-1.5 rounded-md border border-warning/40 bg-warning/5 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/15 transition-colors">
            Check Node Capacity
          </Link>
        </section>
      )}

      <section
        aria-label="Order filters"
        className="grid gap-3 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Search Orders
          </label>
          <div className="relative">
            <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="hostname, owner email, or order id…"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Stage
          </label>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as (typeof STAGE_FILTERS)[number])} className={selectCls}>
            {STAGE_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Stages" : s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-text-muted">
        <span>
          SHOWING <strong className="text-text">{filteredOrders.length}</strong> ORDERS
        </span>
        {pending > 0 && <span className="text-warning">{pending} AWAITING CAPACITY</span>}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package size={36} />}
          title="No orders match criteria"
          description="Try clearing the search or changing the stage filter."
          action={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStageFilter("all");
              }}
              className={btnGhost}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <RTable
          head={["Hostname", "Owner", "Plan", "Stage", "Status", "Node", "Created", "Actions"]}
          rows={filteredOrders.map((o) => {
            const owner = o.user?.email ?? o.user?.name ?? o.userId ?? "—";
            return [
              {
                v: (
                  <Link
                    href={`/instances/${o.id}`}
                    className="font-mono text-sm font-bold text-text hover:text-accent transition-colors"
                  >
                    {o.hostname}
                  </Link>
                ),
              },
              {
                v: (
                  <span className="block max-w-[160px] truncate text-xs text-text-muted" title={owner}>
                    {owner}
                  </span>
                ),
              },
              {
                v: (
                  <span className="inline-block rounded bg-surface border border-border/60 px-2 py-0.5 font-mono text-xs font-semibold">
                    {planLabel(o).toUpperCase()}
                  </span>
                ),
              },
              {
                v: (
                  <Pill tone={STAGE_TONE[o.stage]} dot>
                    {o.stage}
                  </Pill>
                ),
              },
              {
                v: <span className="font-mono text-xs text-text-muted">{o.status}</span>,
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {o.node?.name ?? o.node?.id ?? "—"}
                  </span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {new Date(o.createdAt).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ),
              },
              {
                v: (
                  <Link
                    href={`/instances/${o.id}`}
                    className="press rounded border border-border/70 bg-surface/40 px-2 py-1 text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    Detail
                  </Link>
                ),
              },
            ];
          })}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <CheckCircle size={12} className="text-accent" /> LIVE — provisioned and available
        </span>
        <span className="flex items-center gap-1.5">
          <Hourglass size={12} className="text-warning" /> PENDING — placed, awaiting capacity
        </span>
        <span className="flex items-center gap-1.5">
          <Warning size={12} className="text-danger" /> ERROR — failed placement
        </span>
      </div>
    </div>
  );
}