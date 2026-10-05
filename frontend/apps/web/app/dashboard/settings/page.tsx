"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@nairacloud/ui";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashCard, PageHeader, PrimaryButton, SecondaryButton, SegmentedControl } from "@/components/dashboard";
import { Skeleton, CardSkeleton, ListSkeleton, EmptyStateSkeleton } from "@nairacloud/ui";

const TABS = ["Profile", "Security", "Notifications", "Danger"] as const;
type Tab = (typeof TABS)[number];

type UserMe = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  orgId?: string | null;
  twoFactorEnabled?: boolean;
};

type NotificationSettings = {
  emailInstanceAlerts: boolean;
  emailBillingAlerts: boolean;
  emailMarketing: boolean;
  inAppAlerts: boolean;
};

const validPassword = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

function errMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await api().get<UserMe>("/v1/users/me");
      setUser(me);
    } catch (err) {
      setUser(null);
      setError(errMessage(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return (
    <div className="space-y-6">
      <PageHeader title={loading ? "" : "Settings"} description={loading ? "" : "Profile, security, and notification preferences."} />

      <SegmentedControl
        options={TABS.map((t) => ({ value: t, label: t }))}
        value={tab}
        onChange={setTab}
      />

      <div>
        {loading ? (
          <>
            <ListSkeleton items={4} />
            <CardSkeleton lines={4} />
            <EmptyStateSkeleton />
          </>
        ) : error ? (
          <DashCard className="max-w-lg border-danger/40">
            <p className="text-[13px] text-danger">{error}</p>
            <SecondaryButton onClick={() => void loadUser()} className="mt-4">
              Retry
            </SecondaryButton>
          </DashCard>
        ) : !user ? (
          <p className="text-[13px] text-text-muted">No profile found.</p>
        ) : tab === "Profile" ? (
          <ProfileTab user={user} onUpdated={setUser} />
        ) : tab === "Security" ? (
          <SecurityTab twoFactorEnabled={!!user.twoFactorEnabled} />
        ) : tab === "Notifications" ? (
          <NotificationsTab />
        ) : (
          <DangerTab email={user.email} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ user, onUpdated }: { user: UserMe; onUpdated: (u: UserMe) => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    (user.email[0]?.toUpperCase() ?? "?");

  useEffect(() => {
    setName(user.name ?? "");
  }, [user.name]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await api().patch<{ id: string; email: string; name: string }>("/v1/users/me", { name: trimmed });
      onUpdated({ ...user, name: updated.name, email: updated.email });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errMessage(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashCard className="max-w-lg">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border-subtle bg-surface font-mono text-[15px] font-medium text-white">
          {initials}
        </span>
        <div>
          <p className="text-[13px] font-medium text-white">Avatar</p>
          <p className="text-[12px] text-text-muted">Generated from your name — uploads come with the profile API.</p>
        </div>
      </div>
      <label className="mt-5 block">
        <span className="mb-1 block text-[13px] font-medium text-white">Full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1 block text-[13px] font-medium text-white">Email</span>
        <input
          value={user.email}
          type="email"
          readOnly
          className="w-full cursor-not-allowed rounded-sm border border-border bg-bg/60 px-3 py-2 text-[13px] text-text-muted focus:outline-none"
        />
      </label>
      <div className="mt-5 flex justify-end">
        <PrimaryButton disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save"}
        </PrimaryButton>
      </div>
    </DashCard>
  );
}

function SecurityTab({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twoFactor, setTwoFactor] = useState(twoFactorEnabled);
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (!current) {
      toast.error("Enter your current password");
      return;
    }
    if (!validPassword(next)) {
      toast.error("At least 8 characters, one letter, one number");
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await api().patch("/v1/users/me/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(errMessage(err, "Could not update password"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid max-w-3xl gap-3 md:grid-cols-2">
      <DashCard>
        <h2 className="text-[13px] font-medium text-white">Change password</h2>
        <p className="mt-1 text-[12px] text-text-muted">At least 8 characters with a letter, number and symbol.</p>
        <label className="mt-4 block">
          <span className="mb-1 block text-[13px] font-medium text-white">Current password</span>
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-[13px] font-medium text-white">New password</span>
          <input
            value={next}
            onChange={(e) => setNext(e.target.value)}
            type="password"
            autoComplete="new-password"
            className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-[13px] font-medium text-white">Confirm new password</span>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            autoComplete="new-password"
            className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
          />
        </label>
        <div className="mt-5 flex justify-end">
          <PrimaryButton disabled={saving} onClick={() => void changePassword()}>
            {saving ? "Updating…" : "Update password"}
          </PrimaryButton>
        </div>
      </DashCard>
      <DashCard>
        <h2 className="text-[13px] font-medium text-white">Two-factor authentication</h2>
        <p className="mt-1 text-[12px] text-text-muted">
          Six-digit codes from your authenticator app at login. MVP+1 — toggle previews the flow.
        </p>
        <button
          type="button"
          onClick={() => setTwoFactor(!twoFactor)}
          className={cn(
            "press mt-6 h-7 w-12 rounded-full border transition-colors",
            twoFactor ? "border-accent bg-accent" : "border-border bg-bg",
          )}
          aria-pressed={twoFactor}
          aria-label="Toggle two-factor authentication"
        >
          <span
            className={cn(
              "block h-4 w-4 translate-y-[5px] rounded-full bg-white transition-transform",
              twoFactor ? "translate-x-7" : "translate-x-1",
            )}
          />
        </button>
        <p className="mt-4 text-[12px] text-text-muted">
          {twoFactor ? "Enabled — codes from your authenticator app." : "Disabled — enable once the API ships."}
        </p>
      </DashCard>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const items: { key: keyof NotificationSettings; label: string; desc: string }[] = [
    { key: "emailBillingAlerts", label: "Billing", desc: "Invoices, failed payments, plan changes." },
    { key: "emailInstanceAlerts", label: "Incidents", desc: "Instance status changes and outages, whatever the hour." },
    { key: "emailMarketing", label: "Product", desc: "New plans, capacity openings, feature drops." },
    { key: "inAppAlerts", label: "In-app", desc: "Bell notifications inside the dashboard." },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api().get<NotificationSettings>("/v1/users/me/notifications-settings");
      setPrefs({
        emailInstanceAlerts: data.emailInstanceAlerts ?? true,
        emailBillingAlerts: data.emailBillingAlerts ?? true,
        emailMarketing: data.emailMarketing ?? false,
        inAppAlerts: data.inAppAlerts ?? true,
      });
    } catch (err) {
      setPrefs(null);
      setError(errMessage(err, "Failed to load notification preferences"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await api().patch<NotificationSettings>("/v1/users/me/notifications-settings", prefs);
      setPrefs({
        emailInstanceAlerts: updated.emailInstanceAlerts,
        emailBillingAlerts: updated.emailBillingAlerts,
        emailMarketing: updated.emailMarketing,
        inAppAlerts: updated.inAppAlerts,
      });
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(errMessage(err, "Could not save preferences"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-[13px] text-text-muted">Loading notification preferences…</p>;
  }

  if (error || !prefs) {
    return (
      <DashCard className="max-w-lg border-danger/40">
        <p className="text-[13px] text-danger">{error ?? "No preferences found."}</p>
        <SecondaryButton onClick={() => void load()} className="mt-4">
          Retry
        </SecondaryButton>
      </DashCard>
    );
  }

  return (
    <DashCard padding={false} className="max-w-lg overflow-hidden">
      <ul className="divide-y divide-border-faint">
        {items.map((i) => (
          <li key={i.key} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-[13px] font-medium text-white">{i.label}</p>
              <p className="text-[12px] text-text-muted">{i.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, [i.key]: !prefs[i.key] })}
              className={cn(
                "press h-7 w-12 rounded-full border transition-colors",
                prefs[i.key] ? "border-accent bg-accent" : "border-border bg-bg",
              )}
              aria-pressed={prefs[i.key]}
              aria-label={`Toggle ${i.label} notifications`}
            >
              <span
                className={cn(
                  "block h-4 w-4 translate-y-[5px] rounded-full bg-white transition-transform",
                  prefs[i.key] ? "translate-x-7" : "translate-x-1",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-border-faint px-4 py-3.5 text-right">
        <PrimaryButton disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save"}
        </PrimaryButton>
      </div>
    </DashCard>
  );
}

function DangerTab({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await api().del("/v1/users/me");
      toast.success("Account deleted");
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error(errMessage(err, "Could not delete account"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashCard className="max-w-lg border-danger/40">
      <h2 className="text-[13px] font-medium text-danger">Delete account</h2>
      <p className="mt-1 text-[12px] text-text-muted">
        Removes every instance, key, ticket, and invoice. Invoices already issued stay on file for tax — your data does not. This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press rounded-sm border border-danger/50 px-4 py-2 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10"
        >
          Delete account
        </button>
      </div>
      <ConfirmDialog
        open={open}
        title="Delete account forever?"
        body={`Type ${email} to confirm. Instances are destroyed, keys revoked, tickets closed.`}
        confirmLabel={deleting ? "Deleting…" : "Delete account"}
        requireText={email}
        onClose={() => {
          if (!deleting) setOpen(false);
        }}
        onConfirm={() => {
          if (deleting) return;
          void remove();
        }}
      />
    </DashCard>
  );
}
