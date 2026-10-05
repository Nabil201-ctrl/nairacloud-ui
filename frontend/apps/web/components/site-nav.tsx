"use client";

import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "./logo";
import { WAITLIST_URL } from "@/lib/site";

const LINKS = [
  { href: "/docs", label: "Docs" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav aria-label="Primary" className="mx-auto flex h-12 max-w-7xl items-center justify-between rounded-xl border border-border/50 bg-bg/70 px-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:px-4">
        <Logo />
        
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-text-muted transition-colors hover:bg-surface hover:text-text">{l.label}</a>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <a href={WAITLIST_URL} className="press inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-bold text-accent-fg hover:bg-accent-hover transition-colors"><span className="h-1.5 w-1.5 rounded-full bg-accent-fg/70" />Join waitlist</a>
        </div>
        
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface md:hidden transition-colors"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-x-3 top-[4.75rem] z-40 rounded-2xl border border-border/70 bg-bg/95 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden overflow-y-auto sm:inset-x-6">
          <div className="flex flex-col p-5">
            <div className="flex flex-col gap-6 text-lg font-medium">
              {LINKS.map((l, i) => (
                <a 
                  key={l.href} 
                  href={l.href} 
                  className="block text-text/90 hover:text-text transition-colors border-b border-border/40 pb-4"
                >
                  {l.label}
                </a>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
              <a href={WAITLIST_URL} className="press rounded-xl bg-accent px-4 py-4 text-center text-base font-bold text-accent-fg hover:bg-accent-hover transition-colors">Join waitlist</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
