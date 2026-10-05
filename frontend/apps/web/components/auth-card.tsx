"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { ShieldCheck } from "@phosphor-icons/react";

interface AuthCardProps {
  title: string;
  sub?: string;
  badge?: string;
  children: ReactNode;
}

export function AuthCard({ title, sub, badge, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-bg px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-md border border-border bg-card px-6 py-7 sm:px-7 sm:py-8">
          {badge ? (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {badge}
            </div>
          ) : null}

          <h1 className="text-[22px] font-medium tracking-[-0.02em] text-text sm:text-2xl">
            {title}
          </h1>
          {sub ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
              {sub}
            </p>
          ) : null}

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-text-muted">
          <ShieldCheck size={13} weight="fill" className="text-text-muted" />
          <span>256-bit TLS &middot; Paystack secured &middot; SOC 2</span>
        </div>
      </motion.div>
    </div>
  );
}
