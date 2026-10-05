"use client";

import { useEffect, useState } from "react";
import { EmptyState, TableSkeleton, Skeleton } from "@nairacloud/ui";
import { Plus, Trash, Key } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ApiError } from "@nairacloud/api-client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AddSshKeyDialog } from "@/components/add-ssh-key-dialog";
import { DashCard, PageHeader, PrimaryButton } from "@/components/dashboard";

type SshKey = { id: string; name: string; fingerprint: string; createdAt: string };

export default function SshKeysPage() {
  const [keys, setKeys] = useState<SshKey[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api().get("/v1/ssh-keys") as SshKey[];
        setKeys(data ?? []);
      } catch (err) {
        console.error("Failed to load ssh keys", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const addKey = async (name: string, pub: string) => {
    try {
      const key = await api().post("/v1/ssh-keys", { name, publicKey: pub }) as SshKey;
      setKeys((k) => [key, ...k]);
      setShowAdd(false);
      toast.success(`Key "${name}" added`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Key add failed");
    }
  };

  const removeKey = async (id: string) => {
    try {
      await api().del(`/v1/ssh-keys/${id}`);
      setKeys((k) => k.filter((kk) => kk.id !== id));
      toast.success("Key deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    }
    setConfirmId(null);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={loading ? "" : "SSH Keys"}
        description={loading ? "" : "Manage the public keys used to access your instances securely."}
        actions={
          <PrimaryButton onClick={() => setShowAdd(true)} disabled={loading}>
            <Plus size={14} weight="bold" /> Generate / add key
          </PrimaryButton>
        }
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <TableSkeleton rows={6} columns={4} />
        </>
      ) : keys.length === 0 ? (
        <EmptyState
          title="No SSH keys"
          body="Auto-generate a key in your browser, or paste an existing public key."
          icon={<Key size={32} />}
          action={
            <PrimaryButton onClick={() => setShowAdd(true)}>
              Generate or add a key
            </PrimaryButton>
          }
        />
      ) : (
        <DashCard padding={false} className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-faint text-[11px] font-medium uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Fingerprint</th>
                <th className="px-4 py-3">Added</th>
                <th className="w-16 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-faint">
              {keys.map((k) => (
                <tr key={k.id} className="group transition-colors hover:bg-surface-hover/50">
                  <td className="px-4 py-3.5 font-medium text-white">{k.name}</td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-text-muted">{k.fingerprint}</td>
                  <td className="px-4 py-3.5 text-text-muted">
                    {new Date(k.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setConfirmId(k.id)}
                        aria-label={`Delete ${k.name}`}
                        className="press inline-flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash size={16} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      )}
      <p className="text-[13px] text-text-muted">New instances automatically inject your SSH keys during bootstrap.</p>

      <AddSshKeyDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={addKey}
      />

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete SSH key?"
        body="Instances currently using this key will not be affected, but you won't be able to use it for new instances. Are you sure you want to remove it?"
        confirmLabel="Delete key"
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (!confirmId) return;
          void removeKey(confirmId);
        }}
      />
    </div>
  );
}
