"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Stack, ArrowsClockwise } from "@phosphor-icons/react";
import { formatNaira } from "@nairacloud/ui";
import { PageHead, Pill, RTable, Field, TableSkeleton, inputCls, selectCls, btnGhost, btnPrimary } from "@/components/ui";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: "ACTIVE" | "LIMITED" | "DISABLED" | string;
};

type NewPlan = {
  name: string;
  slug: string;
  description: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: Plan["status"];
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Plan | null>(null);
  const [draft, setDraft] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<NewPlan>({
    name: "",
    slug: "",
    description: "",
    cpu: 1,
    ramMb: 1024,
    storageGb: 25,
    priceNgn: 5000,
    status: "ACTIVE",
  });

  const loadPlans = async () => {
    try {
      const data = (await api().get("/v1/admin/plans")) as Plan[];
      setPlans(data ?? []);
    } catch (err) {
      toast.error("Failed to load plan matrix");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const openEdit = (p: Plan) => {
    setEdit(p);
    setDraft({ ...p });
  };

  const savePlan = async () => {
    if (!edit || !draft) return;
    try {
      await api().patch(`/v1/admin/plans/${edit.id}`, {
        priceNgn: Number(draft.priceNgn) || 0,
        cpu: Number(draft.cpu) || 0,
        ramMb: Number(draft.ramMb) || 1024,
        storageGb: Number(draft.storageGb) || 10,
        status: draft.status,
      });
      toast.success(`${draft.name} plan updated`, {
        description: "New pricing and specs apply to future deploys.",
      });
      await loadPlans();
      setEdit(null);
      setDraft(null);
    } catch (err) {
      toast.error("Plan update failed");
    }
  };

  const createPlan = async () => {
    if (!createDraft.name.trim()) return toast.error("Plan name is required");
    try {
      await api().post("/v1/admin/plans", {
        name: createDraft.name.trim(),
        slug: createDraft.slug.trim() || undefined,
        description: createDraft.description.trim() || undefined,
        cpu: Number(createDraft.cpu) || 1,
        ramMb: Number(createDraft.ramMb) || 1024,
        storageGb: Number(createDraft.storageGb) || 10,
        priceNgn: Number(createDraft.priceNgn) || 0,
        status: createDraft.status,
      });
      toast.success(`${createDraft.name} created`, {
        description: "It now appears on pricing and the customer deploy wizard.",
      });
      setCreating(false);
      setCreateDraft({
        name: "",
        slug: "",
        description: "",
        cpu: 1,
        ramMb: 1024,
        storageGb: 25,
        priceNgn: 5000,
        status: "ACTIVE",
      });
      await loadPlans();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Plan create failed");
    }
  };

  const toggleLimited = async (p: Plan) => {
    const nextStatus = p.status === "LIMITED" ? "ACTIVE" : "LIMITED";
    try {
      await api().patch(`/v1/admin/plans/${p.id}`, { status: nextStatus });
      toast.success(
        `${p.name} → ${nextStatus === "LIMITED" ? "LIMITED (waitlist opened)" : "ACTIVE (waitlist closed)"}`
      );
      await loadPlans();
    } catch (err) {
      toast.error("Availability toggle failed");
    }
  };

  const totalRamMb = plans.reduce((a, p) => a + (p.ramMb || 0), 0);

  return (
    <div className="space-y-6">
      <PageHead
        title="Plan Matrix"
        sub="Standardized compute sizes priced in Nigerian Naira (₦). LIMITED status activates the public waitlist banner on customer deploy wizards."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
              <Stack size={14} weight="bold" />
              <span>New Plan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadPlans();
              }}
              className={btnGhost}
            >
              <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh Plans</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <RTable
          head={["Plan Name", "Monthly Rate", "vCPU Cores", "RAM Memory", "Storage", "Availability", "Action"]}
          rows={plans.map((p) => {
            const isLimited = p.status === "LIMITED";
            const isActive = p.status === "ACTIVE";

            return [
              {
                v: (
                  <div>
                    <p className="font-mono text-sm font-bold text-text">{p.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{p.description}</p>
                  </div>
                ),
              },
              {
                v: (
                  <span className="font-mono text-sm font-bold tabular-nums text-text">
                    {p.priceNgn === 0 ? "Free Tier" : `${formatNaira(p.priceNgn)}/mo`}
                  </span>
                ),
              },
              {
                v: <span className="font-mono text-xs font-semibold text-text">{p.cpu} vCPU</span>,
              },
              {
                v: <span className="font-mono text-xs font-semibold text-text">{p.ramMb / 1024} GB</span>,
              },
              {
                v: <span className="font-mono text-xs font-semibold text-text">{p.storageGb} GB NVMe</span>,
              },
              {
                v: (
                  <div className="flex items-center gap-2">
                    <Pill tone={isActive ? "accent" : isLimited ? "warn" : "muted"} dot>
                      {p.status}
                    </Pill>
                    <button
                      type="button"
                      onClick={() => void toggleLimited(p)}
                      title="Toggle limited availability"
                      className="press rounded border border-border/70 bg-surface/40 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-accent/40 hover:text-accent transition-colors"
                    >
                      {isLimited ? "Open Seats" : "Limit"}
                    </button>
                  </div>
                ),
              },
              {
                v: (
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="press rounded-md border border-border/70 bg-surface/40 px-3 py-1 font-mono text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    Edit
                  </button>
                ),
              },
            ];
          })}
        />
      )}

      {creating && (
        <Modal
          open
          title="Create catalog plan"
          onClose={() => setCreating(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className={btnGhost}>
                Cancel
              </button>
              <button type="button" onClick={createPlan} className={btnPrimary}>
                Create Plan
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <Field label="Name">
              <input
                value={createDraft.name}
                onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })}
                className={inputCls}
                placeholder="e.g. Nano · 0.5 vCPU"
              />
            </Field>
            <Field label="Slug (optional)">
              <input
                value={createDraft.slug}
                onChange={(e) => setCreateDraft({ ...createDraft, slug: e.target.value })}
                className={inputCls}
                placeholder="auto from name if blank"
              />
            </Field>
            <Field label="Description">
              <input
                value={createDraft.description}
                onChange={(e) => setCreateDraft({ ...createDraft, description: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₦ / Month)">
                <input type="number" min={0} value={createDraft.priceNgn} onChange={(e) => setCreateDraft({ ...createDraft, priceNgn: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="vCPU Cores">
                <input type="number" min={0.25} step={0.25} value={createDraft.cpu} onChange={(e) => setCreateDraft({ ...createDraft, cpu: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="RAM (MB)">
                <input type="number" min={256} value={createDraft.ramMb} onChange={(e) => setCreateDraft({ ...createDraft, ramMb: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Storage (GB NVMe)">
                <input type="number" min={5} value={createDraft.storageGb} onChange={(e) => setCreateDraft({ ...createDraft, storageGb: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
            <Field label="Availability State">
              <select value={createDraft.status} onChange={(e) => setCreateDraft({ ...createDraft, status: e.target.value as Plan["status"] })} className={selectCls}>
                <option value="ACTIVE">ACTIVE (Open for provisioning)</option>
                <option value="LIMITED">LIMITED (Shows waitlist banner)</option>
                <option value="DISABLED">DISABLED (Hidden from customers)</option>
              </select>
            </Field>
            <p className="text-xs text-text-muted">
              New plans show on the customer pricing page and deploy wizard as soon as they are ACTIVE.
            </p>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {draft && edit && (
        <Modal
          open
          title={`Edit ${draft.name} Plan`}
          onClose={() => setEdit(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEdit(null)} className={btnGhost}>
                Cancel
              </button>
              <button type="button" onClick={savePlan} className={btnPrimary}>
                Save Plan Changes
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₦ / Month)">
                <input
                  type="number"
                  min={0}
                  value={draft.priceNgn}
                  onChange={(e) => setDraft({ ...draft, priceNgn: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="vCPU Cores">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.cpu}
                  onChange={(e) => setDraft({ ...draft, cpu: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="RAM (MB)">
                <input
                  type="number"
                  min={512}
                  value={draft.ramMb}
                  onChange={(e) => setDraft({ ...draft, ramMb: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="Storage (GB NVMe)">
                <input
                  type="number"
                  min={10}
                  value={draft.storageGb}
                  onChange={(e) => setDraft({ ...draft, storageGb: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Availability State">
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as Plan["status"] })}
                className={selectCls}
              >
                <option value="ACTIVE">ACTIVE (Open for provisioning)</option>
                <option value="LIMITED">LIMITED (Shows waitlist banner)</option>
                <option value="DISABLED">DISABLED (Hidden from customers)</option>
              </select>
            </Field>

            <p className="text-xs text-text-muted font-mono">
              Slug: <strong className="text-text">{draft.slug}</strong> · Mutations will write to the audit log.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}