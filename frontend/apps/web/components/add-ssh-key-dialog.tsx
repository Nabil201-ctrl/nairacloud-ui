"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, DownloadSimple, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { downloadTextFile, generateEd25519SshKey, type GeneratedSshKey } from "@/lib/ssh-keygen";
import { PrimaryButton, SecondaryButton, SegmentedControl } from "@/components/dashboard";

type Mode = "paste" | "generate";

export function AddSshKeyDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, publicKey: string) => void | Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("generate");
  const [name, setName] = useState("");
  const [pub, setPub] = useState("");
  const [generated, setGenerated] = useState<GeneratedSshKey | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMode("generate");
      setName("");
      setPub("");
      setGenerated(null);
      setDownloaded(false);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const resetGenerated = () => {
    setGenerated(null);
    setDownloaded(false);
  };

  const onGenerate = async () => {
    const keyName = name.trim() || "nairacloud";
    setBusy(true);
    try {
      const key = await generateEd25519SshKey(keyName);
      setName(key.name);
      setGenerated(key);
      setDownloaded(false);
      downloadTextFile(key.filename, key.privateKey);
      setDownloaded(true);
      toast.success("Private key downloaded", {
        description: "Save it somewhere safe — we never store it.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate key");
    } finally {
      setBusy(false);
    }
  };

  const copyPrivate = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.privateKey);
      toast.success("Private key copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const redownload = () => {
    if (!generated) return;
    downloadTextFile(generated.filename, generated.privateKey);
    setDownloaded(true);
    toast.success("Private key downloaded again");
  };

  const save = async () => {
    if (mode === "generate") {
      if (!generated) {
        toast.error("Generate a key first");
        return;
      }
      if (!downloaded) {
        toast.error("Download your private key before saving");
        return;
      }
      setBusy(true);
      try {
        await onSave(generated.name, generated.publicKey);
        setName("");
        setPub("");
        resetGenerated();
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!name.trim()) {
      toast.error("Give the key a name");
      return;
    }
    if (!pub.trim().startsWith("ssh-")) {
      toast.error("Paste a valid public key — it starts with ssh-ed25519, ssh-rsa, ecdsa-sha2-…");
      return;
    }
    setBusy(true);
    try {
      await onSave(name.trim(), pub.trim());
      setName("");
      setPub("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add SSH key"
        className="relative w-full max-w-lg rounded-md border border-border-faint bg-card p-5"
      >
        <h2 className="text-[15px] font-medium text-white">Add SSH key</h2>
        <p className="mt-1 text-[12px] text-text-muted">
          Generate a key in your browser, or paste an existing public key. We only store the public half.
        </p>

        <div className="mt-4">
          <SegmentedControl
            options={[
              { value: "generate", label: "Auto-generate" },
              { value: "paste", label: "Paste existing" },
            ]}
            value={mode}
            onChange={(value) => {
              setMode(value);
              if (value === "generate") {
                setPub("");
              } else {
                resetGenerated();
              }
            }}
            className="w-full"
          />
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-[13px] font-medium text-white">Key name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (mode === "generate" && generated) resetGenerated();
            }}
            placeholder={mode === "generate" ? "nairacloud-laptop" : "my-laptop"}
            className="w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-[13px] text-white focus:border-border-hover focus:outline-none"
          />
        </label>

        {mode === "paste" ? (
          <label className="mt-4 block">
            <span className="mb-1 block text-[13px] font-medium text-white">Public key</span>
            <textarea
              value={pub}
              onChange={(e) => setPub(e.target.value)}
              rows={4}
              placeholder="ssh-ed25519 AAAA… you@laptop"
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-[12px] text-white focus:border-border-hover focus:outline-none"
            />
          </label>
        ) : (
          <div className="mt-4 space-y-3">
            {!generated ? (
              <SecondaryButton
                disabled={busy}
                onClick={() => void onGenerate()}
                className="h-auto w-full border-dashed py-3"
              >
                <Sparkle size={14} weight="bold" />
                {busy ? "Generating…" : "Generate ed25519 keypair"}
              </SecondaryButton>
            ) : (
              <>
                <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-3 text-[12px] text-white">
                  <div className="flex items-start gap-2">
                    <WarningCircle size={16} className="mt-0.5 shrink-0 text-warning" weight="fill" />
                    <div>
                      <p className="font-medium text-warning">Download your private key now</p>
                      <p className="mt-1 text-text-muted">
                        We never store it. Without this file you will not be able to SSH into new instances.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SecondaryButton onClick={redownload} className="h-8 px-3 text-[12px]">
                      <DownloadSimple size={14} /> Download {generated.filename}
                    </SecondaryButton>
                    <SecondaryButton onClick={() => void copyPrivate()} className="h-8 px-3 text-[12px]">
                      <Copy size={14} /> Copy private key
                    </SecondaryButton>
                  </div>
                </div>
                <div className="rounded-md border border-border-faint bg-bg px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Fingerprint</p>
                  <p className="mt-1 break-all font-mono text-[12px] text-white">{generated.fingerprint}</p>
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-[13px] text-white">
                  <input
                    type="checkbox"
                    checked={downloaded}
                    onChange={(e) => setDownloaded(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-white"
                  />
                  <span>I saved the private key file and understand NairaCloud only keeps the public key.</span>
                </label>
                <button type="button" onClick={resetGenerated} className="text-[12px] text-text-muted hover:text-white">
                  Generate a different key
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            disabled={busy || (mode === "generate" && (!generated || !downloaded))}
            onClick={() => void save()}
          >
            Save key
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
