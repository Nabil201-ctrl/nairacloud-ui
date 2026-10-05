"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DotsThree, Play, Stop, ArrowClockwise, CreditCard, Monitor } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export type Instance = { id: string; hostname: string; status: string; plan: string; ip: string; node: string; region: string; os: string; createdAt: string; expiresAt: string; usage: { cpu: number; ram: number; disk: number } };

export function InstanceMenu({ instance }: { instance: Instance }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Phosphor Icon props are wider than our usage; keep loose typing like the rest of the app.
  const Item = ({ Icon, label, danger, onClick }: { Icon: React.ComponentType<any>; label: string; danger?: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-surface-hover truncate ${danger ? "text-danger hover:text-danger" : "text-text-secondary hover:text-white"}`}
    >
      <Icon size={14} aria-hidden className="text-text-muted shrink-0" /> {label}
    </button>
  );

  const isPaused = instance.status === "Paused" || instance.status === "SUSPENDED";
  const isRunning = instance.status === "Running" || instance.status === "RUNNING";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${instance.hostname}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="press flex h-8 w-8 items-center justify-center rounded-sm border border-border-secondary text-text-muted transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-white"
      >
        <DotsThree size={16} aria-hidden />
      </button>
      {open && (
        <div className="absolute top-9 z-30 w-full sm:w-48 lg:w-56 rounded-md border border-border-faint bg-card py-1 overflow-hidden left-0 right-0 sm:left-auto sm:right-0">
          {isPaused ? (
            <Item
              Icon={CreditCard}
              label="Renew Subscription"
              onClick={() => { setOpen(false); router.push("/dashboard/billing/wallet"); }}
            />
          ) : (
            <>
              <Item
                Icon={Monitor}
                label="Console"
                onClick={() => {
                  setOpen(false);
                  router.push(`/dashboard/instances/${instance.id}?tab=Console`);
                }}
              />
              {!isRunning ? (
                <Item Icon={Play} label="Start" onClick={async () => { setOpen(false); try { await api().post(`/v1/instances/${instance.id}/action`, { action: "START" }); toast.success(`${instance.hostname} started`); } catch { toast.error("Action failed"); } }} />
              ) : (
                <Item Icon={Stop} label="Stop" onClick={async () => { setOpen(false); try { await api().post(`/v1/instances/${instance.id}/action`, { action: "STOP" }); toast.success(`${instance.hostname} stopped`); } catch { toast.error("Action failed"); } }} />
              )}
              <Item
                Icon={ArrowClockwise}
                label="Rebuild OS"
                danger
                onClick={async () => {
                  setOpen(false);
                  try {
                    await api().post(`/v1/instances/${instance.id}/action`, { action: "REBUILD" });
                    toast.success(`${instance.hostname} rebuild started`);
                  } catch {
                    toast.error("Rebuild failed");
                  }
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
