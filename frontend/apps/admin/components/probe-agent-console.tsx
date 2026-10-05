"use client";

import { useEffect, useRef } from "react";
import { Cpu, TerminalWindow } from "@phosphor-icons/react";
import type { ProbeProgressData } from "@/hooks/use-realtime";

function fmt(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

function isWorking(events: ProbeProgressData[]): boolean {
  const last = events[events.length - 1];
  if (!last) return false;
  if (last.step === "complete" || last.step === "error") return false;
  const age = Date.now() - new Date(last.timestamp).getTime();
  return age >= 0 && age < 12_000;
}

export function ProbeAgentConsole({
  name,
  events,
  connected,
  connectionError,
}: {
  name: string;
  events: ProbeProgressData[];
  connected: boolean;
  connectionError?: string | null;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const working = isWorking(events);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <div className="overflow-hidden rounded-lg border border-accent/30 bg-[#04040a] shadow-[0_0_30px_rgba(0,217,160,0.06)]">
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5">
        <Cpu size={14} weight="fill" className={working ? "text-accent animate-pulse" : "text-text-muted"} />
        <p className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <TerminalWindow size={12} weight="fill" className="mr-1.5 inline text-accent" aria-hidden />
          {name} · Groq probe agent
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
            !connected
              ? "bg-white/5 text-text-muted"
              : working
                ? "bg-accent/15 text-accent"
                : "bg-white/5 text-text-muted"
          }`}
        >
          {!connected ? "Socket offline" : working ? "Working" : events.length ? "Idle" : "Standing by"}
        </span>
      </div>

      <div ref={scroller} className="max-h-80 min-h-36 overflow-auto p-3.5 font-mono text-xs leading-relaxed">
        {!connected && connectionError && (
          <p className="mb-2 text-warning">Live feed is offline: {connectionError}</p>
        )}
        {events.length === 0 ? (
          <p className="text-text-muted">
            {connected
              ? "Connected. Probe or onboard this host and each SSH command will show up here while Groq answers prompts."
              : "Nothing running on this host yet. The live feed is not connected, so probe output cannot stream until the socket comes up."}
          </p>
        ) : (
          events.map((e, i) => <AgentLine key={`${e.timestamp}-${i}`} event={e} />)
        )}
      </div>
    </div>
  );
}

function AgentLine({ event }: { event: ProbeProgressData }) {
  const time = <span className="shrink-0 text-text-muted/50">[{fmt(event.timestamp)}]</span>;

  if (event.step === "ai-input") {
    const who = event.aiSource === "groq" ? "Groq model" : "Groq agent";
    return (
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {time}
        <span className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/15 px-2 py-0.5 font-semibold text-accent">
          <Cpu size={11} weight="bold" className="animate-pulse" />
          {who} typed <code className="rounded bg-black/40 px-1 text-white">{event.aiInput || "ENTER"}</code>
        </span>
        {event.aiReason && <span className="text-text-muted">{event.aiReason}</span>}
      </div>
    );
  }

  if (event.step === "ai-watching") {
    return (
      <p className="mb-1 flex items-center gap-2 text-info">
        {time}
        <Cpu size={11} className="animate-pulse" />
        <span>{event.aiReason || "Groq is reading the prompt…"}</span>
      </p>
    );
  }

  if (event.step === "ai-hold") {
    return (
      <p className="mb-1 flex flex-wrap items-baseline gap-2 text-warning">
        {time}
        <span className="font-semibold">Held</span>
        <span>{event.aiReason || "Prompt left for an operator"}</span>
      </p>
    );
  }

  if (event.step === "exec" && event.cmd) {
    return (
      <p className="mb-0.5 flex flex-wrap items-baseline gap-x-2">
        {time}
        <span className="text-accent">$</span>
        <span className="font-semibold text-text">{event.cmd}</span>
      </p>
    );
  }

  if ((event.step === "chunk" || event.step === "output" || event.step === "error") && event.out) {
    return (
      <pre
        className={`mb-1.5 whitespace-pre-wrap border-l border-white/10 pl-3 ${
          event.step === "error" || (event.code != null && event.code !== 0) ? "text-danger" : "text-text-muted"
        }`}
      >
        {stripAnsi(event.out)}
        {event.step === "output" && event.code != null && event.code !== 0 ? ` [exit ${event.code}]` : ""}
      </pre>
    );
  }

  const note =
    event.step === "connecting"
      ? "Opening SSH…"
      : event.step === "connected"
        ? "SSH session open. Groq is watching for prompts."
        : event.step === "complete"
          ? "Finished."
          : event.step === "docker-detected"
            ? `Docker: ${event.out ?? "detected"}`
            : event.step === "docker-ps"
              ? "Listing containers…"
              : event.step === "docker-ps-done"
                ? event.out ?? "Containers listed"
                : event.out
                  ? `${event.step}: ${event.out}`
                  : event.step;

  return (
    <p className={`mb-1 ${event.step === "error" ? "text-danger" : "text-text-muted"}`}>
      {time} <span className="uppercase tracking-wider text-info/80">[{event.step}]</span> {note}
    </p>
  );
}
