"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Key, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { EASE } from "./motion";

type Tab = {
  label: string;
  icon: typeof Key;
  request: string[];
  responseLabel: string;
  response: { t: string; c?: string }[];
};

const TABS: Record<"api" | "ssh", Tab> = {
  api: {
    label: "cURL",
    icon: Key,
    request: [
      "curl -X POST https://api.nairacloud.xyz/v1/instances \\",
      '  -H "Authorization: Bearer nc_live_…" \\',
      '  -H "Content-Type: application/json" \\',
      "  -d '{",
      '    "planId": "starter",',
      '    "hostname": "api-prod",',
      '    "image": "ubuntu-24.04",',
      '    "sshKeyId": "key_…"',
      "  }'",
    ],
    responseLabel: ".JSON",
    response: [
      { t: "{" },
      { t: '  "success": true,', c: "text-text-secondary" },
      { t: '  "data": {', c: "text-text-secondary" },
      { t: '    "hostname": "api-prod",', c: "text-accent" },
      { t: '    "image": "ubuntu-24.04",', c: "text-accent" },
      { t: '    "status": "CREATING"', c: "text-accent" },
      { t: "  }", c: "text-text-secondary" },
      { t: "}" },
    ],
  },
  ssh: {
    label: "SSH",
    icon: TerminalWindow,
    request: ["ssh root@197.210.29.4 -p 2201", "", "apt install -y nginx", "systemctl status nginx"],
    responseLabel: "TERMINAL",
    response: [
      { t: "Welcome to Ubuntu 24.04 LTS", c: "text-text-secondary" },
      { t: "root@api-prod:~#", c: "text-text-muted" },
      { t: "Setting up nginx (1.24.0) ...", c: "text-text-secondary" },
      { t: "● nginx.service", c: "text-text" },
      { t: "  Active: active (running)", c: "text-accent" },
    ],
  },
};

export function CodeTabs() {
  const [tab, setTab] = useState<keyof typeof TABS>("api");
  const [copied, setCopied] = useState(false);
  const active = TABS[tab];

  async function copy() {
    try {
      await navigator.clipboard.writeText(active.request.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* tab bar */}
      <div className="flex items-stretch justify-between border-b border-border">
        <div role="tablist" aria-label="Code example" className="flex">
          {(Object.keys(TABS) as Array<keyof typeof TABS>).map((k) => {
            const Icon = TABS[k].icon;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "relative flex items-center gap-2 border-r border-border px-5 py-3.5 text-sm transition-colors",
                  tab === k ? "bg-main text-text" : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab === k && <motion.span layoutId="code-tab-line" className="absolute inset-x-0 top-0 h-px bg-accent" transition={{ duration: 0.3, ease: EASE }} />}
                <Icon className="h-4 w-4" aria-hidden />
                {TABS[k].label}
              </button>
            );
          })}
        </div>
        <button onClick={() => void copy()} className="flex items-center gap-2 border-l border-border px-5 text-sm text-text-muted transition-colors hover:text-text">
          {copied ? <Check className="h-4 w-4 text-accent" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* request */}
          <pre className="min-h-[280px] overflow-x-auto p-6 font-mono text-[13px] leading-7">
            {active.request.map((line, i) => (
              <motion.span
                key={i}
                className="flex"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
              >
                <span className="w-8 shrink-0 select-none text-text-disabled">{i + 1}</span>
                <span className="whitespace-pre text-text">{line || " "}</span>
              </motion.span>
            ))}
          </pre>

          {/* response */}
          <div className="border-t border-border bg-sidebar lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
              <span className="flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2.5 w-2.5 rounded-full border border-border-hover" />
                ))}
              </span>
              <span className="font-mono text-[11px] text-text-muted">[ {active.responseLabel} ]</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7">
              {active.response.map((l, i) => (
                <motion.span
                  key={i}
                  className="flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                >
                  <span className="w-7 shrink-0 select-none text-text-disabled">{i + 1}</span>
                  <span className={cn("whitespace-pre", l.c ?? "text-text-muted")}>{l.t}</span>
                </motion.span>
              ))}
            </pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
