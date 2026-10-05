"use client";

import { useRef } from "react";
import { cn } from "@nairacloud/ui";

/** 6-digit OTP with auto-advance, arrow keys, and clipboard paste. */
export function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function set(i: number, ch: string): void {
    if (!/^\d?$/.test(ch)) return;
    const next = value.padEnd(6, " ").split("").slice(0, 6);
    next[i] = ch || " ";
    onChange(next.join("").trim());
    if (ch && i < 5) refs.current[i + 1]?.focus();
  }

  function onKey(i: number, key: string): void {
    if (key === "Backspace" && !value[i] && i > 0)
      refs.current[i - 1]?.focus();
    else if (key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  return (
    <div
      className="flex justify-between gap-2"
      role="group"
      aria-label="6-digit verification code"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const filled = Boolean(value[i] && value[i] !== " ");
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            className={cn(
              "h-11 w-full max-w-[48px] rounded-sm border bg-surface text-center font-mono text-[15px] font-medium text-text transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent/30",
              filled
                ? "border-border-hover"
                : "border-border hover:border-border-hover focus:border-border-hover",
            )}
            maxLength={1}
            value={value[i] && value[i] !== " " ? value[i] : ""}
            onChange={(e) =>
              set(i, e.target.value.replace(/\D/g, "").slice(-1))
            }
            onKeyDown={(e) => onKey(i, e.key)}
            onPaste={onPaste}
          />
        );
      })}
    </div>
  );
}
