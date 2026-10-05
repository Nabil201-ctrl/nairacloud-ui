"use client";

import { FormEvent, useState } from "react";

/** Frontend-only build: the form POSTs to this path. Override via
 *  WAITLIST_API_PATH (default /api/waitlist) when wiring your own backend. */
const API_PATH = process.env.NEXT_PUBLIC_WAITLIST_API_PATH ?? "/api/waitlist";

type Status = "idle" | "loading" | "success" | "error";

type Result = {
  ok: boolean;
  alreadyJoined?: boolean;
  position?: number;
  message?: string;
  error?: string;
};

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          company: company || undefined,
        }),
      });
      const data = (await res.json()) as Result;
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setAlreadyJoined(Boolean(data.alreadyJoined));
      setPosition(data.position ?? null);
      setMessage(data.message ?? "You're on the list.");
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 text-left sm:p-7">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-fg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M4.5 10.5l3.5 3.5 7.5-8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-text">
          {alreadyJoined ? "Welcome back." : "You're in."}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {message} We&apos;ll email you when early access opens
          {position ? (
            <>
              {" "}
              — you&apos;re{" "}
              <span className="font-mono text-accent">#{position}</span> on the list.
            </>
          ) : (
            "."
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Honeypot — hidden from users */}
      <label className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Company
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
        <label className="block">
          <span className="sr-only">Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border/70 bg-surface/70 px-4 py-3.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-border-hover focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border/70 bg-surface/70 px-4 py-3.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-border-hover focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="press group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent px-5 py-3.5 text-base font-bold text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-fg/20 border-t-accent-fg" />
            Joining…
          </span>
        ) : (
          <>
            Request early access
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>

      {status === "error" && message ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : (
        <p className="text-center text-xs text-text-muted sm:text-left">
          No spam. We&apos;ll only write when access opens.
        </p>
      )}
    </form>
  );
}