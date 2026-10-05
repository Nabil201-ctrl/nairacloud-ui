"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { email as emailSchema } from "@/lib/validation";
import { AuthCard } from "@/components/auth-card";
import { Field, Submit, inputClass } from "@/components/field";
import { OtpInput } from "@/components/otp-input";
import { WarningCircle, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";

function VerifyForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  async function onVerify(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success || otp.length !== 6) {
      setError("Enter your email and the 6-digit code");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api().post("/v1/auth/verify-email", { email, otp });
      toast.success("Email verified \u2014 welcome!");
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired code. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onResend(): Promise<void> {
    if (cooldown > 0 || !emailSchema.safeParse(email).success) return;
    try {
      await api().post("/v1/auth/resend-verification", { email });
      setCooldown(45);
      toast.success("New code sent to your inbox");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not resend. Wait a moment.",
      );
    }
  }

  return (
    <form onSubmit={(e) => void onVerify(e)} className="space-y-4" noValidate>
      <Field label="Email">
        <input
          type="email"
          required
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.ng"
        />
      </Field>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-medium text-text-muted">
            Verification code
          </label>
          <span className="font-mono text-[11px] text-text-muted">6 digits</span>
        </div>
        <OtpInput value={otp} onChange={setOtp} />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-sm border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] leading-relaxed text-danger">
          <WarningCircle size={15} weight="fill" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-1">
        <Submit pending={pending}>
          <span>Verify & continue</span>
          <ArrowRight size={15} weight="bold" />
        </Submit>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="text-[12px] text-text-muted">No code received?</span>
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={cooldown > 0}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-accent transition-colors hover:text-accent-hover disabled:text-text-disabled"
        >
          <EnvelopeSimple size={13} />
          <span>{cooldown > 0 ? `${cooldown}s` : "Resend"}</span>
        </button>
      </div>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const params = useSearchParams();
  return (
    <AuthCard
      title="Verify your email"
      sub="Enter the 6-digit code we sent to your inbox."
      badge="VERIFICATION"
    >
      <VerifyForm initialEmail={params.get("email") ?? ""} />
    </AuthCard>
  );
}
