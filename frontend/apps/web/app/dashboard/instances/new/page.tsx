"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PriceTag, CapacityBanner, Skeleton, CardSkeleton } from "@nairacloud/ui";
import { toast } from "sonner";
import { Check, ArrowRight, ArrowLeft, Plus, Globe, Copy, CircleNotch, CaretRight } from "@phosphor-icons/react";
import { ApiError } from "@nairacloud/api-client";
import { api } from "@/lib/api";
import { AddSshKeyDialog } from "@/components/add-ssh-key-dialog";
import {
  PageHeader,
  DashCard,
  PrimaryButton,
  SecondaryButton,
  LinkButton,
  SegmentedControl,
} from "@/components/dashboard";

type Plan = { id: string; slug: string; name: string; description: string; cpu: number; ramMb: number; storageGb: number; priceNgn: number; status: string };
type SshKey = { id: string; name: string; fingerprint: string; createdAt: string };

const OSES = ["Ubuntu 22.04", "Ubuntu 24.04", "Debian 12", "AlmaLinux 9"] as const;
const OS_SLUG: Record<string, string> = {
  "Ubuntu 22.04": "ubuntu-22.04",
  "Ubuntu 24.04": "ubuntu-24.04",
  "Debian 12": "debian-12",
  "AlmaLinux 9": "almalinux-9",
};
const APPS = [
  { name: "WordPress", desc: "The world's most popular CMS on Ubuntu 22.04.", icon: Globe },
];
const APP_SLUG: Record<string, string> = {
  WordPress: "wordpress",
};
type ProvisionStep = {
  id: string;
  title: string;
  description: string;
  detail?: string;
  showActions?: boolean;
};

const PROVISION_STEPS: ProvisionStep[] = [
  {
    id: "payment",
    title: "Payment verified",
    description: "Transaction confirmed and wallet balance debited for monthly compute resources.",
    detail: "tx_auto_confirmed · Wallet payment ok",
  },
  {
    id: "server",
    title: "Server assigned",
    description: "Dedicated host node resources allocated for your instance.",
    detail: "Host Region: —",
  },
  {
    id: "boot",
    title: "Instance booting",
    description: "Writing OS disk image to NVMe array and initializing kernel boot sequence.",
    detail: "OS Kernel: Linux 6.x · NVMe SSD",
  },
  {
    id: "network",
    title: "Network & Security",
    description: "Opening SSH port 22, assigning public IPv4, and configuring host firewall rules.",
    showActions: true,
  },
  {
    id: "ready",
    title: "Server ready",
    description: "Your cloud instance is live and ready for secure SSH connections.",
    detail: "Status: RUNNING · 100% Provisioned",
  },
];

function generateRootPassword(length = 20): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits;
  const bytes = crypto.getRandomValues(new Uint8Array(length + 8));
  const charAt = (s: string, i: number) => s.charAt(bytes[i] as number % s.length);
  const chars: string[] = [
    charAt(upper, 0),
    charAt(lower, 1),
    charAt(digits, 2),
    charAt(symbols, 3),
  ];
  let i = 4;
  for (let n = 4; n < length; n += 1) {
    const b = bytes[i++ % bytes.length] as number;
    chars.push(n % 7 === 0 ? charAt(symbols, b) : charAt(all, b));
  }
  for (let n = chars.length - 1; n > 0; n -= 1) {
    const j = (bytes[(i++ + n) % bytes.length] as number) % (n + 1);
    const tmp = chars[n] as string;
    chars[n] = chars[j] as string;
    chars[j] = tmp;
  }
  return chars.join("");
}

type CreateNext = {
  action: "provisioning" | "fund_required" | "checkout";
  message?: string;
  instanceId?: string;
  planId?: string;
  recreate?: Record<string, unknown>;
};

const selectClass = (selected: boolean, disabled?: boolean) =>
  `w-full rounded-md border bg-card p-4 text-left transition-colors disabled:cursor-not-allowed ${
    selected ? "border-border-hover bg-surface-hover" : "border-border-faint hover:border-border"
  } ${disabled ? "opacity-50" : ""}`;

