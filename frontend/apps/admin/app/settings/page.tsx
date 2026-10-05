"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GearSix, CheckCircle, Warning, ShieldCheck, ArrowsClockwise } from "@phosphor-icons/react";
import { PageHead, Pill, Field, inputCls, selectCls, btnGhost, btnPrimary } from "@/components/ui";
import { api } from "@/lib/api";

function normalizeSettings(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (Array.isArray(data)) {
    const obj: Record<string, unknown> = {};
    for (const item of data) {
      if (item && typeof item === "object" && "key" in item) {
        obj[item.key] = item.value;
      }
    }
    return obj;
  }
  return data as Record<string, unknown>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await api().get("/v1/admin/settings");
      setSettings(normalizeSettings(data));
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const maintenanceMode =
    Boolean(settings.maintenance_mode) || Boolean(settings.maintenanceBanner);
  const maintenanceMessage =
    (settings.maintenanceMessage as string) ||
    (settings.maintenance_message as string) ||
    "Scheduled infrastructure maintenance in progress. VM provisioning will resume shortly.";
  const freeTierSignup =
    settings.freeTierSignup !== undefined
      ? Boolean(settings.freeTierSignup)
      : settings.free_tier_signup !== undefined
      ? Boolean(settings.free_tier_signup)
      : true;
  const capacityReservePct =
    Number(settings.capacityReservePct ?? settings.capacity_reserve_pct ?? 10);

  const [maintenanceMsg, setMaintenanceMsg] = useState(maintenanceMessage);
  const [reservePct, setReservePct] = useState(capacityReservePct);

  useEffect(() => {
    setMaintenanceMsg(maintenanceMessage);
  }, [maintenanceMessage]);

  useEffect(() => {
    setReservePct(capacityReservePct);
  }, [capacityReservePct]);

  const savePatch = async (patch: Record<string, unknown>, label: string) => {
    try {
      await api().patch("/v1/admin/settings", patch);
      setSettings((prev) => ({ ...prev, ...patch }));
      toast.success(label, {
        description: "Configuration synchronized across cluster control plane.",
      });
    } catch (err) {
      toast.error("Failed to save configuration switch");
    }
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Global Control Switches"
        sub="Global cluster configuration. Toggles here directly dictate customer provisioning capacity, marketing banners, and cluster-wide reservation buffers."
        actions={
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadSettings();
            }}
            className={btnGhost}
          >
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      <div className="space-y-6">
        {/* Maintenance Mode */}
        <section
          aria-label="Maintenance mode"
          className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-text text-base">Cluster Maintenance Mode</h2>
                {maintenanceMode && (
                  <Pill tone="warn" dot>
                    ACTIVE ON PRODUCTION
                  </Pill>
                )}
              </div>
              <p className="max-w-2xl text-xs text-text-muted leading-relaxed">
                Renders the global maintenance banner on customer apps and temporarily blocks new VM provisionings.
                Existing VMs remain running without disruption.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => {
                const nextVal = !maintenanceMode;
                void savePatch(
                  { maintenance_mode: nextVal, maintenanceBanner: nextVal },
                  nextVal ? "Maintenance mode activated" : "Maintenance mode deactivated"
                );
              }}
              className={`press relative h-6 w-11 rounded-full transition-colors shadow-inner cursor-pointer ${
                maintenanceMode ? "bg-accent" : "bg-border/80"
              }`}
            >
              <span
                aria-hidden
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg shadow-sm transition-transform ${
                  maintenanceMode ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Public Announcement Banner Text
              </label>
              <input
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                placeholder="Scheduled hardware maintenance..."
                className={inputCls}
              />
            </div>
            <div className="sm:self-end">
              <button
                type="button"
                onClick={() =>
                  void savePatch(
                    { maintenanceMessage: maintenanceMsg, maintenance_message: maintenanceMsg },
                    "Maintenance message saved"
                  )
                }
                className={btnPrimary}
              >
                Save Announcement
              </button>
            </div>
          </div>
        </section>

        {/* Free Tier Switch */}
        <section
          aria-label="Free tier switch"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-text text-base">Free Tier Sandbox Signups</h2>
              {!freeTierSignup && <Pill tone="warn">DISABLED</Pill>}
            </div>
            <p className="max-w-2xl text-xs text-text-muted leading-relaxed">
              When toggled off, new user signups only present paid plans (Starter, Pro, Ultra). Existing free tier
              instances will remain online.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={freeTierSignup}
            onClick={() => {
              const nextVal = !freeTierSignup;
              void savePatch(
                { freeTierSignup: nextVal, free_tier_signup: nextVal },
                nextVal ? "Free tier signups enabled" : "Free tier signups restricted"
              );
            }}
            className={`press relative h-6 w-11 rounded-full transition-colors shadow-inner cursor-pointer ${
              freeTierSignup ? "bg-accent" : "bg-border/80"
            }`}
          >
            <span
              aria-hidden
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg shadow-sm transition-transform ${
                freeTierSignup ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </section>

        {/* Hardware Capacity Reserve */}
        <section
          aria-label="Capacity buffer"
          className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,var(--surface)_0%,var(--bg)_100%)] p-6 shadow-sm"
        >
          <div className="border-b border-border/50 pb-4 mb-4">
            <h2 className="font-bold text-text text-base">Cluster RAM Safety Headroom</h2>
            <p className="max-w-2xl text-xs text-text-muted leading-relaxed mt-1">
              Reserve buffer of node physical memory that scheduler will never allocate to customer workloads. Protects
              kernel and node agent processes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <input
                type="number"
                min={5}
                max={30}
                value={reservePct}
                onChange={(e) => setReservePct(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <span className="font-mono text-xs text-text-muted">% of total host RAM</span>
            <button
              type="button"
              onClick={() =>
                void savePatch(
                  { capacityReservePct: reservePct, capacity_reserve_pct: reservePct },
                  `RAM safety buffer set to ${reservePct}%`
                )
              }
              className={btnPrimary}
            >
              Update Buffer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}