"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Bank,
  CheckCircle,
  CreditCard,
  Key,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { EASE, useLoopStep } from "./motion";

/** Frame every visual sits in: an inset "screen" with a faint grid. */
function Stage({
  children,
  className,
  stageRef,
}: {
  children: React.ReactNode;
  className?: string;
  stageRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={stageRef}
      aria-hidden
      className={cn(
        "elev-inset relative flex h-56 items-center justify-center overflow-hidden rounded-xl",
        "bg-[linear-gradient(to_right,var(--border-faint)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-faint)_1px,transparent_1px)] bg-[size:24px_24px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const ngn = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* 1 ── Priced in naira: invoice totals up, FX line stays at zero */
export function NairaInvoiceVisual() {
  const { ref, step } = useLoopStep(2, 4200);
  const total = useMotionValue(0);
  const label = useTransform(total, (v) => ngn(Math.round(v)));
  const [text, setText] = useState(ngn(0));

  useEffect(() => label.on("change", setText), [label]);
  useEffect(() => {
    total.set(0);
    const controls = animate(total, 5000, {
      duration: 1.2,
      ease: EASE,
      delay: 0.5,
    });
    return () => controls.stop();
  }, [step, total]);

  const rows: [string, string][] = [
    ["STARTER · 1 month", ngn(5000)],
    ["FX conversion", ngn(0)],
    ["Card currency", "NGN"],
  ];

  return (
    <Stage stageRef={ref}>
      <div className="bg-card w-[min(340px,86%)] rounded-xl p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-secondary">
            Invoice NC-2041
          </span>
          <AnimatePresence>
            <motion.span
              key={step}
              initial={{ opacity: 0, scale: 1.4, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ delay: 1.6, duration: 0.4, ease: EASE }}
              className="rounded border border-accent/50 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-accent"
            >
              PAID
            </motion.span>
          </AnimatePresence>
        </div>
        <ul className="mt-4 space-y-2.5 font-mono text-[12px]">
          {rows.map(([k, v], i) => (
            <motion.li
              key={`${k}-${step}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4, ease: EASE }}
              className="flex justify-between"
            >
              <span className="text-text-muted">{k}</span>
              <span className={i === 1 ? "text-accent" : "text-text"}>{v}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-[13px] text-text-secondary">Total</span>
          <span className="font-mono text-xl text-text">{text}</span>
        </div>
      </div>
    </Stage>
  );
}

/* 2 ── Paystack checkout: method switches, then payment verifies */
export function CheckoutVisual() {
  const { ref, step } = useLoopStep(4, 1400);
  const method = step % 2 === 0 ? "card" : "transfer";
  const verified = step === 3;

  return (
    <Stage stageRef={ref}>
      <div className="bg-card w-[min(280px,86%)] rounded-xl p-4">
        <p className="text-[12px] text-text-muted">Pay NairaCloud</p>
        <p className="mt-1 font-mono text-lg text-text">₦5,000.00</p>
        <div className="relative mt-4 grid grid-cols-2 rounded-lg border border-border bg-bg/60 p-1 text-[12px]">
          {(["card", "transfer"] as const).map((m) => (
            <span
              key={m}
              className={cn(
                "relative z-10 flex items-center justify-center gap-1.5 py-1.5 transition-colors",
                method === m ? "text-text" : "text-text-muted",
              )}
            >
              {method === m && (
                <motion.span
                  layoutId="pay-method"
                  className="absolute inset-0 -z-10 rounded-md bg-surface-hover"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              {m === "card" ? (
                <CreditCard className="h-3.5 w-3.5" />
              ) : (
                <Bank className="h-3.5 w-3.5" />
              )}
              {m === "card" ? "Card" : "Transfer"}
            </span>
          ))}
        </div>
        <motion.div
          layout
          className={cn(
            "mt-3 flex h-9 items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-colors duration-300",
            verified
              ? "bg-accent/15 text-accent"
              : "bg-primary text-primary-foreground",
          )}
        >
          {verified ? (
            <>
              <CheckCircle weight="fill" className="h-4 w-4" /> Payment verified
            </>
          ) : (
            "Pay ₦5,000"
          )}
        </motion.div>
      </div>
    </Stage>
  );
}

/* 3 ── Online in minutes: provisioning ring + timer */
export function ProvisionVisual() {
  const { ref, step } = useLoopStep(2, 4000);
  const secs = useMotionValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => secs.on("change", (v) => setShown(Math.round(v))), [secs]);
  useEffect(() => {
    secs.set(0);
    const c = animate(secs, 42, { duration: 2.6, ease: "easeOut" });
    return () => c.stop();
  }, [step, secs]);

  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <Stage stageRef={ref}>
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={R}
            fill="none"
            strokeWidth="6"
            className="stroke-ring-track"
          />
          <motion.circle
            key={step}
            cx="56"
            cy="56"
            r={R}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-accent"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl text-text">{shown}s</span>
          <span className="mt-1 text-[11px] text-text-muted">
            {shown >= 42 ? "Running" : "Provisioning"}
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* 4 ── Developer-first: SSH session + scoped API key */
const TERM = [
  { t: "$ ssh root@197.210.29.4 -p 2201", c: "text-text" },
  { t: "Welcome to Ubuntu 24.04 LTS", c: "text-text-muted" },
  { t: "root@api-prod:~# docker compose up -d", c: "text-text" },
  { t: "✔ Container api  Started", c: "text-accent" },
];
export function TerminalVisual() {
  const { ref, step } = useLoopStep(2, 5200);
  return (
    <Stage stageRef={ref} className="items-stretch justify-start p-5">
      <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2 font-mono text-[12px] sm:text-[13px]">
          {TERM.map((l, i) => (
            <motion.p
              key={`${l.t}-${step}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 * i, duration: 0.35, ease: EASE }}
              className={l.c}
            >
              {l.t}
            </motion.p>
          ))}
        </div>
        <motion.div
          key={`key-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5, ease: EASE }}
          className="bg-card h-fit shrink-0 self-end rounded-lg px-3 py-2.5"
        >
          <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Key className="h-3.5 w-3.5" /> API key
          </p>
          <p className="mt-1 font-mono text-[12px] text-text">
            nc_live_••••8f2a
          </p>
        </motion.div>
      </div>
    </Stage>
  );
}

/* 5 ── Transparent billing: 3-day grace period, nothing suspended silently */
const GRACE = [
  "Payment failed",
  "Grace warning",
  "Grace warning",
  "Grace ends",
];
export function GraceVisual() {
  const { ref, step } = useLoopStep(GRACE.length, 1500);
  return (
    <Stage stageRef={ref} className="flex-col gap-6 px-6">
      <div className="relative w-full max-w-sm">
        <div className="absolute left-0 right-0 top-[7px] h-px bg-border" />
        <motion.div
          className="absolute left-0 top-[7px] h-px bg-warning"
          animate={{ width: `${(step / (GRACE.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <div className="relative flex justify-between">
          {GRACE.map((g, i) => (
            <div key={i} className="flex w-0 flex-col items-center">
              <span
                className={cn(
                  "h-[15px] w-[15px] rounded-full border-2 transition-colors duration-300",
                  i <= step
                    ? "border-warning bg-warning/20"
                    : "border-border-hover bg-bg",
                )}
              />
              <span className="mt-2 whitespace-nowrap font-mono text-[10px] text-text-muted">
                Day {i}
              </span>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="bg-card flex w-full max-w-sm items-center gap-3 rounded-lg px-4 py-3"
        >
          <WarningCircle
            weight="fill"
            className="h-5 w-5 shrink-0 text-warning"
          />
          <div className="text-[12px]">
            <p className="text-text">{GRACE[step]}</p>
            <p className="text-text-muted">
              {GRACE.length - 1 - step} days left before suspension
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}

/* 6 ── Real support: a real-shaped ticket thread */
export function SupportVisual() {
  const { ref, step } = useLoopStep(3, 2000);
  return (
    <Stage
      stageRef={ref}
      className="flex-col items-stretch justify-center gap-3 px-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-surface-hover px-3.5 py-2.5 text-[12px] text-text"
      >
        Can you open ports 80 and 443 on my instance?
      </motion.div>
      <div className="flex items-end gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nav-active font-mono text-[9px] text-accent">
          NC
        </span>
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1 rounded-2xl rounded-bl-md border border-border bg-bg/70 px-3.5 py-3"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-text-muted"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="reply"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-bg/70 px-3.5 py-2.5 text-[12px] text-text-secondary"
            >
              Done — both are published on your node. Caddy or nginx can serve
              your domain from here.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}
