"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User,
  Cloud,
  Wallet,
  CreditCard,
  Lifebuoy,
  ArrowLeft,
  ArrowsClockwise,
  ShieldWarning,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, RTable, StatCard, CopyBadge, TableSkeleton, EmptyState, btnGhost, btnPrimary, btnDanger } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  email: string;
  status: string;
  role?: string;
  emailVerifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  joinedAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  walletBalance?: number;
  wallet?: { id?: string; balance?: number };
  instances?: Instance[];
  subscriptions?: any[];
  payments?: Payment[];
  tickets?: Ticket[];
};

type Instance = {
  id: string;
  hostname: string;
  status: string;
  ip?: string | null;
  nodeId?: string | null;
  plan?: string | { name?: string };
  planId?: string;
  createdAt: string;
};

type Payment = {
  id: string;
  reference: string;
  amount?: number;
  amountNgn?: number;
  status: string;
  channel?: string;
  createdAt?: string;
  webhookAt?: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
};

type WalletTxn = {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description?: string;
  date?: string;
};

const STATUS_TONE: Record<string, "accent" | "warn" | "danger" | "muted"> = {
  ACTIVE: "accent",
  active: "accent",
  PAST_DUE: "warn",
  past_due: "warn",
  SUSPENDED: "danger",
  suspended: "danger",
};

