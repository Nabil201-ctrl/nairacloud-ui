"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, ArrowsClockwise, ArrowSquareOut } from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, RTable, CopyBadge, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost } from "@/components/ui";
import { api } from "@/lib/api";

type Customer = { id: string; name: string; email: string };
type Payment = {
  id: string;
  reference: string;
  customerId?: string;
  userId?: string;
  amount?: number;
  amountNgn?: number;
  status: string;
  channel?: string;
  webhookAt?: string;
  createdAt?: string;
};

const PAY_TONE: Record<string, "accent" | "warn" | "danger" | "muted"> = {
  Success: "accent",
  SUCCESS: "accent",
  Failed: "danger",
  FAILED: "danger",
  Pending: "warn",
  PENDING: "warn",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const reload = async () => {
    try {
      const [pay, cust] = await Promise.all([
        api().get("/v1/admin/payments") as Promise<{ items: Payment[]; meta?: { page: number; limit: number; total: number } }>,
        api().get("/v1/admin/customers") as Promise<{ items: Customer[]; meta?: { page: number; limit: number; total: number } }>,
      ]);
      setPayments(pay.items ?? []);
      setCustomers(cust.items ?? []);
    } catch (err) {
      toast.error("Failed to load payments stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return payments.filter((p) => {
      const st = (p.status ?? "").toLowerCase();
      if (status !== "all" && st !== status.toLowerCase()) return false;
      if (ql && !(p.reference?.toLowerCase().includes(ql) || p.channel?.toLowerCase().includes(ql))) {
        return false;
      }
      return true;
    });
  }, [payments, q, status]);

  const ownerName = (id?: string) => {
    if (!id) return "—";
    const c = customers.find((cust) => cust.id === id);
    return c?.name || c?.email || id;
  };

  const handleRetry = async (ref: string) => {
    try {
      await api().post(`/v1/admin/payments/${ref}/retry-verification`, {});
      toast.success(`Webhook verification re-triggered for ${ref}`);
      await reload();
    } catch {
      toast.error("Retry verification failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Paystack Payments"
        sub="Checkout receipts and automated funding webhooks received from Paystack. Re-verify unconfirmed or pending settlements instantly."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void reload();
            }}
            className={btnGhost}
          >
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Payments</span>
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
            Search Reference
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="nc_..., ps_..., channel..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Payment Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="all">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </section>

      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>
          {rows.length} PAYMENTS · {rows.filter((r) => (r.status ?? "").toUpperCase() === "PENDING").length} PENDING
          WEBHOOK CONFIRMATION
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={36} />}
          title="No payments found"
          description="No Paystack payments match your active filters."
        />
      ) : (
        <RTable
          head={["Reference", "Customer", "Amount", "Status", "Channel", "Webhook Received", "Action"]}
          colSizes={["w-32"]}
          rows={rows.map((p) => {
            const amount = p.amount ?? p.amountNgn ?? 0;
            const when = p.webhookAt ?? p.createdAt;
            const isSuccess = (p.status ?? "").toUpperCase() === "SUCCESS";
            const custId = p.customerId ?? p.userId;

            return [
              { v: <CopyBadge text={p.reference} /> },
              {
                v: custId ? (
                  <Link
                    href={`/customers/${custId}`}
                    className="text-xs font-semibold text-text hover:text-accent transition-colors truncate max-w-[140px] block"
                  >
                    {ownerName(custId)}
                  </Link>
                ) : (
                  <span className="text-text-muted/60 text-xs font-mono">—</span>
                ),
              },
              {
                v: (
                  <span className="font-mono text-sm font-bold tabular-nums text-text">
                    {formatNaira(amount)}
                  </span>
                ),
              },
              {
                v: (
                  <Pill tone={PAY_TONE[p.status] ?? "muted"} dot>
                    {p.status}
                  </Pill>
                ),
              },
              {
                v: <span className="text-xs font-mono text-text-muted uppercase">{p.channel || "card"}</span>,
              },
              {
                v: (
                  <span className="font-mono text-xs text-text-muted">
                    {when ? new Date(when).toLocaleString("en-NG") : "—"}
                  </span>
                ),
              },
              {
                v: (
                  <button
                    type="button"
                    disabled={isSuccess}
                    onClick={() => void handleRetry(p.reference)}
                    className="press rounded-md border border-border/70 bg-surface/40 px-3 py-1 font-mono text-xs font-semibold hover:border-accent/40 hover:text-accent disabled:opacity-40 transition-colors"
                  >
                    {isSuccess ? "Verified" : "Re-Verify"}
                  </button>
                ),
              },
            ];
          })}
        />
      )}
    </div>
  );
}