export default function DeployWizard() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sshKeys, setSshKeys] = useState<SshKey[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [imageType, setImageType] = useState<"os" | "app">("os");
  const [os, setOs] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<"ssh-key" | "password">("ssh-key");
  const [rootPassword, setRootPassword] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [keyId, setKeyId] = useState<string | null>(null);
  const [hostname, setHostname] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [payWith, setPayWith] = useState<"wallet" | "checkout">("wallet");
  const [deploying, setDeploying] = useState(false);
  const [pollInstanceId, setPollInstanceId] = useState<string | null>(null);
  const [waitlisted, setWaitlisted] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pl, keys] = await Promise.all([
          api().get("/v1/plans") as Promise<Plan[]>,
          api().get("/v1/ssh-keys") as Promise<SshKey[]>,
        ]);
        setPlans(pl ?? []);
        setSshKeys(keys ?? []);
      } catch (err) {
        console.error("Failed to load plans/keys", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const planById = (id: string) => plans.find((p) => p.id === id);

  const taken = false;
  const hostnameInvalid = !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(hostname.trim()) || hostname.trim().length < 3 || hostname.trim().length > 24 || taken;
  const plan = planById(planId ?? "");

  const canDeploy = planId !== null && plan?.status === "ACTIVE" && os !== null && (authMethod === "password" ? rootPassword.length >= 8 : keyId !== null) && !hostnameInvalid;

  const missingStep = (): string | null => {
    if (planId === null || !plan || plan.status !== "ACTIVE") return "Select an available plan to continue.";
    if (os === null) return "Choose an operating system to continue.";
    if (authMethod === "ssh-key" && keyId === null) return "Add or select an SSH key to continue.";
    if (authMethod === "password" && rootPassword.length < 8) return "Generate or enter a root password (min 8 chars with a letter, number and symbol) to continue.";
    if (hostnameInvalid) return "Enter a valid hostname (3-24 lowercase letters, numbers, or hyphens).";
    return null;
  };

  const imageSlug = () => {
    if (!os) return null;
    if (imageType === "os") return OS_SLUG[os] ?? null;
    return APP_SLUG[os] ?? null;
  };

  // Must stay above any conditional return — changing hook count when loading flips crashes the page.
  useEffect(() => {
    if (!provisioning || !pollInstanceId) return;
    if (progress < PROVISION_STEPS.length - 1) {
      const t = setTimeout(() => setProgress((p) => p + 1), 800);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    let polls = 0;
    const tick = async () => {
      try {
        polls += 1;
        if (polls === 10) setLongWait(true);
        const inst = (await api().get(`/v1/instances/${pollInstanceId}`)) as { status: string };
        if (cancelled) return;
        const s = (inst.status ?? "").toUpperCase();
        if (s === "RUNNING" || s === "BOOTING" || s === "STOPPED") {
          setProgress(PROVISION_STEPS.length);
          toast.success(`${hostname.trim()}.nairacloud.app is provisioning`);
          router.push(`/dashboard/instances/${pollInstanceId}`);
          return;
        }
        if (s === "ERROR") {
          toast.error("Provisioning failed");
          setProvisioning(false);
          return;
        }
        if (s === "WAITLISTED") {
          setWaitlisted(true);
          setProvisioning(false);
          return;
        }
        setTimeout(() => void tick(), 2500);
      } catch {
        toast.error("Could not refresh instance status");
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [provisioning, pollInstanceId, progress, hostname, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    );
  }

  const deploy = async () => {
    if (!canDeploy || !plan || !os || deploying) return;
    const image = imageSlug();
    if (!image) {
      toast.error(imageType === "app" ? "That marketplace image is not available yet" : "Invalid OS image");
      return;
    }
    setDeploying(true);
    try {
      const res = (await api().post("/v1/instances", {
        planId: plan.id,
        hostname: hostname.trim(),
        image,
        imageType,
        authMethod,
        sshKeyId: authMethod === "ssh-key" ? keyId : undefined,
        rootPassword: authMethod === "password" ? rootPassword : undefined,
        payWith: plan.priceNgn === 0 ? undefined : payWith,
      })) as { instance?: { id: string } | null; next?: CreateNext };

      const next = res.next;
      if (!next) {
        toast.error("Unexpected deploy response");
        return;
      }

      if (next.action === "fund_required") {
        sessionStorage.setItem(
          "nc_redeploy",
          JSON.stringify({
            planId: plan.id,
            hostname: hostname.trim(),
            image,
            imageType,
            authMethod,
            sshKeyId: authMethod === "ssh-key" ? keyId : undefined,
            rootPassword: authMethod === "password" ? rootPassword : undefined,
            payWith: "wallet",
          }),
        );
        toast.message("Insufficient wallet balance — fund your wallet, then retry deploy");
        router.push("/dashboard/billing/wallet");
        return;
      }

      if (next.action === "checkout") {
        const instanceId = next.instanceId ?? res.instance?.id;
        if (!instanceId) {
          toast.error("Checkout instance missing");
          return;
        }
        sessionStorage.setItem("nc_checkout_instance", instanceId);
        const checkout = (await api().post("/v1/billing/checkout", { instanceId })) as {
          authorization_url?: string;
        };
        if (!checkout.authorization_url) {
          toast.error("Could not start Paystack checkout");
          return;
        }
        window.location.href = checkout.authorization_url;
        return;
      }

      // provisioning
      const instanceId = res.instance?.id;
      if (!instanceId) {
        toast.error("Instance id missing after deploy");
        return;
      }
      setPollInstanceId(instanceId);
      setProgress(0);
      setProvisioning(true);
    } catch (err) {
      const detail = err instanceof ApiError ? `${err.message}${err.code ? ` (${err.code})` : ""}` : "Unexpected error";
      toast.error(`Deployment failed: ${detail}`);
    } finally {
      setDeploying(false);
    }
  };

  const addDeployedKey = async (name: string, publicKey: string) => {
    try {
      const key = await api().post("/v1/ssh-keys", { name, publicKey }) as SshKey;
      setSshKeys((k) => [key, ...k]);
      setKeyId(key.id);
      toast.success("SSH key saved");
    } catch (err) {
      toast.error("Key save failed");
    }
  };

  if (waitlisted) {
    return (
      <section className="mx-auto max-w-xl pt-8">
        <DashCard className="p-6">
          <h2 className="text-[20px] font-medium tracking-tight text-white">Instance waitlisted</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
            Every server is at capacity right now, so <span className="font-mono text-accent">{hostname.trim()}</span> was added to the
            waitlist. It will be provisioned automatically the moment a server frees up — you&apos;ll get an email when it boots.
          </p>
          <LinkButton href="/dashboard/instances" variant="secondary" className="mt-6">
            Back to instances
          </LinkButton>
        </DashCard>
      </section>
    );
  }

  if (provisioning) {
    return (
      <section className="mx-auto max-w-xl pt-8">
        <Provisioning progress={progress} hostname={hostname.trim()} />
        {longWait && (
          <p className="mt-4 text-center text-[13px] text-text-muted">
            This is taking a little longer than usual — your instance is still being created.
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/instances")}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={14} /> Back to Instances
        </button>
        <PageHeader title="Deploy instance" description="Choose a plan, image, and access method." />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-8">
          <StepSection title="1. Choose plan">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plans.map((p: Plan) => {
                const disabled = p.status !== "ACTIVE";
                const selected = planId === p.id;
                const limited = p.status === "LIMITED";
                return (
                  <div key={p.id} className="relative">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={disabled}
                      onClick={() => setPlanId(p.id)}
                      className={selectClass(selected, disabled)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-[14px] font-medium text-white">{p.name}</h3>
                        {p.name === "STARTER" && (
                          <span className="rounded-[4px] bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mb-2 font-mono text-[12px] text-text-muted">
                        {p.cpu} vCPU · {p.ramMb / 1024}GB RAM · {p.storageGb}GB NVMe
                      </p>
                      <p>
                        <PriceTag amount={p.priceNgn} className="text-[18px] font-medium text-white" />
                        <span className="text-[12px] text-text-muted"> / mo</span>
                      </p>
                    </button>
                    {limited && (
                      <div className="mt-2">
                        <CapacityBanner plan={p.name} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </StepSection>

          <StepSection title="2. Choose image">
            <div className="mb-3">
              <SegmentedControl
                value={imageType}
                onChange={(v) => setImageType(v)}
                options={[
                  { value: "os", label: "Operating System" },
                  { value: "app", label: "Marketplace" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {imageType === "os"
                ? OSES.map((o) => (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={os === o}
                      onClick={() => setOs(o)}
                      className={selectClass(os === o)}
                    >
                      <span className="font-mono text-[13px] font-medium text-white">{o}</span>
                    </button>
                  ))
                : APPS.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      role="radio"
                      aria-checked={os === a.name}
                      onClick={() => setOs(a.name)}
                      className={`${selectClass(os === a.name)} flex items-start gap-3`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted">
                        <a.icon size={16} />
                      </div>
                      <div>
                        <span className="block text-[13px] font-medium text-white">{a.name}</span>
                        <span className="mt-0.5 block text-[11px] text-text-muted">{a.desc}</span>
                      </div>
                    </button>
                  ))}
            </div>
          </StepSection>

          <StepSection title="3. Configure access">
            <div className="mb-4">
              <SegmentedControl
                value={authMethod}
                onChange={(v) => setAuthMethod(v)}
                options={[
                  { value: "password", label: "Root password" },
                  { value: "ssh-key", label: "SSH key" },
                ]}
              />
            </div>

            {authMethod === "password" ? (
              <div className="space-y-3">
                <DashCard>
                  <p className="mb-2 text-[12px] text-text-muted">Your root password</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-sm border border-border-subtle bg-bg px-3 py-2 font-mono text-[13px] text-accent">
                      {rootPassword || "…"}
                    </code>
                    <SecondaryButton
                      className="h-8 text-[12px]"
                      onClick={() => {
                        if (!rootPassword) return;
                        void navigator.clipboard.writeText(rootPassword).then(() => {
                          setPasswordCopied(true);
                          setTimeout(() => setPasswordCopied(false), 1500);
                        });
                      }}
                    >
                      <Copy size={13} /> {passwordCopied ? "Copied" : "Copy"}
                    </SecondaryButton>
                    <SecondaryButton
                      className="h-8 text-[12px]"
                      onClick={() => {
                        setRootPassword(generateRootPassword());
                        setCustomPassword("");
                        setPasswordCopied(false);
                      }}
                    >
                      Regenerate
                    </SecondaryButton>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      Or set your own password
                    </label>
                    <input
                      type="password"
                      value={customPassword}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomPassword(v);
                        setRootPassword(v);
                        setPasswordCopied(false);
                      }}
                      placeholder="Min 8 characters (letter, number + symbol)"
                      spellCheck={false}
                      className="w-full rounded-sm border border-border bg-control px-3 py-2 font-mono text-[13px] text-text focus:border-accent focus:outline-none"
                    />
                    {customPassword.length > 0 && customPassword.length < 8 && (
                      <p className="mt-1 text-[11px] text-danger">Password must be at least 8 characters with a letter, number and symbol.</p>
                    )}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
                    Save this password somewhere safe — it will be shown on the instance page after boot so you can copy it again. You&apos;ll connect with{" "}
                    <code className="font-mono text-text-secondary">ssh root@&lt;public-ip&gt; -p &lt;port&gt;</code>.
                  </p>
                </DashCard>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[12px] text-text-muted">
                  Add a public key and we never store the private half, or switch to a root password above.
                </p>

                {sshKeys.map((k) => (
                  <label
                    key={k.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border bg-card px-4 py-3 transition-colors ${
                      keyId === k.id ? "border-border-hover bg-surface-hover" : "border-border-faint hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sshkey"
                      checked={keyId === k.id}
                      onChange={() => setKeyId(k.id)}
                      className="h-3.5 w-3.5 cursor-pointer accent-accent"
                    />
                    <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="block text-[13px] font-medium text-white">{k.name}</span>
                      <span className="mt-1 block truncate font-mono text-[11px] text-text-muted sm:mt-0">{k.fingerprint}</span>
                    </span>
                  </label>
                ))}

                <SecondaryButton onClick={() => setShowKeyModal(true)} className="w-full sm:w-auto">
                  <Plus size={14} /> Generate or add SSH key
                </SecondaryButton>
              </div>
            )}
          </StepSection>

          <StepSection title="4. Configure hostname">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-9 items-center rounded-sm border border-border-secondary bg-control px-3 focus-within:border-border-hover">
                <input
                  id="hostname"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value.toLowerCase())}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="production-api"
                  className="w-full bg-transparent py-2 font-mono text-[13px] text-text focus:outline-none sm:w-64"
                />
              </div>
              <span className="rounded-sm border border-border-faint bg-card px-3 py-2 font-mono text-[13px] text-text-muted">
                .nairacloud.app
              </span>
            </div>
            {hostname && hostnameInvalid && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-[13px] text-danger">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                Must be 3-24 lowercase letters, numbers, or hyphens. No spaces.
              </p>
            )}
          </StepSection>
        </div>

        <div className="shrink-0 lg:w-80">
          <DashCard className="sticky top-24 space-y-0">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-text-muted">Configuration summary</h2>

            <dl className="space-y-0 divide-y divide-border-faint text-[13px]">
              <SummaryRow label="Plan" value={plan ? plan.name : "Not selected"} />
              <SummaryRow label="OS" value={os ?? "Not selected"} />
              <SummaryRow label="Hostname" value={hostname && !hostnameInvalid ? hostname : "Pending"} />
              <SummaryRow
                label="Access"
                value={
                  authMethod === "password"
                    ? rootPassword
                      ? "Root password"
                      : "Not set"
                    : sshKeys.find((k) => k.id === keyId)?.name ?? "Not selected"
                }
              />
            </dl>

            <div className="mt-6 border-t border-border-subtle pt-4">
              <div className="mb-4 flex items-end justify-between">
                <span className="text-[13px] text-text-muted">Total</span>
                <span className="font-mono text-[22px] font-medium tracking-tight text-white">
                  {plan ? <PriceTag amount={plan.priceNgn} /> : "₦0"}
                </span>
              </div>

              {plan && plan.priceNgn > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Pay with</p>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[13px] ${
                      payWith === "wallet" ? "border-border-hover bg-surface-hover" : "border-border-faint"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payWith"
                      checked={payWith === "wallet"}
                      onChange={() => setPayWith("wallet")}
                      className="accent-accent"
                    />
                    Wallet balance
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[13px] ${
                      payWith === "checkout" ? "border-border-hover bg-surface-hover" : "border-border-faint"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payWith"
                      checked={payWith === "checkout"}
                      onChange={() => setPayWith("checkout")}
                      className="accent-accent"
                    />
                    Paystack (card / transfer / USSD)
                  </label>
                </div>
              )}

              <PrimaryButton
                className="w-full"
                disabled={deploying || provisioning}
                onClick={() => {
                  const missing = missingStep();
                  if (missing) {
                    toast.error(missing);
                    return;
                  }
                  void deploy();
                }}
              >
                {deploying ? "Starting…" : "Pay & Deploy"} <ArrowRight size={14} weight="bold" />
              </PrimaryButton>
              <p className="mt-3 text-center text-[11px] text-text-muted">
                {plan && plan.priceNgn === 0
                  ? "Free plan — no payment required."
                  : payWith === "wallet"
                    ? "Balance is debited only after the API confirms funds."
                    : "You will complete Paystack checkout; redirect is not success."}
              </p>
            </div>
          </DashCard>
        </div>
      </div>

      <AddSshKeyDialog open={showKeyModal} onSave={addDeployedKey} onClose={() => setShowKeyModal(false)} />
    </div>
  );
}

function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[14px] font-medium text-white">{title}</h2>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd className="text-right font-mono text-[12px] text-white">{value}</dd>
    </div>
  );
}

function Provisioning({ progress, hostname }: { progress: number; hostname: string }) {
  return (
    <div className="mx-auto max-w-2xl py-4">
      {/* Resend-style Top Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1c] to-[#0d0d0d] shadow-2xl shadow-black/60">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] opacity-10" />
          <Globe size={32} className="relative z-10 text-white/90" weight="duotone" />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[28px]">
            Provision server
          </h1>
          <p className="mt-0.5 text-[13px] text-text-muted">
            Setting up your virtual server on Nairacloud cloud network.
          </p>
        </div>
      </div>

      {/* Resend-style Stepper Timeline */}
      <div className="space-y-1">
        {PROVISION_STEPS.map((step, i) => {
          const isCompleted = i < progress || progress >= PROVISION_STEPS.length;
          const isActive = i === progress && progress < PROVISION_STEPS.length;

          return (
            <div key={step.id} className="group relative flex items-start gap-5">
              {/* Timeline vertical line & node */}
              <div className="relative flex flex-col items-center self-stretch">
                {/* Node Circle */}
                <div className="relative z-10 mt-1 flex items-center justify-center">
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/80 bg-[#0d1c15] text-emerald-400 shadow-sm shadow-emerald-950">
                      <Check size={11} weight="bold" />
                    </span>
                  ) : isActive ? (
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
                      <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-950 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80" />
                  )}
                </div>

                {/* Vertical Line to Next Step */}
                {i < PROVISION_STEPS.length - 1 && (
                  <div
                    className={`w-[1.5px] flex-1 my-1 transition-colors duration-300 ${
                      i < progress ? "bg-emerald-500/40" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>

              {/* Step Content Card / Row */}
              <div className="flex-1 pb-8">
                {isActive ? (
                  /* Active Step Card - Sleek dark green tinted card with border glow */
                  <div className="rounded-2xl border border-emerald-500/40 bg-[#0c1a14] p-5 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
                      <CircleNotch size={15} className="animate-spin text-emerald-400" />
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-emerald-200/70">
                      {step.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-[#12241c] px-3.5 py-2 font-mono text-[13px] text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{step.id === "payment" || step.id === "ready" ? `${hostname}.nairacloud.app` : step.detail}</span>
                    </div>
                  </div>
                ) : isCompleted ? (
                  /* Completed Step Card - Clean emerald dark card matching Resend reference */
                  <div className="rounded-2xl border border-emerald-500/25 bg-[#091510] p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
                      <Check size={15} weight="bold" className="text-emerald-400" />
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">
                      {step.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-[#141414] px-3.5 py-2 font-mono text-[13px] text-neutral-200">
                      <span className="text-[14px]">🇳🇬</span>
                      <span>{step.id === "payment" || step.id === "ready" ? `${hostname}.nairacloud.app` : step.detail}</span>
                    </div>
                  </div>
                ) : (
                  /* Upcoming Step - Subtle unexpanded style */
                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-semibold text-neutral-400">{step.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                      {step.description}
                    </p>
                    {step.showActions && (
                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-black opacity-80"
                        >
                          <CaretRight size={12} weight="bold" /> Auto configure
                        </button>
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-[#161616] px-4 py-1.5 text-[12px] font-medium text-neutral-300 opacity-80"
                        >
                          Manual setup
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
