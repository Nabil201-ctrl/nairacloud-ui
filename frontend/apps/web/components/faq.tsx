"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="border-b border-border">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium hover:text-accent"
            >
              {it.q}
              <Plus size={18} aria-hidden className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
            </button>
            {isOpen && <p className="max-w-[65ch] pb-5 text-sm leading-relaxed text-text-muted">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
