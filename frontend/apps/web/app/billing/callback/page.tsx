"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";

type InstanceRow = {
  id: string;
  status: string;
  hostname?: string;
};

function BillingCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const instanceId =
    params.get("instanceId") ??
    (typeof window !== "undefined" ? sessionStorage.getItem("nc_checkout_instance") : null) ??
    "";
  const [status, setStatus] = useState<"LOADING" | "WAITLISTED" | "ERROR" | "RUNNING" | "CREATING" | "OTHER">("LOADING");
  const [hostname, setHostname] = useState<string>("");
  const started = useRef(false);

  useEffect(() => {
    if (!instanceId || started.current) return;
    started.current = true;

    let cancelled = false;
    const startedAt = Date.now();
    const maxMs = 5 * 60 * 1000;

    const poll = async () => {
      try {
        const instance = (await api().get(`/v1/instances/${instanceId}`)) as InstanceRow;
        if (cancelled) return;
        setHostname(instance.hostname ?? "");
        const s = (instance.status ?? "").toUpperCase();
        if (s === "RUNNING" || s === "BOOTING" || s === "STOPPED") {
          setStatus(s === "RUNNING" ? "RUNNING" : "OTHER");
          toast.success("Payment confirmed — instance is provisioning");
          sessionStorage.removeItem("nc_checkout_instance");
          setTimeout(() => router.replace(`/dashboard/instances/${instanceId}`), 1000);
          return;
        }
        if (s === "WAITLISTED") {
          setStatus("WAITLISTED");
          return;
        }
        if (s === "ERROR" || s === "DELETED") {
          setStatus("ERROR");
          return;
        }
        setStatus("CREATING");
        if (Date.now() - startedAt < maxMs) {
          setTimeout(() => void poll(), 2500);
        } else {
          toast.message("Still provisioning. Check your instances list.");
          router.replace("/dashboard/instances");
        }
      } catch {
        if (cancelled) return;
        setStatus("ERROR");
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [instanceId, router]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-medium tracking-tight text-text">Confirming payment</h1>
      <p className="mt-2 text-sm text-text-muted">
        Redirect from Paystack is not proof of payment. We poll your instance until provisioning starts.
      </p>
      {reference && <p className="mt-4 font-mono text-xs text-text-muted">Ref: {reference}</p>}
      {!instanceId && (
        <p className="mt-6 text-sm text-danger">
          Missing instance id. Open{" "}
          <Link href="/dashboard/instances" className="text-accent underline">
            instances
          </Link>{" "}
          to check status.
        </p>
      )}
      <div className="mt-8 rounded-md border border-border-faint bg-card px-6 py-5 text-[13px]">
        {(status === "LOADING" || status === "CREATING") && (
          <p className="text-text-muted">
            Waiting for verified payment{hostname ? ` for ${hostname}` : ""}…
          </p>
        )}
        {status === "RUNNING" && <p className="text-accent">Instance is up. Redirecting…</p>}
        {status === "OTHER" && <p className="text-accent">Payment confirmed. Redirecting…</p>}
        {status === "WAITLISTED" && (
          <p className="text-warn">You are on the waitlist — we will provision when capacity frees up.</p>
        )}
        {status === "ERROR" && (
          <div className="space-y-3">
            <p className="text-danger">Something went wrong provisioning this instance.</p>
            <Link href="/dashboard/instances" className="text-accent underline">
              Back to instances
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={<main className="p-10 text-center text-sm text-text-muted">Loading…</main>}>
      <BillingCallbackInner />
    </Suspense>
  );
}
