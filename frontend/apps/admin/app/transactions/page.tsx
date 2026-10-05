"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Receipt,
  ArrowsClockwise,
  ArrowSquareOut,
  Wallet,
  Coins,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, RTable, CopyBadge, TableSkeleton, EmptyState, inputCls, selectCls, btnGhost, btnPrimary } from "@/components/ui";
import { api } from "@/lib/api";

type WalletTxn = {
  id: string;
  reference: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | string;
  status: "SUCCESS" | "PENDING" | "FAILED" | string;
  description?: string;
  createdAt: string;
};

type Subscription = {
  id: string;
  userId?: string;
  instanceId?: string;
  planId?: string;
  status: string;
  nextBillingDate?: string;
  createdAt: string;
  user?: { email?: string };
  plan?: { name?: string; priceNgn?: number };
  instance?: { hostname?: string };
};

const TXN_TONE: Record<string, "accent" | "warn" | "danger" | "muted"> = {
  SUCCESS: "accent",
  Success: "accent",
  PENDING: "warn",
  Pending: "warn",
  FAILED: "danger",
  Failed: "danger",
};

export default function TransactionsAndLedgerPage() {
  const [tab, setTab] = useState<"ledger" | "subscriptions">("ledger");
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadData = async () => {
    try {
      const [txRes, subsRes] = await Promise.allSettled([
        api().get("/v1/admin/wallet-transactions") as Promise<{ items: WalletTxn[] } | WalletTxn[]>,
        api().get("/v1/admin/subscriptions") as Promise<Subscription[]>,
      ]);

      if (txRes.status === "fulfilled") {
        const raw = txRes.value;
        const items = Array.isArray(raw) ? raw : (raw as any)?.items ?? [];
        setTransactions(items);
      }

      if (subsRes.status === "fulfilled") {
        setSubscriptions(subsRes.value ?? []);
      }
    } catch (err) {
      toast.error("Failed to load transactions ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRetryVerify = async (ref: string) => {
    try {
      await api().post(`/v1/admin/wallet-transactions/${ref}/retry-verify`, {});
      toast.success(`Verification re-triggered for ${ref}`);
      await loadData();
    } catch {
      toast.error("Re-verification failed");
    }
  };

  const filteredTxns = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return transactions.filter((t) => {
      const email = (t.customerEmail ?? "").toLowerCase();
      const name = (t.customerName ?? "").toLowerCase();
      const ref = (t.reference ?? "").toLowerCase();
      const status = (t.status ?? "").toUpperCase();
      const type = (t.type ?? "").toUpperCase();

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (typeFilter !== "all" && type !== typeFilter) return false;
      if (ql && !(ref.includes(ql) || email.includes(ql) || name.includes(ql))) return false;
      return true;
    });
  }, [transactions, q, statusFilter, typeFilter]);

  const filteredSubs = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return subscriptions.filter((s) => {
      const email = (s.user?.email ?? "").toLowerCase();
      const host = (s.instance?.hostname ?? "").toLowerCase();
      if (ql && !(email.includes(ql) || host.includes(ql))) return false;
      return true;
    });
  }, [subscriptions, q]);

  const totalVolume = transactions
    .filter((t) => (t.status ?? "").toUpperCase() === "SUCCESS")
    .reduce((acc, t) => acc + (t.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHead
        title="Commercial Ledger"
        sub="Authoritative balance movements across user wallets, automated renewal deductions, and Paystack settlement logs."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadData();
            }}
            className={btnGhost}
          >
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync Ledger</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setTab("ledger")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
            tab === "ledger" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Receipt size={14} />
          <span>Wallet Transactions ({transactions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("subscriptions")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
            tab === "subscriptions"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <CreditCard size={14} />
          <span>Auto-Renew Schedules ({subscriptions.length})</span>
        </button>
      </div>

      {tab === "ledger" ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <section
            aria-label="Ledger filters"
            className="grid gap-3 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="lg:col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Search Reference or Customer
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="wallet_fund_..., email, name..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Movement Type
              </label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
                <option value="all">All Types</option>
                <option value="CREDIT">CREDIT (Funding)</option>
                <option value="DEBIT">DEBIT (Spend)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Settlement Status
              </label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                <option value="all">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </section>

          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>
              TOTAL SUCCESSFUL VOLUME: <strong className="text-text">{formatNaira(totalVolume)}</strong>
            </span>
            <span>{filteredTxns.length} ENTRIES</span>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredTxns.length === 0 ? (
            <EmptyState
              icon={<Receipt size={36} />}
              title="No ledger entries found"
              description="No wallet balance debits or credits match your active search filters."
            />
          ) : (
            <RTable
              head={["Reference", "Customer", "Type", "Amount", "Status", "Description", "Date", "Action"]}
              rows={filteredTxns.map((t) => {
                const isCredit = (t.type ?? "").toUpperCase() === "CREDIT";
                const tone = TXN_TONE[t.status] ?? "muted";

                return [
                  { v: <CopyBadge text={t.reference} /> },
                  {
                    v: (
                      <div>
                        <p className="text-sm font-semibold text-text truncate max-w-[150px]">
                          {t.customerName || t.customerEmail || t.customerId || "Customer"}
                        </p>
                        {t.customerEmail && t.customerName && (
                          <p className="text-[11px] text-text-muted truncate max-w-[150px]">{t.customerEmail}</p>
                        )}
                      </div>
                    ),
                  },
                  {
                    v: (
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isCredit
                            ? "bg-accent/10 border border-accent/30 text-accent"
                            : "bg-danger/10 border border-danger/30 text-danger"
                        }`}
                      >
                        {isCredit ? "+ CREDIT" : "- DEBIT"}
                      </span>
                    ),
                  },
                  {
                    v: (
                      <span className="font-mono text-sm font-bold text-text tabular-nums">
                        {formatNaira(t.amount)}
                      </span>
                    ),
                  },
                  {
                    v: (
                      <Pill tone={tone} dot>
                        {t.status}
                      </Pill>
                    ),
                  },
                  {
                    v: (
                      <span className="text-xs text-text-muted truncate max-w-[180px] block">
                        {t.description || "Wallet operation"}
                      </span>
                    ),
                  },
                  {
                    v: (
                      <span className="font-mono text-xs text-text-muted">
                        {new Date(t.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ),
                  },
                  {
                    v:
                      (t.status ?? "").toUpperCase() === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => void handleRetryVerify(t.reference)}
                          className="press rounded border border-warning/50 bg-warning/10 px-2 py-1 text-xs font-bold text-warning hover:bg-warning/20 transition-colors"
                        >
                          Re-Verify
                        </button>
                      ) : (
                        <span className="text-text-muted/40 font-mono text-xs">—</span>
                      ),
                  },
                ];
              })}
            />
          )}
        </div>
      ) : (
        /* Subscriptions Tab */
        <div className="space-y-6">
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : filteredSubs.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={36} />}
              title="No active subscriptions found"
              description="All running customer instances configured for auto-renew will be cataloged here."
            />
          ) : (
            <RTable
              head={["Instance", "Customer", "Plan Size", "Status", "Next Billing", "Started"]}
              rows={filteredSubs.map((s) => [
                {
                  v: (
                    <span className="font-mono text-sm font-bold text-text">
                      {s.instance?.hostname || s.instanceId || "instance"}
                    </span>
                  ),
                },
                {
                  v: (
                    <span className="text-xs text-text truncate max-w-[180px] block">
                      {s.user?.email || s.userId || "—"}
                    </span>
                  ),
                },
                {
                  v: (
                    <div className="font-mono text-xs">
                      <span className="font-bold text-text">{s.plan?.name || "Standard"}</span>
                      {s.plan?.priceNgn ? (
                        <span className="text-accent ml-2">({formatNaira(s.plan.priceNgn)}/mo)</span>
                      ) : null}
                    </div>
                  ),
                },
                {
                  v: (
                    <Pill tone={s.status === "ACTIVE" ? "accent" : "warn"} dot>
                      {s.status}
                    </Pill>
                  ),
                },
                {
                  v: (
                    <span className="font-mono text-xs text-text">
                      {s.nextBillingDate
                        ? new Date(s.nextBillingDate).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  ),
                },
                {
                  v: (
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(s.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </span>
                  ),
                },
              ])}
            />
          )}
        </div>
      )}
    </div>
  );
}