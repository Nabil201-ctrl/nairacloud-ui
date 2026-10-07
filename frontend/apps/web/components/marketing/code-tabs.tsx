"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@nairacloud/ui";
import { EASE } from "./motion";

type Line = { t: string; c?: string };

const TABS: Record<
  "ssh" | "api",
  { label: string; file: string; lines: Line[] }
> = {
  ssh: {
    label: "SSH",
    file: "terminal",
    lines: [
      { t: "$ ssh root@197.210.29.4 -p 2201", c: "text-text" },
      {
        t: "Welcome to Ubuntu 24.04 LTS (GNU/Linux x86_64)",
        c: "text-text-muted",
      },
      { t: "" },
      { t: "root@api-prod:~# apt install -y nginx", c: "text-text" },
      { t: "Setting up nginx (1.24.0) ...", c: "text-text-muted" },
      { t: "root@api-prod:~# systemctl status nginx", c: "text-text" },
      { t: "● nginx.service — active (running)", c: "text-accent" },
    ],
  },
  api: {
    label: "REST API",
    file: "create-instance.sh",
    lines: [
      {
        t: "curl -X POST https://api.nairacloud.xyz/v1/instances \\",
        c: "text-text",
      },
      {
        t: '  -H "Authorization: Bearer nc_live_…" \\',
        c: "text-text-secondary",
      },
      {
        t: '  -H "Content-Type: application/json" \\',
        c: "text-text-secondary",
      },
      {
        t: `  -d '{"planId":"starter","hostname":"api-prod",`,
        c: "text-text-secondary",
      },
      {
        t: `       "image":"ubuntu-24.04","sshKeyId":"key_…"}'`,
        c: "text-text-secondary",
      },
      { t: "" },
      {
        t: '{ "success": true, "data": { "hostname": "api-prod", "status": "CREATING" } }',
        c: "text-accent",
      },
    ],
  },
};

export function CodeTabs() {
  const [tab, setTab] = useState<keyof typeof TABS>("ssh");
  const active = TABS[tab];

  return (
    <div className="bg-card overflow-hidden rounded-2xl p-1.5">
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-sidebar">
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
          <div role="tablist" aria-label="Code example" className="flex gap-1">
            {(Object.keys(TABS) as Array<keyof typeof TABS>).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  tab === k
                    ? "text-text"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {tab === k && (
                  <motion.span
                    layoutId="code-tab"
                    className="absolute inset-0 rounded-md bg-surface-hover"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
                <span className="relative">{TABS[k].label}</span>
              </button>
            ))}
          </div>
          <span className="font-mono text-[11px] text-text-muted">
            {active.file}
          </span>
        </div>
        <div className="min-h-[248px] overflow-x-auto p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.pre
              key={tab}
              className="font-mono text-[12.5px] leading-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {active.lines.map((l, i) => (
                <motion.span
                  key={i}
                  className={cn("block whitespace-pre", l.c)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.3, ease: EASE }}
                >
                  {l.t || " "}
                </motion.span>
              ))}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