const PAY_TONE: Record<string, "accent" | "warn" | "danger" | "muted"> = {
  SUCCESS: "accent",
  Success: "accent",
  PENDING: "warn",
  Pending: "warn",
  FAILED: "danger",
  Failed: "danger",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [c, setC] = useState<Customer | null>(null);
  const [walletTxns, setWalletTxns] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"instances" | "wallet" | "payments" | "tickets">("instances");
  const [suspendOpen, setSuspendOpen] = useState(false);

  const loadData = async () => {
    try {
      const cust = (await api().get(`/v1/admin/customers/${params.id}`)) as Customer;
      setC(cust ?? null);

      // Try loading wallet details
      try {
        const walletData = (await api().get(`/v1/admin/customers/${params.id}/wallet`)) as {
          balance?: number;
          transactions?: WalletTxn[];
        };
        if (walletData?.transactions) {
          setWalletTxns(walletData.transactions);
        }
      } catch {
        // wallet endpoint might return 404 or empty
      }
    } catch (err) {
      console.error("Failed to load customer profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHead title="Loading customer profile..." />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="space-y-6">
        <PageHead title="Customer Not Found" />
        <EmptyState
          icon={<User size={36} />}
          title="Customer account not found"
          description="The requested user account does not exist or has been deleted."
          action={
            <Link href="/customers" className={btnPrimary}>
              Back to Directory
            </Link>
          }
        />
      </div>
    );
  }

  const instances = c.instances ?? [];
  const payments = c.payments ?? [];
  const tickets = c.tickets ?? [];
  const walletBal = c.walletBalance ?? c.wallet?.balance ?? 0;
  const isSuspended = (c.status ?? "").toUpperCase() === "SUSPENDED";
  const joined = c.createdAt ?? c.joinedAt;

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="space-y-2">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-text-muted hover:text-accent transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>BACK TO CUSTOMERS</span>
        </Link>

        <PageHead
          title={
            <div className="flex items-center gap-3">
              <span>{c.name}</span>
              <Pill tone={STATUS_TONE[c.status] ?? "muted"} dot>
                {c.status}
              </Pill>
            </div>
          }
          sub={`${c.email} · Account ID: ${c.id} · Joined ${
            joined ? new Date(joined).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" }) : "—"
          }`}
          actions={
            <div className="flex items-center gap-2">
              {!isSuspended && (
                <button
                  type="button"
                  onClick={() => setSuspendOpen(true)}
                  className="press rounded-md border border-danger/50 bg-danger/10 px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger/20 transition-colors"
                >
                  Suspend Account
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Wallet Balance"
          value={formatNaira(walletBal)}
          hint={<span>AVAILABLE OPERATING CREDIT</span>}
          tone="accent"
          icon={<Wallet size={20} />}
        />
        <StatCard
          label="Active Instances"
          value={`${instances.length}`}
          hint={<span>VIRTUAL MACHINES RUNNING</span>}
          tone="info"
          icon={<Cloud size={20} />}
        />
        <StatCard
          label="Email Verification"
          value={c.emailVerifiedAt ? "VERIFIED" : "PENDING"}
          hint={<span>OTP AUTHENTICATED</span>}
          tone={c.emailVerifiedAt ? "accent" : "warn"}
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          label="Last Session"
          value={
            c.lastLoginAt
              ? new Date(c.lastLoginAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
              : "Never"
          }
          hint={c.lastLoginIp ? <span>FROM IP {c.lastLoginIp}</span> : <span>NO LOGIN TELEMETRY</span>}
          tone="muted"
          icon={<User size={20} />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("instances")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "instances"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Cloud size={14} />
          <span>Instances ({instances.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wallet")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "wallet"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Wallet size={14} />
          <span>Wallet Ledger ({walletTxns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <CreditCard size={14} />
          <span>Paystack History ({payments.length})</span>
        </button>

        {tickets.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "tickets"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Lifebuoy size={14} />
            <span>Support Tickets ({tickets.length})</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "instances" && (
        <section className="space-y-4">
          {instances.length === 0 ? (
            <EmptyState
              icon={<Cloud size={36} />}
              title="No instances deployed"
              description="This user has not deployed any virtual machines yet."
            />
          ) : (
            <RTable
              head={["Hostname", "Plan", "Node", "Status", "IP Address", "Created"]}
              rows={instances.map((i) => [
                {
                  v: (
                    <Link
                      href={`/instances/${i.id}`}
                      className="font-mono text-sm font-bold text-text hover:text-accent transition-colors"
                    >
                      {i.hostname}
                    </Link>
                  ),
                },
                {
                  v: (
                    <span className="font-mono text-xs">
                      {typeof i.plan === "string" ? i.plan : i.plan?.name || i.planId || "standard"}
                    </span>
                  ),
                },
                {
                  v: <span className="font-mono text-xs text-text-muted">{(i.nodeId || "—").toUpperCase()}</span>,
                },
                {
                  v: (
                    <Pill tone={(i.status ?? "").toUpperCase() === "RUNNING" ? "accent" : "warn"} dot>
                      {i.status}
                    </Pill>
                  ),
                },
                {
                  v: i.ip ? <CopyBadge text={i.ip} /> : <span className="text-text-muted/60 font-mono text-xs">—</span>,
                },
                {
                  v: (
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(i.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </span>
                  ),
                },
              ])}
            />
          )}
        </section>
      )}

      {activeTab === "wallet" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">
              CURRENT WALLET BALANCE: <strong className="text-text">{formatNaira(walletBal)}</strong>
            </span>
          </div>

          {walletTxns.length === 0 ? (
            <EmptyState
              icon={<Wallet size={36} />}
              title="No ledger records found"
              description="Wallet movements and funding records will appear here."
            />
          ) : (
            <RTable
              head={["Reference", "Type", "Amount", "Status", "Description", "Date"]}
              rows={walletTxns.map((t) => [
                { v: <CopyBadge text={t.reference} /> },
                {
                  v: (
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        t.type === "CREDIT"
                          ? "bg-accent/10 border border-accent/30 text-accent"
                          : "bg-danger/10 border border-danger/30 text-danger"
                      }`}
                    >
                      {t.type}
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
                    <Pill tone={t.status === "SUCCESS" ? "accent" : "warn"} dot>
                      {t.status}
                    </Pill>
                  ),
                },
                { v: <span className="text-xs text-text-muted">{t.description || "—"}</span> },
                {
                  v: (
                    <span className="font-mono text-xs text-text-muted">
                      {t.date ? new Date(t.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "—"}
                    </span>
                  ),
                },
              ])}
            />
          )}
        </section>
      )}

      {activeTab === "payments" && (
        <section className="space-y-4">
          {payments.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={36} />}
              title="No payment history recorded"
              description="Paystack checkouts and checkout verifications will be logged here."
            />
          ) : (
            <RTable
              head={["Reference", "Amount", "Status", "Channel", "Webhook Received"]}
              rows={payments.map((p) => {
                const amount = p.amount ?? p.amountNgn ?? 0;
                const when = p.webhookAt ?? p.createdAt;
                return [
                  { v: <CopyBadge text={p.reference} /> },
                  {
                    v: (
                      <span className="font-mono text-sm font-bold text-text tabular-nums">
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
                  { v: <span className="text-xs text-text-muted font-mono">{p.channel || "card"}</span> },
                  {
                    v: (
                      <span className="font-mono text-xs text-text-muted">
                        {when ? new Date(when).toLocaleString("en-NG") : "—"}
                      </span>
                    ),
                  },
                ];
              })}
            />
          )}
        </section>
      )}

      {activeTab === "tickets" && (
        <section className="space-y-4">
          <RTable
            head={["Subject", "Status", "Updated"]}
            rows={tickets.map((t) => [
              { v: <span className="text-sm font-medium text-text">{t.subject}</span> },
              { v: <Pill tone={t.status === "open" ? "warn" : "muted"}>{t.status}</Pill> },
              { v: <span className="font-mono text-xs text-text-muted">{new Date(t.updatedAt).toLocaleString("en-NG")}</span> },
            ])}
          />
        </section>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={suspendOpen}
        title={`Suspend account for ${c.name}?`}
        body="Stops all customer instances immediately, denies session login, and pauses wallet deductions. Account data is preserved for 14 days."
        confirmLabel="Suspend Customer"
        onClose={() => setSuspendOpen(false)}
        onConfirm={async () => {
          try {
            await api().post(`/v1/admin/customers/${c.id}/suspend`, {});
            toast.success(`Account suspended for ${c.name}`);
            await loadData();
          } catch {
            toast.error("Suspend failed");
          }
          setSuspendOpen(false);
        }}
      />
    </div>
  );
}
