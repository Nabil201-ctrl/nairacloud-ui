import type { CSSProperties } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CopyField, StatusDot } from "@nairacloud/ui";

const STEPS = [
  { content: "Payment verified · Paystack", delay: 0.9 },
  { content: "Server assigned · SRV-LAG-02", delay: 1.5 },
  { content: "Instance booting · Ubuntu 24.04", delay: 2.1 },
];

const delay = (s: number) => ({ animationDelay: `${s}s` }) as CSSProperties;

/** Hero product shot: a framed deploy session. CSS-only staggered entry (static under reduced motion). */
export function AnimatedTerminal() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/70 p-1.5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3" aria-hidden>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
          </div>
          <span className="font-mono text-[11px] text-text-muted">deploy — nairacloud</span>
          <span className="w-10" />
        </div>

        <div className="space-y-3.5 px-5 py-6 font-mono text-[13px] leading-relaxed sm:px-6">
          <p className="nc-in flex items-center gap-3">
            <span className="text-accent">$</span>
            <span className="text-text">nairacloud deploy --plan starter</span>
          </p>
          {STEPS.map((s) => (
            <p key={s.content} className="nc-in flex items-center gap-2.5 pl-5 text-text-secondary" style={delay(s.delay)}>
              <CheckCircle weight="fill" className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              {s.content}
            </p>
          ))}
          <div className="nc-in pl-5 pt-1" style={delay(2.9)}>
            <CopyField value="ssh root@197.210.29.4" label="SSH string" />
          </div>
          <p className="nc-in flex items-center gap-2 pl-5 text-text" style={delay(3.5)}>
            Ready in 42s
            <span aria-hidden className="cursor-blink inline-block h-3.5 w-1.5 bg-accent" />
          </p>
        </div>

        <div className="nc-in flex items-center justify-between border-t border-border-subtle bg-card/60 px-5 py-3 sm:px-6" style={delay(3.5)}>
          <StatusDot status="RUNNING" />
          <span className="font-mono text-[11px] text-text-muted">SRV-LAG-02 · Ubuntu 24.04</span>
        </div>
      </div>
    </div>
  );
}
