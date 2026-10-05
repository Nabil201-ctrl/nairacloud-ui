"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";

type VerifyStatus = "SUCCESS" | "PENDING" | "FAILED" | "LOADING";

function WalletCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [status, setStatus] = useState<VerifyStatus>("LOADING");
  const [balance, setBalance] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!reference || started.current) return;
    started.current = true;

    let cancelled = false;
    const startedAt = Date.now();
    const maxMs = 2 * 60 * 1000;

    const poll = async () => {
      try {
        const res = (await api().post("/v1/billing/wallet/verify", { reference })) as {
          status: VerifyStatus;
          balance?: number;
        };
        if (cancelled) return;
        if (res.status === "SUCCESS") {
          setStatus("SUCCESS");
          setBalance(res.balance ?? null);
          toast.success("Wallet funded");
          setTimeout(() => router.replace("/dashboard/billing/wallet"), 1200);
          return;
        }
        if (res.status === "PENDING") {
          setStatus("PENDING");
          if (Date.now() - startedAt < maxMs) {
            setTimeout(() => void poll(), 2500);
          } else {
            toast.message("Payment is still confirming. We'll credit your wallet when Paystack finishes.");
          }
          return;
        }
        setStatus("FAILED");
        toast.error("Funding could not be verified");
      } catch {
        if (cancelled) return;
        // Backend throws on FAILED; treat as failed after first hard error once PENDING window passes.
        setStatus("FAILED");
        toast.error("Funding verification failed");
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-medium tracking-tight text-text">Confirming wallet funding</h1>
      <p className="mt-2 text-sm text-text-muted">
        Paystack redirect is never treated as success. We verify the payment with our API.
      </p>
      {!reference && (
        <p className="mt-6 text-sm text-danger">Missing payment reference. Return to your wallet and try again.</p>
      )}
      {reference && (
        <p className="mt-4 font-mono text-xs text-text-muted">Ref: {reference}</p>
      )}
      <div className="mt-8 rounded-md border border-border-faint bg-card px-6 py-5 text-[13px]">
        {status === "LOADING" && <p className="text-text-muted">Verifying…</p>}
        {status === "PENDING" && (
          <p className="text-text-muted">Payment still confirming (common for bank transfer / USSD). Hang tight…</p>
        )}
        {status === "SUCCESS" && (
          <p className="text-accent">
            Funded{balance != null ? ` · balance ₦${balance.toLocaleString("en-NG")}` : ""}. Redirecting…
          </p>
        )}
        {status === "FAILED" && (
          <div className="space-y-3">
            <p className="text-danger">We could not confirm this payment yet.</p>
            <Link href="/dashboard/billing/wallet" className="text-accent underline">
              Back to wallet
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={<main className="p-10 text-center text-sm text-text-muted">Loading…</main>}>
      <WalletCallbackInner />
    </Suspense>
  );
}
