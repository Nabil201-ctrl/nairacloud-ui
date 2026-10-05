"use client";

import { useState } from "react";
import { Check, Copy, TerminalWindow, Cpu } from "@phosphor-icons/react";

export type CommandLogEntry = { at?: string; stage?: string; cmd: string; out: string; code: number };

function fmtTime(at?: string): string {
  if (!at) return "";
  return new Date(at).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderOutputWithAiBadges(out: string) {
  if (!out) return <span className="italic text-text-muted/60">(no output)</span>;
  if (!out.includes("[groq-ai auto-input:")) return <span>{out}</span>;

  const parts = out.split(/(\[groq-ai auto-input: [^\]]+\])/g);
  return parts.map((part, idx) => {
    if (part.startsWith("[groq-ai auto-input:")) {
      const inputStr = part.slice("[groq-ai auto-input:".length, -1).trim();
      return (
        <span key={idx} className="my-1 inline-flex items-center gap-1.5 rounded bg-accent/15 border border-accent/30 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent shadow-sm">
          <Cpu size={12} weight="bold" className="text-accent animate-pulse" />
          Groq AI Auto-Input: <code className="rounded bg-black/40 px-1 py-0.2 text-white">{inputStr}</code>
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function NodeTerminal({ name, log }: { name: string; log: CommandLogEntry[] | null }) {
  const entries = log ?? [];
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = entries
      .map((e) => `${e.at ? `(${fmtTime(e.at)}) ` : ""}$ ${e.cmd}\n${e.out || "(no output)"}${e.code !== 0 ? ` [exit ${e.code}]` : ""}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-[#04040a] shadow-[0_0_30px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
        </div>
        <p className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <TerminalWindow size={12} weight="fill" className="shrink-0 text-accent" aria-hidden />
          {name} · setup transcript
        </p>
        <button
          type="button"
          onClick={copy}
          disabled={entries.length === 0}
          title="Copy transcript"
          className="press shrink-0 rounded-sm border border-border/60 px-1.5 py-1 text-text-muted transition-colors hover:border-border-hover hover:text-text disabled:opacity-40"
          aria-label="Copy setup transcript"
        >
          {copied ? <Check size={12} weight="bold" className="text-accent" /> : <Copy size={12} weight="bold" />}
        </button>
      </div>

      <div className="max-h-[72vh] min-h-40 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {entries.length === 0 ? (
          <p className="text-text-muted">
            No setup transcript yet. Probe + onboard a host and every command run on it over SSH lands here.
          </p>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="space-y-0.5 mb-2">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {e.stage && (
                  <span className={`font-bold uppercase tracking-wider ${e.stage === "probe" ? "text-info" : "text-warning"}`}>
                    [{e.stage}]
                  </span>
                )}
                <span className="text-accent">$</span>
                <span className="text-text font-semibold">{e.cmd}</span>
                {e.at && <span className="ml-auto text-[10px] text-text-muted/70">{fmtTime(e.at)}</span>}
              </p>
              <div className="whitespace-pre-wrap text-text-muted pl-4 border-l border-white/5">
                {renderOutputWithAiBadges(e.out)}
                {e.code !== 0 && <span className="font-bold text-danger ml-1"> [exit {e.code}]</span>}
              </div>
            </div>
          ))
        )}
        <p className="mt-2 flex items-center gap-1.5" aria-hidden>
          <span className="text-accent">&gt;</span>
          <span className="inline-block h-3.5 w-2 animate-pulse bg-accent/80 shadow-[0_0_8px_rgba(0,217,160,0.8)]" />
          <span className="text-[10px] text-text-muted/80">{entries.length} command(s) on record · Groq AI Observer Active</span>
        </p>
      </div>
    </div>
  );
}