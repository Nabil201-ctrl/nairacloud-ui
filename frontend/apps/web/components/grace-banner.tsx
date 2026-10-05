"use client";

import { useEffect, useState } from "react";
import { WarningCircle, X } from "@phosphor-icons/react";
import { api } from "@/lib/api";

type Subscription = { id: string; status: string; graceEndsAt: string | null; instance: { hostname: string } | null };

function toArray(payload: unknown): Subscription[] {
  if (Array.isArray(payload)) return payload as Subscription[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: Subscription[] }).items;
  }
  return [];
}

export function GraceBanner() {
  const [graced, setGraced] = useState<Subscription[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;
    api()
      .get("/v1/billing/subscriptions")
      .then((payload) => {
        if (!alive) return;
        setGraced(toArray(payload).filter((s) => s.status === "GRACE"));
      })
      .catch(() => {
        if (alive) setGraced([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (dismissed || !graced || graced.length === 0) return null;

  const names = graced.map((s) => s.instance?.hostname ?? s.id).join(", ");

  return (
    <div className="relative px-4 pt-4 md:px-6 lg:px-6" data-testid="grace-banner">
      <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 px-4 py-3">
        <WarningCircle size={16} className="mt-0.5 shrink-0 text-warning" />
        <div className="min-w-0 text-[13px]">
          <p className="font-medium text-text">Payment needed — renewing soon</p>
          <p className="mt-0.5 text-text-muted">
            {names} {graced.length > 1 ? "are" : "is"} on <span className="font-mono">GRACE</span> after a failed payment. Update your card or top up your wallet before the grace window ends to keep running.
          </p>
          <a href="/dashboard/billing/wallet" className="mt-1.5 inline-block text-[12px] font-medium text-accent hover:text-accent-hover">
            Fix payment →
          </a>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="ml-auto shrink-0 p-1 text-text-muted hover:text-text"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}