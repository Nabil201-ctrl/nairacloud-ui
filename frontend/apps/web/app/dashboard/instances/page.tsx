"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusDot, EmptyState, TableSkeleton, Skeleton, GridSkeleton } from "@nairacloud/ui";
import { Plus, MagnifyingGlass, HardDrives, List, GridFour } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { InstanceMenu } from "@/components/instance-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader, LinkButton, SecondaryButton, DashCard, PrimaryButton } from "@/components/dashboard";

type Instance = { id: string; hostname: string; status: string; plan: string; ip: string; sshHost: string; sshPort: number; node: string; region: string; os: string; createdAt: string; expiresAt: string; usage: { cpu: number; ram: number; disk: number } };
type Plan = { id: string; slug: string; name: string; description: string; cpu: number; ramMb: number; storageGb: number; priceNgn: number; status: string };

const STATUS_FILTERS = ["All", "Running", "Stopped", "Error", "Suspended"] as const;

type ApiInstance = Instance & { node?: { ip?: string } | null; plan?: string | { name?: string } | null };

function normalizeInstance(i: ApiInstance): Instance {
  return {
    ...i,
    plan: typeof i.plan === "string" ? i.plan : String((i.plan as { name?: string } | null | undefined)?.name ?? ""),
    sshHost: i.node?.ip || i.ip,
    sshPort: Number(i.sshPort ?? 22) || 22,
  };
}

export default function InstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [insts, pl] = await Promise.all([
          api().get("/v1/instances") as Promise<{ items: ApiInstance[];
            meta: { page: number; limit: number; total: number };
          }>,
          api().get("/v1/plans") as Promise<Plan[]>,
        ]);
        setInstances((insts.items ?? []).map(normalizeInstance));
        setPlans(pl ?? []);
      } catch (err) {
        console.error("Failed to load instances", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const planById = (slug: string) => plans.find((p) => p.slug === slug.toLowerCase() || p.name.toLowerCase() === slug.toLowerCase());

  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"created" | "name">("created");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<"restart" | "delete" | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return instances
      .filter((i) => (status === "All" ? true : i.status === status))
      .filter((i) => !needle || i.hostname.toLowerCase().includes(needle) || i.ip.includes(needle))
      .sort((a, b) => (sort === "name" ? a.hostname.localeCompare(b.hostname) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [instances, status, q, sort]);

  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelected(allSelected ? new Set() : new Set(filtered.map((i) => i.id)));
  };
  const toggle = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const runBulk = async () => {
    const targets = instances.filter((i) => selected.has(i.id));
    try {
      for (const i of targets) {
        if (bulk === "restart") await api().post(`/v1/instances/${i.id}/action`, { action: "REBOOT" });
        if (bulk === "delete") await api().del(`/v1/instances/${i.id}`);
      }
      toast.success(bulk === "delete" ? `Deleted ${targets.length} instance${targets.length === 1 ? "" : "s"}` : `Restarted ${targets.length} instance${targets.length === 1 ? "" : "s"}`);
      const updated = await api().get("/v1/instances") as { items: ApiInstance[]; meta: { page: number; limit: number; total: number } };
      setInstances((updated.items ?? []).map(normalizeInstance));
    } catch (err) {
      toast.error("Bulk action failed");
    }
    setSelected(new Set());
    setBulk(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={loading ? "" : "Instances"}
        description={loading ? "" : "Manage your compute infrastructure."}
        actions={
          <PrimaryButton onClick={() => router.push("/dashboard/instances/new")} disabled={loading}>
            <Plus size={14} weight="bold" aria-hidden /> Deploy Instance
          </PrimaryButton>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <GridSkeleton items={8} cols={{ base: 1, sm: 2, lg: 3 }} />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-border-secondary bg-control px-3 h-9 w-full sm:max-w-xs focus-within:border-border-hover">
              <MagnifyingGlass size={14} aria-hidden className="shrink-0 text-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search hostname or IP"
                className="w-full bg-transparent text-[13px] text-text placeholder-text-muted focus:outline-none"
              />
            </div>

            <div className="flex h-9 items-center rounded-sm border border-border-secondary bg-control px-3 w-full sm:w-auto">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
                className="appearance-none bg-transparent pr-4 text-[13px] text-text focus:outline-none cursor-pointer w-full"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <SecondaryButton onClick={() => setBulk("restart")} className="w-full sm:w-auto">
                  Restart ({selected.size})
                </SecondaryButton>
                <button
                  type="button"
                  onClick={() => setBulk("delete")}
                  className="press inline-flex h-9 items-center justify-center rounded-sm border border-danger/40 bg-danger/5 px-3.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10 w-full sm:w-auto"
                >
                  Delete ({selected.size})
                </button>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={instances.length === 0 ? "No instances deployed" : "No results found"}
              body={instances.length === 0 ? "Get your first cloud server online in minutes." : "Try adjusting your search or status filter."}
              icon={<HardDrives size={32} />}
              action={
                instances.length === 0 ? (
                  <LinkButton href="/dashboard/instances/new">Deploy instance</LinkButton>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((i) => {
                const plan = planById(`pl_${i.plan.toLowerCase()}`);
                return (
                  <div
                    key={i.id}
                    className="elev-1 transition-colors hover:border-border hover:bg-surface-hover/30 cursor-pointer"
                    onClick={() => router.push(`/dashboard/instances/${i.id}`)}
                  >
                    <DashCard className="p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface">
                            <StatusDot status={i.status} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-mono text-[13px] font-medium text-white">{i.hostname}</p>
                            <p className="text-[11px] text-text-muted">{i.os}</p>
                          </div>
                        </div>
                        <InstanceMenu instance={i} />
                      </div>
                      <div className="mt-3 space-y-1.5 text-[12px] text-text-muted border-t border-border-faint pt-3">
                        <p className="font-mono text-text-secondary">{i.plan}</p>
                        <p className="flex items-center gap-1">
                          <span className="font-mono">{i.sshHost || i.ip}</span>
                          <span aria-hidden>·</span>
                          <span>{i.region}</span>
                        </p>
                        <p className="font-mono">
                          {plan ? `${plan.cpu}c / ${plan.ramMb / 1024}GB / ${plan.storageGb}GB` : "—"}
                        </p>
                        <p>{new Date(i.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </DashCard>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={bulk !== null}
        title={bulk === "delete" ? `Delete ${selected.size} instance${selected.size === 1 ? "" : "s"}?` : `Restart ${selected.size} instance${selected.size === 1 ? "" : "s"}?`}
        body={bulk === "delete" ? "All data on the selected instances is erased immediately and cannot be recovered. This action is irreversible." : "Running instances will restart; stopped ones will be brought back up."}
        confirmLabel={bulk === "delete" ? "Delete" : "Restart"}
        onClose={() => setBulk(null)}
        onConfirm={runBulk}
      />
    </div>
  );
}
