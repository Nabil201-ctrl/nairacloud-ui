"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { password as passwordSchema } from "@/lib/validation";
import { AuthCard } from "@/components/auth-card";
import { PasswordInput, Submit } from "@/components/field";
import { PasswordStrength } from "@/components/password-strength";
import { LinkButton } from "@/components/dashboard";
import {
  WarningCircle,
  Key,
  ArrowRight,
  ArrowLeft,
} from "@phosphor-icons/react";

function ResetForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) {
      setError("This reset link is invalid or expired.");
      return;
    }
    if (!passwordSchema.safeParse(password).success) {
      setError("Password must be 8+ characters with a letter, number and symbol");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api().post("/v1/auth/reset-password", { token, password });
      toast.success("Password updated \u2014 please sign in");
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Reset failed. Request a new link.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-danger/25 bg-danger/5">
          <WarningCircle size={24} weight="fill" className="text-danger" />
        </div>
        <div>
          <h3 className="text-[14px] font-medium text-text">Invalid recovery link</h3>
          <p className="mt-1.5 text-[12px] text-text-muted">
            This token has expired or is malformed.
          </p>
        </div>
        <LinkButton href="/forgot-password" className="w-full">
          <span>Request new link</span>
          <ArrowRight size={15} />
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium text-text-muted">
          New password
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Min 8 characters"
        />
        <PasswordStrength value={password} />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-sm border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] leading-relaxed text-danger">
          <WarningCircle
            size={15}
            weight="fill"
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-1">
        <Submit pending={pending}>
          <Key size={15} weight="bold" />
          <span>Update password</span>
        </Submit>
      </div>

      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={13} />
          <span>Back to sign in</span>
        </a>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const params = useSearchParams();
  return (
    <AuthCard
      title="Create new password"
      sub="Choose a strong password to secure your instances."
    >
      <ResetForm token={params.get("token")} />
    </AuthCard>
  );
}
