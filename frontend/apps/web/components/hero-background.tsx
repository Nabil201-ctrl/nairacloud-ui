"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%]">
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/30 blur-[120px] rounded-full"
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <motion.div
          initial={{ opacity: 0, top: "0%" }}
          animate={{ opacity: [0, 1, 0], top: ["0%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute left-[calc(50%-2rem)] w-[1px] h-[150px] bg-gradient-to-b from-transparent via-accent to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, top: "-20%" }}
          animate={{ opacity: [0, 0.5, 0], top: ["-20%", "120%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute left-[calc(50%+6rem)] w-[1px] h-[200px] bg-gradient-to-b from-transparent via-accent to-transparent"
        />
      </div>
    </div>
  );
}
