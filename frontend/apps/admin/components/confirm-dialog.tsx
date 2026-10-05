"use client";

import { useEffect, useRef, useState } from "react";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  requireText,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** When set, the user must type this exact string before confirm enables. */
  requireText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [typed, setTyped] = useState("");

  const matches = requireText ? typed.trim() === requireText : true;

  useEffect(() => {
    if (!open) return;
    setTyped("");
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
        {requireText ? (
          <label className="mt-4 block">
            <span className="mb-1 block font-mono text-xs text-text-muted">Type <span className="text-text">{requireText}</span> to confirm</span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} spellCheck={false} autoComplete="off" className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none" />
          </label>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="press rounded-md border border-border px-4 py-2 text-sm hover:border-border-hover">Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={!matches} className="press rounded-md bg-danger px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-40">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}