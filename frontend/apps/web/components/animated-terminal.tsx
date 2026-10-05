"use client";

import { motion } from "framer-motion";
import { CopyField } from "@nairacloud/ui";

const lines = [
  { type: "input", content: "nairacloud deploy --plan starter", delay: 0 },
  { type: "status", content: "Payment verified · Paystack", delay: 1.2 },
  { type: "status", content: "Server assigned · SRV-LAG-02", delay: 1.8 },
  { type: "status", content: "Instance booting · Ubuntu 24.04", delay: 2.5 },
  { type: "output", content: "ssh root@197.210.29.4", delay: 3.5 },
];

export function AnimatedTerminal() {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-hover/30 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-bg shadow-inner">
        <div className="flex items-center justify-between border-b border-border/60 bg-surface/50 px-4 py-3" aria-hidden>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-danger/60" />
            <span className="h-3 w-3 rounded-full bg-warning/60" />
            <span className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-wider text-text-muted/80">deploy — nairacloud</span>
          <div className="w-11" />
        </div>
        
        <div className="space-y-3 p-6 font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: line.delay, duration: 0.3 }}
            >
              {line.type === "input" && (
                <p className="flex items-center gap-3">
                  <span className="text-accent font-bold">$</span> 
                  <span className="text-text">{line.content}</span>
                </p>
              )}
              {line.type === "status" && (
                <p className="text-text-muted/80 ml-5">{line.content}</p>
              )}
              {line.type === "output" && (
                <div className="pt-2 ml-5">
                  <CopyField value={line.content} label="SSH string" />
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: line.delay + 0.8 }}
                    className="mt-3 text-text font-medium flex items-center gap-2"
                  >
                    Ready in 42s 
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="inline-block h-3.5 w-2 bg-accent" 
                    />
                  </motion.p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
