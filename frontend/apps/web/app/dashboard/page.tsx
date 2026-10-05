"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusDot, PriceTag, EmptyState, Skeleton, GridSkeleton, StatGridSkeleton, PageHeaderSkeleton, EmptyStateSkeleton } from "@nairacloud/ui";
import { InstanceMenu } from "@/components/instance-menu";
import { ArrowRight, Plus, TerminalWindow, ComputerTower, Wallet, TrendUp, HardDrive } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { DashCard, PageHeader, PrimaryButton, LinkButton } from "@/components/dashboard";

const STAT_ICON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-secondary";

type Instance = {
  id: string;
  hostname: string;
  status: string;
  plan: string;
  ip: string;
  node: string;
  region: string;
  os: string;
  createdAt: string;
  expiresAt: string;
  usage: { cpu: number; ram: number; disk: number };
};
type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: string;
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function planNameOf(plan: unknown): string {
  if (typeof plan === "string") return plan;
  if (plan && typeof plan === "object" && "name" in plan && typeof (plan as { name: unknown }).name === "string") {
    return (plan as { name: string }).name;
  }
  return "";
}

function normalizeInstance(raw: Record<string, unknown>): Instance {
  const node = raw.node;
  const usage = raw.usage as Instance["usage"] | undefined;
  return {
    id: String(raw.id ?? ""),
    hostname: String(raw.hostname ?? ""),
    status: String(raw.status ?? ""),
    plan: planNameOf(raw.plan),
    ip: String(raw.ip ?? ""),
    node: typeof node === "string" ? node : String((node as { name?: string } | null)?.name ?? ""),
    region: String(raw.region ?? (node as { region?: string } | null)?.region ?? ""),
    os: String(raw.os ?? raw.image ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    expiresAt: String(raw.expiresAt ?? ""),
    usage: usage ?? { cpu: 0, ram: 0, disk: 0 },
  };
}

function isActiveStatus(status: string): boolean {
  return ["Running", "RUNNING", "Creating", "CREATING", "BOOTING", "RESTARTING", "REBUILDING"].includes(status);
}

export default function OverviewPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balance, setBalance] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [insts, wallet, pl, me] = await Promise.all([
          api().get("/v1/instances") as Promise<{ items: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>,
          api().get("/v1/billing/wallet") as Promise<{ balance: number; transactions: unknown[] }>,
          api().get("/v1/plans") as Promise<Plan[]>,
          api().get("/v1/auth/me") as Promise<{ name: string | null; email: string }>,
        ]);
        setInstances((insts.items ?? []).map(normalizeInstance));
        setPlans(pl ?? []);
        setBalance(wallet?.balance ?? 0);
        const name = me?.name?.trim() || me?.email?.split("@")[0] || null;
        setDisplayName(name);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const matchPlan = (name: string) =>
    plans.find((p) => p.name === name || p.slug === name.toLowerCase() || p.name.toLowerCase() === name.toLowerCase());

  const running = instances.filter((i) => isActiveStatus(i.status));

  const monthlySpend = useMemo(
    () => running.reduce((sum, i) => sum + (matchPlan(i.plan)?.priceNgn ?? 0), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [running, plans],
  );

  const totalStorage = useMemo(
    () => running.reduce((sum, i) => sum + (matchPlan(i.plan)?.storageGb ?? 0), 0),
    [running, plans],
  );

const statSkeleton = <StatGridSkeleton items={4} />;

  const instanceSkeleton = <GridSkeleton items={6} cols={{ base: 1, sm: 2, lg: 3 }} />;

  const runRateSkeleton = (
    <DashCard className="elev-1 p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-24" />
    </DashCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={loading ? "" : `${greeting()}${displayName ? `, ${displayName}` : ""}`}
        description={loading ? "" : "Here is what is happening with your infrastructure today."}
        actions={
          <PrimaryButton onClick={() => router.push("/dashboard/instances/new")} disabled={loading}>
            <Plus size={14} weight="bold" /> Deploy Instance
          </PrimaryButton>
        }
      />

      {loading ? statSkeleton : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DashCard className="elev-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-text-muted">Active instances</p>
                <p className="mt-2 text-[22px] font-medium tracking-tight text-white">
                  {running.length}
                  <span className="ml-1 text-[13px] font-normal text-text-muted">/ {instances.length}</span>
                </p>
              </div>
              <div className={STAT_ICON} aria-hidden>
                <ComputerTower size={20} weight="bold" />
              </div>
            </div>
          </DashCard>

          <DashCard className="elev-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-text-muted">Monthly run rate</p>
                <p className="mt-2 font-mono text-[22px] font-medium tracking-tight text-white">
                  <PriceTag amount={monthlySpend} />
                </p>
              </div>
              <div className={STAT_ICON} aria-hidden>
                <TrendUp size={20} weight="bold" />
              </div>
            </div>
          </DashCard>

          <DashCard className="elev-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-text-muted">Wallet balance</p>
                <p className="mt-2 font-mono text-[22px] font-medium tracking-tight text-white">
                  <PriceTag amount={balance} />
                </p>
              </div>
              <div className={STAT_ICON} aria-hidden>
                <Wallet size={20} weight="bold" />
              </div>
            </div>
            <a
              href="/dashboard/billing/wallet"
              className="mt-2 inline-flex items-center gap-1 text-[12px] text-text-secondary transition-colors hover:text-white"
            >
              Top up <ArrowRight size={12} weight="bold" />
            </a>
          </DashCard>

          <DashCard className="elev-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-text-muted">Allocated storage</p>
                <p className="mt-2 text-[22px] font-medium tracking-tight text-white">
                  {totalStorage} GB
                </p>
              </div>
              <div className={STAT_ICON} aria-hidden>
                <HardDrive size={20} weight="bold" />
              </div>
            </div>
          </DashCard>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-white">Recent instances</h2>
            {!loading && instances.length > 0 ? (
              <a href="/dashboard/instances" className="text-[12px] text-text-muted transition-colors hover:text-text-secondary">
                View all →
              </a>
            ) : null}
          </div>

          {loading ? (
            instanceSkeleton
          ) : instances.length === 0 ? (
            <EmptyStateSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {instances.slice(0, 6).map((i) => {
                const plan = matchPlan(i.plan);
                return (
                  <div
                    key={i.id}
                    className="elev-1 transition-colors hover:border-border hover:bg-surface-hover/30 cursor-pointer"
                    onClick={() => router.push(`/dashboard/instances/${i.id}`)}
                  >
                    <DashCard className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-secondary">
                          <TerminalWindow size={16} weight="bold" />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="truncate font-mono text-[13px] font-medium text-white">
                              {i.hostname}
                            </p>
                            <StatusDot
                              status={i.status as "Running" | "Stopped" | "Error" | "Suspended" | "Creating" | "Paused"}
                            />
                          </div>
                          <p className="flex flex-wrap gap-2 font-mono text-[11px] text-text-muted">
                            <span>{i.plan}</span>
                            <span aria-hidden>·</span>
                            <span>{i.os}</span>
                            <span className="hidden sm:inline" aria-hidden>·</span>
                            <span className="hidden sm:inline">{plan ? `${plan.cpu}vCPU` : "—"}</span>
                            {plan && <span className="hidden sm:inline" aria-hidden>·</span>}
                            {plan && <span className="hidden sm:inline">{plan.ramMb >= 1024 ? `${plan.ramMb / 1024}GB` : `${plan.ramMb}MB`} RAM</span>}
                          </p>
                        </div>
                      </div>
                      <InstanceMenu instance={i} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-muted border-t border-border-faint pt-3">
                      <span className="flex items-center gap-1">
                        <span className="text-text-secondary">{i.ip || "—"}</span>
                      </span>
                      <span aria-hidden>·</span>
                    </div>
                    </DashCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {loading ? runRateSkeleton : (
          <DashCard className="elev-1">
            <h3 className="text-[13px] font-medium text-white">Monthly run rate</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Active instances are billed at about{" "}
              <strong className="font-mono font-medium text-white">
                <PriceTag amount={monthlySpend} />
              </strong>{" "}
              per month based on your current plans.
            </p>
            <LinkButton href="/dashboard/usage" variant="secondary" className="mt-3 h-8 text-[12px]">
              View usage <ArrowRight size={12} />
            </LinkButton>
          </DashCard>
        )}
      </div>
    </div>
  );
}
