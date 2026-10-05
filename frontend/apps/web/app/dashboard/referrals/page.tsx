"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, Copy, CheckCircle, Users, ChartLineUp } from "@phosphor-icons/react";
import { toast } from "sonner";
import { EmptyState, PriceTag, Skeleton, StatGridSkeleton, CardSkeleton, GridSkeleton } from "@nairacloud/ui";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { WAITLIST_URL } from "@/lib/site";
import { DashCard, PageHeader, PrimaryButton, SecondaryButton } from "@/components/dashboard";

type ReferralHistoryItem = {
  id: string;
  user: string;
  status: string;
  amount: number;
  date: string;
};

type ReferralData = {
  referralCode: string;
  stats: {
    totalSignups: number;
    conversionRate: number;
    totalEarned: number;
  };
  history: ReferralHistoryItem[];
};

function errMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

function formatSignedUp(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api().get<ReferralData>("/v1/referrals");
      setData(res);
    } catch (err) {
      setData(null);
      setError(errMessage(err, "Failed to load referrals"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const referralLink = useMemo(() => {
    if (!data?.referralCode) return "";
    // Waitlist/testing: public share links go to join.nairacloud.xyz, not /signup.
    return `${WAITLIST_URL}?ref=${encodeURIComponent(data.referralCode)}`;
  }, [data?.referralCode]);

  const copyLink = () => {
    if (!referralLink) return;
    void navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <PageHeader title="" description="" />
        <StatGridSkeleton items={3} />
        <CardSkeleton lines={4} />
        <GridSkeleton items={6} cols={{ base: 1, sm: 2, lg: 3 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl space-y-6">
        <PageHeader title="Referrals" description="Invite friends and earn cloud credits." />
        <DashCard className="border-danger/40">
          <p className="text-[13px] text-danger">{error ?? "No referral data."}</p>
          <SecondaryButton onClick={() => void load()} className="mt-4">
            Retry
          </SecondaryButton>
        </DashCard>
      </div>
    );
  }

  const { stats, history } = data;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Referrals"
        description="Give friends ₦1,000 in credits when they sign up. Once they spend ₦2,000, you earn ₦1,500."
      />

      <DashCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted">
              <Gift size={18} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">Your referral link</p>
              <p className="mt-0.5 text-[12px] text-text-muted">Share this link — payouts credit your wallet automatically.</p>
            </div>
          </div>
          <PrimaryButton onClick={copyLink} className="shrink-0">
            {copied ? <CheckCircle size={14} weight="bold" className="text-accent" /> : <Copy size={14} weight="bold" />}
            {copied ? "Copied!" : "Copy Link"}
          </PrimaryButton>
        </div>
        <div className="mt-4 overflow-hidden rounded-sm border border-border-faint bg-bg px-3 py-2.5">
          <span className="block truncate font-mono text-[13px] text-text-secondary">{referralLink}</span>
        </div>
      </DashCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DashCard>
          <div className="mb-3 flex items-center gap-2">
            <Users size={14} className="text-text-muted" />
            <p className="text-[13px] text-text-muted">Total Signups</p>
          </div>
          <p className="font-mono text-[22px] font-medium tracking-tight text-white">{stats.totalSignups}</p>
        </DashCard>

        <DashCard>
          <div className="mb-3 flex items-center gap-2">
            <ChartLineUp size={14} className="text-text-muted" />
            <p className="text-[13px] text-text-muted">Conversion Rate</p>
          </div>
          <p className="font-mono text-[22px] font-medium tracking-tight text-white">{stats.conversionRate}%</p>
        </DashCard>

        <DashCard>
          <div className="mb-3 flex items-center gap-2">
            <Gift size={14} className="text-accent" />
            <p className="text-[13px] text-text-muted">Total Earned</p>
          </div>
          <p className="font-mono text-[22px] font-medium tracking-tight text-white">
            <PriceTag amount={stats.totalEarned} />
          </p>
        </DashCard>
      </div>

      <div>
        <h2 className="mb-3 text-[14px] font-medium text-white">Referral History</h2>
        {history.length === 0 ? (
          <EmptyState
            title="No referrals yet"
            body="Share your link. Signups and payouts will show up here."
            icon={<Gift size={32} />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((ref) => (
              <div key={ref.id} className="elev-1">
                <DashCard className="p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{ref.user}</p>
                      <p className="mt-1 text-[11px] text-text-muted">Signed up on {formatSignedUp(ref.date)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-mono font-medium ${ref.amount > 0 ? "text-accent" : "text-text-muted"}`}>
                        {ref.amount > 0 ? (
                          <>
                            +<PriceTag amount={ref.amount} />
                          </>
                        ) : (
                          "—"
                        )}
                      </p>
                      <p className="mt-1 text-[11px] text-text-muted">{ref.status}</p>
                    </div>
                  </div>
                </DashCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
