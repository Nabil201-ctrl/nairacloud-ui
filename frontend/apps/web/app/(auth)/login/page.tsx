"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { AuthLayout } from "@/components/auth-layout";
import { Field, PasswordInput, Submit, inputClass } from "@/components/field";
import { WAITLIST_URL } from "@/lib/site";
import { WarningCircle } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!loginSchema.safeParse({ email, password }).success) {
      setError("Please enter a valid email and your password");
      return;
    }
    setPending(true);
    setError("");

    try {
      await api().post("/v1/auth/login", { email, password });
      toast.success("Welcome back to NairaCloud");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_UNVERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid credentials. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      headline="Welcome back."
      subtext="Sign in to manage your cloud infrastructure."
      formSide="left"
      visualTagline="Your cloud. Built for Nigeria."
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-text-muted">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-[12px] text-accent transition-colors hover:text-accent-hover"
            >
              Forgot password?
            </a>
          </div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
            <span>Sign in</span>
          </Submit>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[13px] text-text-muted">
            New to NairaCloud?{" "}
            <a
              href={WAITLIST_URL}
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Join the waitlist
            </a>
          </p>
        </div>

        <p className="text-center text-[12px] leading-relaxed text-text-muted">
          By continuing, you agree to our{" "}
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
      </form>
    </AuthLayout>
  );
}
