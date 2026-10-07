"use client";

import { MotionConfig, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** All marketing motion honours the OS "reduce motion" setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + rise + un-blur when scrolled into view. */
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/**
 * Cycles 0..steps-1 every `interval` ms while the element is on screen.
 * Under reduced motion it stays on the final step (a complete, static picture).
 */
export function useLoopStep(steps: number, interval: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStep(steps - 1);
      return;
    }
    if (!inView) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), interval);
    return () => window.clearInterval(id);
  }, [inView, reduced, steps, interval]);

  return { ref, step, inView, reduced: Boolean(reduced) };
}
