"use client";

import Link from "next/link";
import { ArrowRight, ChatCircle } from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";

export function SidebarBottomCTA() {
  return (
    <div className="border-t border-border px-3 py-4 space-y-3">
      <Link
        href="/docs/getting-started"
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2.5 rounded-md",
          "bg-accent text-accent-fg font-semibold text-[12px]",
          "hover:bg-accent-hover transition-colors"
        )}
      >
        Get started
        <ArrowRight size={12} weight="bold" />
      </Link>

      <Link
        href="/dashboard/support"
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2 rounded-md",
          "border border-border text-[12px] font-medium text-text-secondary",
          "hover:border-border-hover hover:text-text hover:bg-nav-hover transition-colors"
        )}
      >
        <ChatCircle size={14} weight="duotone" />
        Open a support ticket
      </Link>
    </div>
  );
}
