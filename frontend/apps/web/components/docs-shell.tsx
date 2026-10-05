"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { Logo } from "@/components/logo";
import { SidebarNavigation } from "@/components/sidebar-navigation";

export function DocsShell({
  children,
  rightRail,
}: {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Resend-style Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white lg:hidden"
              aria-label="Open documentation menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <List size={20} />
            </button>

            <Logo size="sm" />
          </div>

          {/* Center Navigation Links matching Resend header */}
          <nav aria-label="Main Documentation" className="hidden md:flex items-center gap-6 text-[13px] font-medium">
            <Link href="/docs" className="text-white font-semibold transition-colors">
              Documentation
            </Link>
            <Link href="/docs" className="text-neutral-400 hover:text-white transition-colors">
              Guides
            </Link>
            <Link href="/docs/api-reference" className="text-neutral-400 hover:text-white transition-colors">
              API Reference
            </Link>
          </nav>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Documentation menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Close documentation menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-neutral-800 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-neutral-800 px-4">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white"
                aria-label="Close documentation menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNavigation onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-[90rem]">
        <aside
          className={cn(
            "hidden lg:flex sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col",
            "border-r border-neutral-800/80 bg-black"
          )}
        >
          <SidebarNavigation />
        </aside>

        <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div
            className={cn(
              rightRail
                ? "mx-auto flex w-full max-w-6xl items-start gap-12"
                : "mx-auto max-w-3xl"
            )}
          >
            <div className="min-w-0 flex-1">{children}</div>
            {rightRail ? (
              <aside className="hidden w-56 shrink-0 xl:block" aria-label="On this page">
                {rightRail}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
