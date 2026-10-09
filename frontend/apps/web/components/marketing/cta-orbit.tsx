"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Concentric rings with orbiting nodes behind the closing CTA. Decorative. */
export function CtaOrbit() {
  const reduced = useReducedMotion();
  const rings = [
    { size: 340, dur: 40, dot: "bg-accent" },
    { size: 520, dur: 60, dot: "bg-text-secondary" },
    { size: 720, dur: 90, dot: "bg-accent" },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
    >
      {rings.map((r, i) => (
        <motion.div
          key={r.size}
          className="absolute rounded-full border border-border"
          style={{ width: r.size, height: r.size }}
          animate={reduced ? {} : { rotate: i % 2 ? -360 : 360 }}
          transition={{ duration: r.dur, repeat: Infinity, ease: "linear" }}
        >
          <span
            className={`absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${r.dot}`}
          />
        </motion.div>
      ))}
    </div>
  );
}
