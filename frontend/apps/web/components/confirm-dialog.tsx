"use client";

import { useEffect, useRef, useState } from "react";
import { SecondaryButton } from "@/components/dashboard";

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
  /** When set, the user must type this exact string before the confirm button enables. */
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-md border border-border-faint bg-card p-5"
      >
        <h2 className="text-[15px] font-medium text-white">{title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{body}</p>
        {requireText ? (
          <label className="mt-4 block">
            <span className="mb-1 block font-mono text-[12px] text-text-muted">
              Type <span className="text-white">{requireText}</span> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-[13px] text-white focus:border-border-hover focus:outline-none"
            />
          </label>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={!matches}
            className="press inline-flex h-9 items-center justify-center rounded-sm bg-danger px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
