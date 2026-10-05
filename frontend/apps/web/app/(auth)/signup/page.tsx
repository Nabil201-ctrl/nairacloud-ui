"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { signupSchema } from "@/lib/validation";
import { AuthLayout } from "@/components/auth-layout";
import { Field, PasswordInput, Submit, inputClass } from "@/components/field";
import { PasswordStrength } from "@/components/password-strength";
import { WarningCircle } from "@phosphor-icons/react";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const referralCode = params.get("ref")?.trim() || undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your input");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api().post("/v1/auth/signup", {
        email,
        password,
        ...(referralCode ? { referralCode } : {}),
      });
      toast.success("Account created — check your inbox for the code");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Signup failed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      headline="Deploy your cloud."
      subtext="Developer-first cloud infrastructure priced in Naira."
      formSide="right"
      visualTagline="Your cloud. Built for Nigeria."
    >
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-4"
        noValidate
      >
        <Field label="Work Email">
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

        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-text-muted">
            Password
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min 8 characters"
          />
          <PasswordStrength value={password} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-text-muted">
            Confirm password
          </label>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter password"
          />
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
            <span>Create account</span>
          </Submit>
        </div>

        <p className="text-center text-[12px] leading-relaxed text-text-muted">
          By creating an account, you agree to our{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors hover:text-text"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors hover:text-text"
          >
            Privacy Policy
          </a>
          .
        </p>

        <div className="pt-1 text-center">
          <p className="text-[13px] text-text-muted">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
