"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { email as emailSchema } from "@/lib/validation";
import { AuthCard } from "@/components/auth-card";
import { Field, Submit, inputClass } from "@/components/field";
import { LinkButton } from "@/components/dashboard";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      toast.error("Please enter a valid email address");
      return;
    }
    setPending(true);
    try {
      await api().post("/v1/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Something went wrong",
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        sub={`Recovery instructions sent to ${email}`}
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-surface">
            <CheckCircle size={24} weight="fill" className="text-accent" />
          </div>
          <p className="text-[13px] leading-relaxed text-text-muted">
            Didn&apos;t receive it? Check spam, or request another link in a few
            minutes.
          </p>
          <LinkButton href="/login" variant="secondary" className="w-full">
            <ArrowLeft size={15} />
            <span>Back to sign in</span>
          </LinkButton>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      sub="Enter your email to receive a secure recovery link."
    >
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-4"
        noValidate
      >
        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ng"
          />
        </Field>

        <div className="pt-1">
          <Submit pending={pending}>
            <EnvelopeSimple size={15} weight="bold" />
            <span>Send recovery link</span>
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
    </AuthCard>
  );
}
