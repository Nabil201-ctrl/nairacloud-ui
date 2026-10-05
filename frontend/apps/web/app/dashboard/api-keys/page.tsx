"use client";

import { useEffect, useState } from "react";
import { Plus, Copy, Key } from "@phosphor-icons/react";
import { toast } from "sonner";
import { PriceTag, cn, GridSkeleton, Skeleton, CardSkeleton } from "@nairacloud/ui";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashCard, PageHeader, PrimaryButton, SecondaryButton } from "@/components/dashboard";

type Plan = { id: string; slug: string; name: string; description: string; cpu: number; ramMb: number; storageGb: number; priceNgn: number; status: string };
type ApiKey = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string; revoked?: boolean };

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [k, p] = await Promise.all([
          api().get("/v1/api-keys") as Promise<ApiKey[]>,
          api().get("/v1/plans") as Promise<Plan[]>,
        ]);
        setKeys(k ?? []);
        setPlans(p ?? []);
      } catch (err) {
        console.error("Failed to load api keys", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const generate = async () => {
    if (!name.trim()) {
      toast.error("Name the key so you can spot it later");
      return;
    }
    try {
      const key = await api().post("/v1/api-keys", { name: name.trim() }) as ApiKey & { raw: string };
      setSecret(key.raw);
      setKeys((k) => [key, ...k]);
      setName("");
      setShowGenerate(false);
    } catch (err) {
      toast.error("Generate failed");
    }
  };

  const revoke = async (id: string) => {
    try {
      await api().del(`/v1/api-keys/${id}`);
      setKeys((k) => k.map((kk) => (kk.id === id ? { ...kk, revoked: true } : kk)));
      toast.success("Key revoked");
    } catch (err) {
      toast.error("Revoke failed");
    }
    setConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={loading ? "" : "API & keys"}
        description={loading ? "" : "Keys for the deploy API are charged ₦200 flat under STARTER+, counted once, forever."}
        actions={
          <PrimaryButton onClick={() => setShowGenerate(true)} disabled={loading}>
            <Plus size={14} weight="bold" /> Generate key
          </PrimaryButton>
        }
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <GridSkeleton items={8} cols={{ base: 1, sm: 2, lg: 3 }} />
          <CardSkeleton lines={8} />
        </>
      ) : (
        <>
<DashCard padding={false} className="overflow-hidden">
            {secret && (
              <div className="border-b border-border-faint bg-surface px-4 py-5">
                <p className="text-[15px] font-medium text-white">Copy this now.</p>
                <p className="mt-1 text-[13px] text-text-muted">
                  The full secret shows once — we do not store it. If you lose it, generate a fresh key.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 break-all rounded-sm border border-border-faint bg-bg px-3 py-2 font-mono text-[12px] text-white">
                    {secret}
                  </code>
                  <SecondaryButton
                    onClick={() => {
                      navigator.clipboard?.writeText(secret);
                      toast.success("Secret copied");
                    }}
                    aria-label="Copy secret"
                    className="h-9 shrink-0"
                  >
                    <Copy size={14} aria-hidden /> Copy
                  </SecondaryButton>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map((k) => (
                <div key={k.id} className={cn("elev-1", k.revoked && "opacity-40")}>
                  <DashCard className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[13px] font-medium text-white">
                          <Key size={14} aria-hidden className="text-text-muted" />
                          {k.name}
                        </p>
                        {k.revoked && <p className="mt-0.5 text-[12px] text-danger">Revoked</p>}
                        <p className="mt-1 font-mono text-[12px] text-text-muted">{k.prefix}</p>
                        <p className="mt-1 text-[12px] text-text-muted">
                          Created {new Date(k.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="mt-1 text-[12px] text-text-muted">
                          Last used {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "—"}
                        </p>
                      </div>
                      {!k.revoked && (
                        <button
                          type="button"
                          onClick={() => setConfirmId(k.id)}
                          className="press rounded-sm border border-border-faint px-3 py-1.5 text-[12px] text-text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </DashCard>
                </div>
              ))}
            </div>
          </DashCard>

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button type="button" aria-label="Close" onClick={() => setShowGenerate(false)} className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Generate API key"
            className="relative w-full max-w-md rounded-md border border-border-faint bg-card p-5"
          >
            <h2 className="text-[15px] font-medium text-white">Generate API key</h2>
            <label className="mt-4 block">
              <span className="mb-1 block text-[13px] font-medium text-white">Key name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="deploy-script"
                autoFocus
                className="w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-[13px] text-white focus:border-border-hover focus:outline-none"
              />
            </label>
            <p className="mt-4 rounded-sm border border-border-faint bg-surface px-3 py-2 text-[12px] text-text-muted">
              Scope is <span className="font-mono text-white">&quot;maintain&quot;</span> for now — full deploy/start/stop/rebuild/delete reach, same as the console. Fine-grained scopes arrive with the API.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <SecondaryButton onClick={() => setShowGenerate(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={() => void generate()}>Generate</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <DashCard padding={false}>
        <div className="border-b border-border-faint px-4 py-3.5">
          <h2 className="text-[13px] font-medium text-white">Costs by plan</h2>
        </div>
        <ul className="divide-y divide-border-faint">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-[12px] text-text-secondary">{p.name}</span>
              <span className="font-mono text-[13px] text-white">
                <PriceTag amount={p.priceNgn ? 200 : 0} />
              </span>
            </li>
          ))}
        </ul>
      </DashCard>
        </>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Revoke this key?"
        body="Anything using the key — deploys, scripts, Terraform — will stop working immediately. You can generate a replacement anytime."
        confirmLabel="Revoke key"
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (!confirmId) return;
          revoke(confirmId);
        }}
      />
    </div>
  );
}
