"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  LockKey,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  ShieldCheck,
  WarningCircle,
  ArrowRight,
  ArrowSquareOut,
  SpinnerGap,
  TerminalWindow,
} from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";
import { api } from "@/lib/api";
import { SecurityBadge, LivePulse } from "@/components/ui";

const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001").replace(/\/$/, "");

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Email address and master password are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = (await api().post("/v1/auth/login", {
        email: email.trim(),
        password,
      })) as {
        user?: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
        message?: string;
      };

      const user = res?.user;

      // Fail-closed role enforcement: must be ADMIN
      if (user && user.role !== "ADMIN") {
        // Immediately purge session to maintain fail-closed security boundary
        try {
          await api().post("/v1/auth/logout", {});
        } catch {
          // ignore
        }
        setErrorMsg(
          `Access Denied: Account ${user.email} is authenticated as ${user.role}. This control plane requires role ADMIN. Please use the Client Portal.`
        );
        setLoading(false);
        return;
      }

      toast.success("Identity Verified", {
        description: `Welcome back, ${user?.name || "Root Admin"}. Initializing Control Plane.`,
      });

      // Hard redirect to root to ensure all edge cookies and middleware state are synced
      window.location.href = "/";
    } catch (err: any) {
      const code = err?.code || err?.response?.data?.error?.code;
      const message = err?.message || err?.response?.data?.error?.message;

      if (code === "INVALID_CREDENTIALS") {
        setErrorMsg("Invalid credentials. Master password or administrative email is incorrect.");
      } else if (code === "RATE_LIMITED") {
        setErrorMsg("Security lockout: Too many failed authentication attempts. Please stand by.");
      } else {
        setErrorMsg(message || "Authentication rejected by Control Plane API. Verify network status.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#070709] selection:bg-accent selection:text-accent-fg">
      {/* Ambient background decoration */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,217,160,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"
        aria-hidden="true"
      />

      {/* Top status banner */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-xs font-mono backdrop-blur-md">
          <LivePulse status="ONLINE" />
          <span className="text-text-muted">LAGOS REGION · 100% SOVEREIGN</span>
        </div>
        <SecurityBadge level="9" label="ADMIN CONTROL PLANE" />
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-[linear-gradient(180deg,rgba(17,17,19,0.95)_0%,rgba(10,10,11,0.98)_100%)] p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all">
        {/* Card Header with Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/40 shadow-[0_0_20px_rgba(0,217,160,0.3)]">
            <span className="font-mono text-xl font-bold text-accent">₦</span>
          </div>
          <h1 className="font-mono text-xs font-bold tracking-widest uppercase text-accent mb-1">
            NairaCloud Infrastructure
          </h1>
          <p className="text-xl font-bold text-text tracking-tight">Root Administrator Login</p>
          <p className="mt-1 text-xs text-text-muted">
            Authenticate using hardware-tied administrator credentials.
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 p-3.5 text-xs text-danger animate-shake">
            <WarningCircle size={16} weight="bold" className="shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold">{errorMsg}</span>
              {errorMsg.includes("Client Portal") && (
                <div className="mt-2">
                  <a
                    href={WEB_URL}
                    className="inline-flex items-center gap-1 font-bold underline hover:text-white transition-colors"
                  >
                    <span>Open Customer Portal</span>
                    <ArrowSquareOut size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Operator Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-muted/60 pointer-events-none">
                <EnvelopeSimple size={16} />
              </span>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nairacloud.xyz"
                className="w-full rounded-lg border border-border/80 bg-surface/70 pl-10 pr-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Master Security Password
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-text-muted/60 pointer-events-none">
                <LockKey size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full rounded-lg border border-border/80 bg-surface/70 pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-text-muted hover:text-text transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="rounded-lg border border-border/60 bg-surface/40 p-3 font-mono text-[11px] text-text-muted/80 flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 text-accent mt-0.5" />
            <span>
              Edge cookies are cryptographically partitioned (<code className="text-text">nc_access</code>) with strict
              SameSite headers.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full press flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-bold text-accent-fg shadow-[0_0_20px_rgba(0,217,160,0.3)] hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <SpinnerGap size={16} className="animate-spin" />
                <span>Verifying Security Clearance...</span>
              </>
            ) : (
              <>
                <span>Authorize & Enter Console</span>
                <ArrowRight size={15} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Client Portal Switcher */}
        <div className="mt-6 pt-5 border-t border-border/60 text-center">
          <p className="text-xs text-text-muted">
            Looking for customer instance deployment?{" "}
            <a
              href={WEB_URL}
              className="font-semibold text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>Client Portal</span>
              <ArrowSquareOut size={12} />
            </a>
          </p>
        </div>
      </div>

      {/* Security Disclaimer Footer */}
      <footer className="mt-8 max-w-md text-center text-[11px] font-mono text-text-muted/60 leading-relaxed">
        <p>
          NOTICE: This system is strictly restricted to authorized NairaCloud platform engineers. All authentication
          attempts and IP origins are logged to the immutable audit trail.
        </p>
      </footer>
    </div>
  );
}
