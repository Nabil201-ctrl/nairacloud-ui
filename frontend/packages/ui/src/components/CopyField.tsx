"use client";

import { useState } from "react";

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2">
      <span className="sr-only">{label}</span>
      <code className="flex-1 truncate text-sm" style={{ fontFamily: "var(--font-mono)" }}>{value}</code>
      <button type="button" onClick={() => void onCopy()} className="text-sm text-accent hover:text-accent-hover">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
