"use client";

import { passwordScore } from "@/lib/validation";
import { Check, X } from "@phosphor-icons/react";

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = [
  "bg-danger",
  "bg-warning",
  "bg-warning",
  "bg-accent",
  "bg-accent",
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordScore(value);
  const hasLength = value.length >= 8;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  return (
    <div aria-live="polite" className="space-y-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-sm bg-border-subtle"
          >
            <div
              className={`h-full rounded-sm transition-all duration-300 ease-out ${
                i < score ? COLORS[score] : ""
              }`}
              style={{ width: i < score ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {[
            { ok: hasLength, label: "8+" },
            { ok: hasLetter, label: "Aa" },
            { ok: hasNumber, label: "123" },
            { ok: hasSymbol, label: "!@#" },
          ].map((r) => (
            <span
              key={r.label}
              className={`flex items-center gap-0.5 text-[11px] font-mono transition-colors ${
                r.ok ? "text-text-secondary" : "text-text-disabled"
              }`}
            >
              {r.ok ? <Check size={10} weight="bold" /> : <X size={10} />}
              {r.label}
            </span>
          ))}
        </div>
        <span
          className={`text-[11px] font-medium uppercase tracking-wider ${
            score >= 3 ? "text-text-secondary" : "text-text-muted"
          }`}
        >
          {LABELS[score]}
        </span>
      </div>
    </div>
  );
}
