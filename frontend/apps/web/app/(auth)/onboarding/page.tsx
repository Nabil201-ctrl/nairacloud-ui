"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { sshKeySchema } from "@/lib/validation";
import { downloadTextFile, generateEd25519SshKey } from "@/lib/ssh-keygen";
import { AuthCard } from "@/components/auth-card";
import { Field, Submit, inputClass } from "@/components/field";
import { SecondaryButton } from "@/components/dashboard";
import { cn } from "@nairacloud/ui";
import {
  Globe,
  Code,
  Robot,
  GraduationCap,
  TerminalWindow,
  Key,
  ArrowRight,
  WarningCircle,
  Check,
  Sparkle,
  DownloadSimple,
} from "@phosphor-icons/react";

const USE_CASES = [
  { id: "Website", label: "Web App", desc: "Next.js, Laravel, WordPress", icon: Globe },
  { id: "API", label: "Backend API", desc: "Node.js, Go, Python", icon: Code },
  { id: "Bot", label: "Worker / Bot", desc: "Cron jobs, scrapers, queues", icon: Robot },
  { id: "Learning", label: "Experiments", desc: "Prototyping, staging", icon: GraduationCap },
  { id: "Other", label: "Custom", desc: "Databases, VPNs, more", icon: TerminalWindow },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState<string>("Website");
  const [keyName, setKeyName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [privateFilename, setPrivateFilename] = useState("");
  const [savedPrivate, setSavedPrivate] = useState(false);
  const [mode, setMode] = useState<"generate" | "paste">("generate");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function finish(redirect: string): void {
    document.cookie = "nc_onboarded=1; path=/; max-age=31536000; samesite=lax";
    router.push(redirect);
    router.refresh();
  }

  async function finishAndRoute(): Promise<void> {
    setPending(true);
    try {
      const data = await api().get<unknown>("/v1/instances?page=1&limit=1");
      finish(
        Array.isArray(data) && data.length === 0
          ? "/dashboard/instances/new"
          : "/dashboard",
      );
    } catch {
      finish("/dashboard");
    } finally {
      setPending(false);
    }
  }

  async function onGenerateKey(): Promise<void> {
    setPending(true);
    setError("");
    try {
      const key = await generateEd25519SshKey(keyName || "nairacloud");
      setKeyName(key.name);
      setPublicKey(key.publicKey);
      setPrivateKey(key.privateKey);
      setPrivateFilename(key.filename);
      downloadTextFile(key.filename, key.privateKey);
      setSavedPrivate(true);
      toast.success("Private key downloaded — keep it safe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate key");
    } finally {
      setPending(false);
    }
  }

  async function onAddKey(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (mode === "generate" && !savedPrivate) {
      setError("Download and confirm you saved the private key first");
      return;
    }
    const parsed = sshKeySchema.safeParse({
      name: keyName || "primary-key",
      publicKey: publicKey.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please provide a valid key");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api().post("/v1/ssh-keys", parsed.data);
      toast.success("SSH key configured");
      await finishAndRoute();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save the SSH key",
      );
      setPending(false);
    }
  }

  return (
    <AuthCard
      title={step === 1 ? "What are you building?" : "Add your SSH key"}
      sub={
        step === 1
          ? "Helps us optimize your dashboard experience."
          : "Authorize your machine for instant root access."
      }
      badge={step === 1 ? "STEP 1 OF 2" : "STEP 2 OF 2"}
    >
      <div className="mb-5 flex gap-1.5" aria-hidden>
        <div className="h-[3px] flex-1 rounded-sm bg-white" />
        <div
          className={`h-[3px] flex-1 rounded-sm transition-colors duration-300 ${
            step >= 2 ? "bg-white" : "bg-border-subtle"
          }`}
        />
      </div>

      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            {USE_CASES.map((u) => {
              const Icon = u.icon;
              const sel = useCase === u.id;
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setUseCase(u.id)}
                  className={`flex items-center gap-3 rounded-sm border p-3 text-left transition-colors duration-150 ${
                    sel
                      ? "border-border-hover bg-surface-hover"
                      : "border-border bg-surface hover:border-border-hover hover:bg-surface-hover/60"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      sel
                        ? "border-border-hover bg-control text-text"
                        : "border-border bg-card text-text-muted"
                    }`}
                  >
                    <Icon size={16} weight={sel ? "bold" : "regular"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-text">
                        {u.label}
                      </span>
                      {sel && (
                        <Check
                          size={13}
                          weight="bold"
                          className="text-accent"
                        />
                      )}
                    </div>
                    <p className="text-[12px] text-text-muted">{u.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <Submit pending={false}>
              <span>Continue</span>
              <ArrowRight size={15} weight="bold" />
            </Submit>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(e) => void onAddKey(e)}
          className="space-y-4"
          noValidate
        >
          <div
            className="flex rounded-sm border border-border bg-surface p-0.5"
            role="tablist"
            aria-label="SSH key source"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "generate"}
              onClick={() => {
                setMode("generate");
                setError("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-medium transition-colors ${
                mode === "generate"
                  ? "bg-white text-black"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Sparkle size={13} weight="bold" /> Auto-generate
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "paste"}
              onClick={() => {
                setMode("paste");
                setPrivateKey("");
                setSavedPrivate(false);
                setError("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-medium transition-colors ${
                mode === "paste"
                  ? "bg-white text-black"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Paste existing
            </button>
          </div>

          <Field label="Key name">
            <input
              className={inputClass}
              value={keyName}
              onChange={(e) => {
                setKeyName(e.target.value);
                if (mode === "generate" && privateKey) {
                  setPrivateKey("");
                  setPublicKey("");
                  setSavedPrivate(false);
                }
              }}
              placeholder="e.g. macbook-pro"
            />
          </Field>

          {mode === "paste" ? (
            <Field label="Public key">
              <textarea
                className={cn(
                  inputClass,
                  "h-auto min-h-[72px] py-2.5 font-mono text-[11px] leading-relaxed",
                )}
                rows={3}
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="ssh-ed25519 AAAAC3Nz... you@laptop"
              />
            </Field>
          ) : (
            <div className="space-y-3">
              {!privateKey ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void onGenerateKey()}
                  className="press flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-surface px-4 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text disabled:opacity-50"
                >
                  <Sparkle size={15} weight="bold" />
                  {pending ? "Generating…" : "Generate ed25519 keypair"}
                </button>
              ) : (
                <>
                  <div className="rounded-sm border border-warning/30 bg-warning/10 px-3.5 py-3 text-[12px] text-text-secondary">
                    <p className="font-medium text-warning">Private key downloaded</p>
                    <p className="mt-1 text-text-muted">
                      We never store it. Keep `{privateFilename}` safe.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        downloadTextFile(privateFilename, privateKey);
                        setSavedPrivate(true);
                      }}
                      className="press mt-2 inline-flex h-8 items-center gap-1.5 rounded-sm border border-border px-2.5 text-[11px] font-medium text-text-secondary hover:border-border-hover hover:text-text"
                    >
                      <DownloadSimple size={13} /> Download again
                    </button>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-[12px] text-text-muted">
                    <input
                      type="checkbox"
                      checked={savedPrivate}
                      onChange={(e) => setSavedPrivate(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-accent"
                    />
                    <span>
                      I saved the private key and understand only the public key
                      is stored.
                    </span>
                  </label>
                </>
              )}
            </div>
          )}

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

          <div className="space-y-2 pt-1">
            <Submit
              pending={pending}
              disabled={mode === "generate" && (!publicKey || !savedPrivate)}
            >
              <Key size={15} weight="bold" />
              <span>Save key & enter dashboard</span>
            </Submit>
            <SecondaryButton
              type="button"
              onClick={() => void finishAndRoute()}
              className="w-full"
            >
              Skip for now
            </SecondaryButton>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
