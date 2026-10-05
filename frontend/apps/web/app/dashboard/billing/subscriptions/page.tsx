"use client";

import { useEffect, useState } from "react";
import { PriceTag, EmptyState, TableSkeleton, Skeleton, CardSkeleton } from "@nairacloud/ui";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashCard, LinkButton, PageHeader, PrimaryButton, SecondaryButton } from "@/components/dashboard";
import { HardDrives, WarningCircle } from "@phosphor-icons/react";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: string;
};

type Subscription = {
  id: string;
  status: string;
  nextBillingDate: string;
  graceEndsAt: string | null;
  cancelledAt: string | null;
  planId: string;
  plan: Plan;
  instance: { id: string; hostname: string; status: string };
};

function statusTone(status: string): { label: string; tone: "success" | "warning" | "danger" | "muted" } {
  switch (status) {
    case "ACTIVE":
      return { label: "Active", tone: "success" };
    case "GRACE":
      return { label: "Grace", tone: "warning" };
    case "SUSPENDED":
      return { label: "Suspended", tone: "danger" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "muted" };
    default:
      return { label: status, tone: "muted" };
  }
}

function toneClass(tone: "success" | "warning" | "danger" | "muted"): string {
  if (tone === "success") return "bg-success/10 text-success";
  if (tone === "danger") return "bg-danger/10 text-danger";
  if (tone === "warning") return "bg-warning/10 text-warning";
  return "bg-surface text-text-muted";
}

function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [manageId, setManageId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [targetPlanId, setTargetPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      const [list, pl] = await Promise.all([
        api().get("/v1/billing/subscriptions") as Promise<Subscription[]>,
        api().get("/v1/plans") as Promise<Plan[]>,
      ]);
      setSubs(list ?? []);
      setPlans(pl ?? []);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
      toast.error("Could not load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const manage = subs.find((s) => s.id === manageId) ?? null;

  const savePlanChange = async () => {
    if (!manage || !targetPlanId || targetPlanId === manage.planId) {
      setManageId(null);
      return;
    }
    const currentPrice = manage.plan.priceNgn;
    const next = plans.find((p) => p.id === targetPlanId);
    if (!next) return;
    const action = next.priceNgn >= currentPrice ? "upgrade" : "downgrade";
    setSaving(true);
    try {
      await api().patch(`/v1/billing/subscriptions/${manage.id}`, { action, planId: targetPlanId });
      toast.success(`${manage.instance.hostname} plan changed`);
      setManageId(null);
      await load();
    } catch {
      toast.error("Plan change failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={loading ? "" : "Subscriptions"}
        description={loading ? "" : "One active subscription per instance. Charges run monthly in NGN."}
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <TableSkeleton rows={8} columns={4} />
        </>
      ) : subs.length === 0 ? (
        <EmptyState
          title="No subscriptions"
          body="You have no billed instances yet."
          icon={<HardDrives size={32} />}
          action={<LinkButton href="/dashboard/instances/new">Deploy instance</LinkButton>}
        />
      ) : (
        <DashCard padding={false} className="overflow-hidden">
          <ul className="divide-y divide-border-faint">
            {subs.map((s) => {
              const st = statusTone(s.status);
              return (
                <li
                  key={s.id}
                  className="flex flex-col justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface-hover/50 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-medium text-white">{s.instance.hostname}</p>
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      {s.plan.name}
                      {s.status === "CANCELLED"
                        ? s.cancelledAt
                          ? ` · Cancelled ${formatBillingDate(s.cancelledAt)}`
                          : " · Cancelled"
                        : ` · Next billing ${formatBillingDate(s.nextBillingDate)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${toneClass(st.tone)}`}>
                      {st.label}
                    </span>
                    <span className="w-24 text-right font-mono text-[13px] font-medium text-white">
                      <PriceTag amount={s.plan.priceNgn} />
                      <span className="text-[11px] text-text-muted">/mo</span>
                    </span>
                    <SecondaryButton
                      disabled={s.status === "CANCELLED"}
                      onClick={() => {
                        setManageId(s.id);
                        setTargetPlanId(s.planId);
                      }}
                      className="h-8 px-3 text-[12px]"
                    >
                      Manage
                    </SecondaryButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </DashCard>
      )}

      {manage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" role="presentation">
          <button type="button" aria-label="Close" onClick={() => setManageId(null)} className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Manage ${manage.instance.hostname}`}
            className="relative w-full max-w-lg overflow-hidden rounded-md border border-border-faint bg-card"
          >
            <div className="border-b border-border-faint px-5 py-4">
              <h2 className="text-[15px] font-medium text-white">Manage {manage.instance.hostname}</h2>
              <p className="mt-1 text-[12px] text-text-muted">Upgrade or downgrade instance compute.</p>
            </div>

            <div className="p-5">
              <div className="space-y-2">
                {plans.map((p) => {
                  const disabled = p.status !== "ACTIVE";
                  const selected = targetPlanId === p.id;
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border bg-surface px-4 py-3 transition-colors ${
                        selected ? "border-white/40" : "border-border-faint hover:border-border"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        disabled={disabled}
                        checked={selected}
                        onChange={() => setTargetPlanId(p.id)}
                        className="h-4 w-4 cursor-pointer accent-white"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-white">
                          {p.name}{" "}
                          {p.name === "STARTER" && (
                            <span className="ml-2 rounded-sm bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                              Popular
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block font-mono text-[11px] text-text-muted">
                          {p.cpu} vCPU &middot; {p.ramMb / 1024}GB &middot; {p.storageGb}GB NVMe
                        </span>
                      </span>
                      <span className="text-right font-mono text-[13px] font-medium text-white">
                        <PriceTag amount={p.priceNgn} />
                        <span className="block text-[10px] text-text-muted">/mo</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-md border border-warning/20 bg-warning/5 p-4">
                <WarningCircle size={18} className="mt-0.5 shrink-0 text-warning" />
                <p className="text-[13px] leading-relaxed text-text-muted">
                  Changes apply to the next billing cycle. Prorated differences are credited to your account balance.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border-faint px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setCancelId(manageId)}
                className="press text-[13px] font-medium text-danger transition-colors hover:text-danger/80"
              >
                Cancel subscription...
              </button>
              <div className="flex gap-2">
                <SecondaryButton onClick={() => setManageId(null)}>Close</SecondaryButton>
                <PrimaryButton
                  disabled={saving || !targetPlanId || targetPlanId === manage.planId}
                  onClick={() => void savePlanChange()}
                >
                  Save changes
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelId !== null}
        title="Cancel this subscription?"
        body="The instance will continue running until the end of the current billing cycle, after which it will be suspended. Data is retained for 14 days before permanent deletion."
        confirmLabel="Cancel subscription"
        onClose={() => setCancelId(null)}
        onConfirm={async () => {
          if (cancelId) {
            try {
              await api().patch(`/v1/billing/subscriptions/${cancelId}`, { action: "cancel" });
              setManageId(null);
              toast.success("Subscription cancelled. Active until cycle end.");
              await load();
            } catch {
              toast.error("Cancel failed");
            }
          }
          setCancelId(null);
        }}
      />
    </div>
  );
}
