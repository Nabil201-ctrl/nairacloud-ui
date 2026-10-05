"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Plus, Receipt, CheckCircle } from "@phosphor-icons/react";
import { PriceTag, Skeleton, StatGridSkeleton, CardSkeleton, ListSkeleton } from "@nairacloud/ui";
import { api } from "@/lib/api";
import { DashCard, PageHeader, PrimaryButton } from "@/components/dashboard";

type WalletTransaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description: string | null;
  date: string;
};

type FundResponse = {
  checkoutUrl?: string;
  authorization_url?: string;
  reference?: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [funding, setFunding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const wallet = await api().get("/v1/billing/wallet") as {
        balance: number;
        transactions?: WalletTransaction[];
        recentTransactions?: WalletTransaction[];
      };
      setBalance(wallet.balance ?? 0);
      setTransactions(wallet.transactions ?? wallet.recentTransactions ?? []);
    } catch (err) {
      console.error("Failed to load wallet", err);
      toast.error("Could not load wallet");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const wallet = await api().get("/v1/billing/wallet") as {
          balance: number;
          transactions?: WalletTransaction[];
          recentTransactions?: WalletTransaction[];
        };
        setBalance(wallet.balance ?? 0);
        setTransactions(wallet.transactions ?? wallet.recentTransactions ?? []);
      } catch (err) {
        console.error("Failed to load wallet", err);
        toast.error("Could not load wallet");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const suggestedAmounts = [5000, 10000, 25000, 50000];

  const fund = async () => {
    if (!amount || amount < 1000) return;
    setFunding(true);
    try {
      const res = await api().post("/v1/billing/wallet/fund", { amount }) as FundResponse;
      const url = res.checkoutUrl ?? res.authorization_url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error("Checkout URL missing");
    } catch {
      toast.error("Funding failed");
    } finally {
      setFunding(false);
    }
  };

  const topups = transactions.filter(
    (t) =>
      t.type === "CREDIT" ||
      (t.description ?? "").toLowerCase().includes("fund") ||
      (t.description ?? "").toLowerCase().includes("top"),
  );

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={loading ? "" : "Wallet"}
        description={loading ? "" : "Manage your NairaCloud balance and add funds."}
      />

      {loading ? (
        <>
          <StatGridSkeleton items={2} />
          <CardSkeleton lines={6} />
          <ListSkeleton items={5} />
        </>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <DashCard>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Available Balance</p>
                  <p className="text-[12px] text-text-muted">Prepaid funds ready to use</p>
                </div>
              </div>
              <div className="font-mono text-[28px] font-medium tracking-tight text-white">
                <PriceTag amount={balance} />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
                Your instances will pause automatically if this balance reaches ₦0.00.
              </p>
            </DashCard>

            <DashCard>
              <h2 className="mb-4 text-[13px] font-medium text-white">Add Funds via Paystack</h2>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void fund(); }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {suggestedAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                  className={`rounded-sm border py-2 text-[12px] font-medium transition-colors ${
                    amount === amt
                      ? "border-white bg-white/5 text-white"
                      : "border-border-faint bg-surface text-text-secondary hover:border-border hover:text-white"
                  }`}
                >
                  ₦{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">₦</span>
              <input
                type="number"
                min="1000"
                step="500"
                placeholder="Other amount (min ₦1,000)"
                className="w-full rounded-sm border border-border bg-bg py-2.5 pl-8 pr-3 text-[13px] text-white placeholder:text-text-muted focus:border-border-hover focus:outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <PrimaryButton
              type="submit"
              disabled={!amount || amount < 1000 || funding}
              className="w-full"
            >
              <Plus size={14} weight="bold" />
              {funding ? "Redirecting…" : "Proceed to Checkout"}
            </PrimaryButton>
            <p className="flex items-center justify-center gap-1 text-center text-[11px] text-text-muted">
              <CheckCircle size={12} /> Secure one-time payment. No auto-charges.
            </p>
          </form>
        </DashCard>
          </div>

        <div>
          <h2 className="mb-3 text-[14px] font-medium text-white">Recent Top-ups</h2>
          <DashCard padding={false} className="overflow-hidden">
            <ul className="divide-y divide-border-faint">
              {topups.map((tx) => (
                <li key={tx.id} className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted shrink-0">
                      <Receipt size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{tx.description ?? "Paystack Top-up"}</p>
                      <p className="text-[11px] text-text-muted truncate">
                        Ref: {tx.reference} · {new Date(tx.date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <p className="font-mono text-[13px] font-medium text-accent">
                      +<PriceTag amount={tx.amount} />
                    </p>
                    <p className="text-[11px] text-text-muted">{tx.status}</p>
                  </div>
                </li>
              ))}
              {topups.length === 0 && (
                <li className="px-4 py-8 text-center text-[13px] text-text-muted">No transactions yet.</li>
              )}
            </ul>
          </DashCard>
        </div>
        </>
      )}
    </div>
  );
}
