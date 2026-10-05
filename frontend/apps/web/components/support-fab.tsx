"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lifebuoy, ArrowSquareOut } from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";

const FREESCOUT_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FREESCOUT_URL?.replace(/\/$/, "")) ||
  "https://support.nairacloud.xyz";

/**
 * Floating support entry point for the customer dashboard.
 * - Default: open in-app tickets (/dashboard/support)
 * - On support routes: also surface the FreeScout agent desk link
 */
export function SupportFab() {
  const pathname = usePathname() || "";
  const onSupport = pathname.startsWith("/dashboard/support");

  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col items-end gap-2",
        // Clear the mobile bottom nav; sit above it on small screens.
        // Leave room on the right for the Typebot chat bubble (~3.5rem + gap).
        "bottom-[4.75rem] right-[4.75rem] lg:bottom-6 lg:right-[4.75rem]",
      )}
    >
      {onSupport ? (
        <a
          href={FREESCOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[12px] text-text-secondary shadow-lg transition-colors hover:border-accent/40 hover:text-white"
        >
          Agent desk
          <ArrowSquareOut size={14} weight="bold" />
        </a>
      ) : null}

      <Link
        href="/dashboard/support"
        aria-label="Open support"
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-black shadow-lg transition-transform hover:scale-105",
          onSupport && "ring-2 ring-accent/40",
        )}
      >
        <Lifebuoy size={22} weight="bold" />
      </Link>
    </div>
  );
}
