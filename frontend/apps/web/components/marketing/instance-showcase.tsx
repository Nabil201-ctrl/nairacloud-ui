"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowClockwise,
  ChartLine,
  CreditCard,
  Cube,
  HardDrives,
  Key,
  SquaresFour,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { StatusDot, cn } from "@nairacloud/ui";
import { EASE } from "./motion";

const NAV = [
  { icon: SquaresFour, label: "Overview" },
  { icon: Cube, label: "Instances", active: true },
  { icon: Key, label: "SSH Keys" },
  { icon: CreditCard, label: "Billing" },
  { icon: ChartLine, label: "Usage" },
];

const ACTIVITY = [
  { icon: ArrowClockwise, text: "Instance restarted", at: "2m ago" },
  { icon: CreditCard, text: "Payment received · ₦9,500", at: "3d ago" },
  { icon: Key, text: "SSH key “laptop” added", at: "5d ago" },
];

function Sparkline({
  d,
  delay,
  inView,
}: {
  d: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <svg
      viewBox="0 0 240 64"
      preserveAspectRatio="none"
      className="mt-4 h-16 w-full overflow-visible"
    >
      <motion.path
        d={`${d} L240 64 L0 64 Z`}
        className="fill-accent/10"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.8, duration: 0.8 }}
      />
      <motion.path
        d={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-accent"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ delay, duration: 1.6, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Gauge({
  label,
  pct,
  delay,
  inView,
}: {
  label: string;
  pct: number;
  delay: number;
  inView: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-[12px]">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono text-text">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ring-track">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ delay, duration: 1.2, ease: EASE }}
        />
      </div>
    </div>
  );
}

export function InstanceShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <div ref={ref} className="relative [perspective:1600px]">
      <div
        aria-hidden
        className="absolute inset-x-[10%] -top-10 -z-10 h-64 rounded-full bg-accent/[0.07] blur-3xl"
      />
      <motion.div
        style={{ rotateX, scale, transformOrigin: "50% 0%" }}
        className="bg-card overflow-hidden rounded-2xl p-1.5"
        aria-hidden
      >
        <div className="flex overflow-hidden rounded-xl border border-border-subtle bg-bg">
          {/* sidebar */}
          <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-border-subtle bg-sidebar p-3 md:flex">
            <div className="mb-3 flex items-center gap-2 px-2 py-1.5">
              <span className="h-5 w-5 rounded-md bg-nav-active" />
              <span className="text-[13px] font-medium text-text">
                NairaCloud
              </span>
            </div>
            {NAV.map((n) => (
              <span
                key={n.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]",
                  n.active ? "bg-nav-active text-text" : "text-text-muted",
                )}
              >
                <n.icon className={cn("h-4 w-4", n.active && "text-accent")} />{" "}
                {n.label}
              </span>
            ))}
          </aside>

          {/* main */}
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface">
                  <HardDrives className="h-4 w-4 text-text-secondary" />
                </span>
                <div>
                  <p className="font-mono text-[15px] text-text">api-prod-01</p>
                  <p className="text-[12px] text-text-muted">
                    BASIC · Ubuntu 24.04 · 2 vCPU / 2 GB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot
                  status="RUNNING"
                  className="rounded-full border border-border px-2.5 py-1"
                />
                <span className="hidden rounded-lg border border-border px-3 py-1.5 text-[12px] text-text-secondary sm:inline">
                  Restart
                </span>
                <span className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground sm:inline-flex">
                  <TerminalWindow className="h-3.5 w-3.5" /> Console
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-5 border-b border-border-subtle text-[13px]">
              {["Overview", "Console", "Metrics", "Settings"].map((t, i) => (
                <span
                  key={t}
                  className={cn(
                    "-mb-px pb-2.5",
                    i === 0
                      ? "border-b-2 border-accent text-text"
                      : "text-text-muted",
                  )}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="elev-panel rounded-xl p-4 lg:col-span-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-text-muted">CPU · last 24h</span>
                  <span className="font-mono text-text">18% avg</span>
                </div>
                <Sparkline
                  inView={inView}
                  delay={0.3}
                  d="M0 48 C 20 44, 30 30, 50 34 S 80 50, 100 38 S 130 14, 150 24 S 180 44, 200 30 S 225 18, 240 22"
                />
              </div>
              <div className="elev-panel space-y-4 rounded-xl p-4">
                <Gauge label="Memory" pct={64} delay={0.5} inView={inView} />
                <Gauge label="Disk" pct={31} delay={0.65} inView={inView} />
                <Gauge label="Network" pct={12} delay={0.8} inView={inView} />
              </div>
              <div className="elev-panel rounded-xl p-4 lg:col-span-3">
                <p className="text-[12px] text-text-muted">Activity</p>
                <ul className="mt-3 divide-y divide-border-subtle">
                  {ACTIVITY.map((a, i) => (
                    <motion.li
                      key={a.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        delay: 1 + i * 0.15,
                        duration: 0.5,
                        ease: EASE,
                      }}
                      className="flex items-center justify-between py-2.5 text-[13px]"
                    >
                      <span className="flex items-center gap-2.5 text-text-secondary">
                        <a.icon className="h-4 w-4 text-text-muted" /> {a.text}
                      </span>
                      <span className="font-mono text-[11px] text-text-muted">
                        {a.at}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
