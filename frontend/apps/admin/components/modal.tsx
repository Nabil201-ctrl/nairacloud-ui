"use client";

import { useEffect, useRef } from "react";

export function Modal({ open, title, onClose, children, footer, maxWidth = "max-w-lg" }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; maxWidth?: string }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
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
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 focus:outline-none shadow-2xl`}>
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <div className="mt-4 space-y-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3 pt-2">{footer}</div>}
      </div>
    </div>
  );
}