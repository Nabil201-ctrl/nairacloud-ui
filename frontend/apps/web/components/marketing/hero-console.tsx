"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { CheckCircle, CircleNotch, Receipt } from "@phosphor-icons/react/dist/ssr";
import { StatusDot } from "@nairacloud/ui";
import { EASE } from "./motion";

const COMMAND = "nairacloud deploy --plan starter";
const STEPS = [
  "Payment verified · Paystack",
  "Server assigned · SRV-LAG-02",
  "Instance booting · Ubuntu 24.04",
  "Network ready · SSH port 2201",
];
// phase 0 = typing, 1..4 = step N running, 5 = ready (held), then loop.
const DURATIONS = [1300, 800, 700, 1100, 700, 4200];
const READY = STEPS.length + 1;

function useDeployPhase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase(READY);
      return;
    }
    if (!inView) return;
    const id = window.setTimeout(() => {
      if (phase === READY) {
        setPhase(0);
        setCycle((c) => c + 1);
      } else setPhase(phase + 1);
    }, DURATIONS[phase]);
    return () => window.clearTimeout(id);
  }, [phase, inView, reduced]);

  return { ref, phase, cycle, reduced: Boolean(reduced) };
}

function StepIcon({ state }: { state: "pending" | "running" | "done" }) {
  if (state === "done") return <CheckCircle weight="fill" className="h-4 w-4 shrink-0 text-accent" aria-hidden />;
  if (state === "running") return <CircleNotch className="h-4 w-4 shrink-0 animate-spin text-text-secondary" aria-hidden />;
  return <span aria-hidden className="mx-[3px] h-2.5 w-2.5 shrink-0 rounded-full border border-border-hover" />;
}

export function HeroConsole() {
  const { ref, phase, cycle, reduced } = useDeployPhase();
  const progress = Math.min(phase / READY, 1);
  const ready = phase === READY;

  return (
    <div ref={ref} className="relative">
      {/* depth: soft light behind the window */}

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        style={{ transformPerspective: 1200 }}
        className="rounded-2xl border border-border bg-card p-1.5"
      >
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-sidebar">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
            </div>
            <span className="rounded-md border border-border-subtle bg-bg/60 px-3 py-1 font-mono text-[11px] text-text-muted">deploy — nairacloud</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              <span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> live
            </span>
          </div>

          {/* progress */}
          <div className="h-px bg-border-subtle">
            <motion.div className="h-px bg-accent" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
          </div>

          <div className="space-y-3.5 px-5 py-6 font-mono text-[13px] leading-relaxed sm:px-6" aria-live="off">
            <p className="flex items-center gap-3">
              <span className="text-accent">$</span>
              {reduced ? (
                <span className="text-text">{COMMAND}</span>
              ) : (
                <motion.span
                  key={cycle}
                  className="inline-block overflow-hidden whitespace-nowrap align-bottom text-text"
                  initial={{ width: "0ch" }}
                  animate={{ width: `${COMMAND.length}ch` }}
                  transition={{ duration: 1.1, ease: "linear" }}
                >
                  {COMMAND}
                </motion.span>
              )}
              {phase === 0 && !reduced && <span aria-hidden className="cursor-blink -ml-2 inline-block h-3.5 w-1.5 bg-accent" />}
            </p>

            <ul className="space-y-2.5 pl-5">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const state = phase > n ? "done" : phase === n ? "running" : "pending";
                return (
                  <li key={label} className={`flex items-center gap-2.5 transition-colors duration-300 ${state === "pending" ? "text-text-disabled" : "text-text-secondary"}`}>
                    <StepIcon state={state} />
                    {label}
                  </li>
                );
              })}
            </ul>

            <div className="h-[76px] pl-5 pt-1">
              <AnimatePresence mode="wait">
                {ready && (
                  <motion.div
                    key={`ready-${cycle}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/70 px-3 py-2">
                      <span className="text-text">ssh root@197.210.29.4 -p 2201</span>
                      <span className="text-[11px] text-accent">Copy</span>
                    </div>
                    <p className="text-text">
                      Ready in 42s <span aria-hidden className="cursor-blink ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent" />
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle bg-bg/40 px-5 py-3 sm:px-6">
            <StatusDot status={ready ? "RUNNING" : "CREATING"} />
            <span className="font-mono text-[11px] text-text-muted">SRV-LAG-02 · Ubuntu 24.04</span>
          </div>
        </div>
      </motion.div>

      {/* floating card: invoice */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: reduced ? 0 : [0, -8, 0] }}
        transition={{ opacity: { delay: 0.9, duration: 0.6 }, x: { delay: 0.9, duration: 0.8, ease: EASE }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -left-[13.5rem] top-10 hidden w-52 rounded-xl border border-border bg-card p-4 xl:block"
      >
        <div className="flex items-center gap-2 text-[12px] text-text-secondary">
          <Receipt className="h-4 w-4 text-text-muted" /> Invoice NC-2041
        </div>
        <p className="mt-3 font-mono text-xl text-text">₦5,000.00</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-accent">
          <CheckCircle weight="fill" className="h-3.5 w-3.5" /> Paid via Paystack
        </p>
      </motion.div>

      {/* floating card: live cpu */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: reduced ? 0 : [0, 8, 0] }}
        transition={{ opacity: { delay: 1.2, duration: 0.6 }, x: { delay: 1.2, duration: 0.8, ease: EASE }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -right-[13.5rem] bottom-12 hidden w-52 rounded-xl border border-border bg-card p-4 xl:block"
      >
        <div className="flex items-center justify-between text-[12px] text-text-secondary">
          <span>CPU · api-prod</span>
          <span className="font-mono text-text">12%</span>
        </div>
        <svg viewBox="0 0 200 48" className="mt-3 h-12 w-full overflow-visible">
          <motion.path
            d="M0 38 C 20 36, 30 20, 50 26 S 80 40, 100 30 S 130 10, 150 18 S 180 32, 200 22"
            fill="none"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.4, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
