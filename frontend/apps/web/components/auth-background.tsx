"use client";

import { motion } from "framer-motion";

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050a09]">

      {/* Technical grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,217,160,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,160,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 50% 45%, #000 20%, transparent 75%)",
        }}
      />

      {/* Primary aurora — big, bright, centered */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[35%] h-[550px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-[150px]"
      />

      {/* Secondary emerald orb — drifting left */}
      <motion.div
        animate={{
          x: [-50, 70, -50],
          y: [-20, 40, -20],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[25%] top-[30%] h-[400px] w-[450px] rounded-full bg-emerald-500/30 blur-[120px]"
      />

      {/* Tertiary cyan accent — adds color variety */}
      <motion.div
        animate={{
          x: [30, -40, 30],
          y: [15, -30, 15],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute right-[20%] top-[40%] h-[350px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]"
      />

      {/* Scanning beam 1 */}
      <motion.div
        animate={{ top: ["-5%", "115%"], opacity: [0, 0.7, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
        className="absolute left-[35%] h-36 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent"
      />

      {/* Scanning beam 2 */}
      <motion.div
        animate={{ top: ["-10%", "120%"], opacity: [0, 0.4, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "linear",
          delay: 3.5,
        }}
        className="absolute right-[38%] h-48 w-px bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent"
      />

      {/* Floating micro-dots */}
      {[
        { l: "20%", t: "30%", d: 6, del: 0 },
        { l: "75%", t: "25%", d: 8, del: 1 },
        { l: "50%", t: "70%", d: 7, del: 2 },
        { l: "35%", t: "55%", d: 9, del: 0.5 },
        { l: "65%", t: "45%", d: 5, del: 3 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: dot.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.del,
          }}
          className="absolute h-1 w-1 rounded-full bg-accent/50"
          style={{ left: dot.l, top: dot.t }}
        />
      ))}

      {/* Soft vignette — edges only, doesn't kill the center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,10,9,0.4)_75%,rgba(5,10,9,0.85)_100%)]" />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050a09]/80 to-transparent" />
    </div>
  );
}
