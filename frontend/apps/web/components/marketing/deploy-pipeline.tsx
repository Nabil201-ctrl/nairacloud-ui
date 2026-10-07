"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, HardDrives, Stack, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { EASE, useLoopStep } from "./motion";

const STAGES = [
  { icon: Stack, n: "01", title: "Choose a plan", body: "Five sizes, from free experiments to production boxes.", log: "plan=starter · 1 vCPU · 1 GB RAM · 25 GB NVMe" },
  { icon: CreditCard, n: "02", title: "Pay in naira", body: "Paystack checkout. Receipts and invoices in your dashboard.", log: "paystack: charge.success · ₦5,000.00 · invoice NC-2041" },
  { icon: HardDrives, n: "03", title: "We provision", body: "We pick a host, write the disk, boot, and open the network — you watch progress in the dashboard.", log: "node=SRV-LAG-02 · image=ubuntu-24.04 · booting…" },
  { icon: TerminalWindow, n: "04", title: "SSH in", body: "Your key is already authorized. Root access, immediately.", log: "ssh root@197.210.29.4 -p 2201 · authorized_keys ✓" },
] as const;

export function DeployPipeline() {
  const { ref, step } = useLoopStep(STAGES.length, 2400);
  const pct = (step / (STAGES.length - 1)) * 100;

  return (
    <div ref={ref} className="elev-panel relative overflow-hidden rounded-3xl p-6 sm:p-10">
      {/* track (desktop) */}
      <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[4.25rem] hidden h-px bg-border lg:block">
        <motion.div className="h-px bg-accent" animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: EASE }} />
        <motion.span
          className="absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent/60"
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </div>

      <ol className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {STAGES.map((s, i) => {
          const reached = i <= step;
          const active = i === step;
          return (
            <li key={s.n} className="flex flex-col items-start lg:items-center lg:text-center">
              <div className="relative">
                {active && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border border-accent/50"
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.45 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-500",
                    reached ? "border-accent/50 bg-nav-active text-accent" : "border-border bg-surface text-text-muted"
                  )}
                >
                  <s.icon size={24} weight={reached ? "duotone" : "regular"} aria-hidden />
                </div>
              </div>
              <span className={cn("mt-6 font-mono text-[12px] transition-colors", reached ? "text-accent" : "text-text-muted")}>{s.n}</span>
              <h3 className={cn("mt-2 text-lg font-medium tracking-tight transition-colors", reached ? "text-text" : "text-text-secondary")}>{s.title}</h3>
              <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-text-muted">{s.body}</p>
            </li>
          );
        })}
      </ol>

      <div className="elev-inset mt-10 flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 font-mono text-[12px] sm:text-[13px]">
        <span className="shrink-0 text-accent">›</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="truncate text-text-secondary"
          >
            {STAGES[step]?.log}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
