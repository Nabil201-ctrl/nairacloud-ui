"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Logo } from "./logo";
import { cn } from "@nairacloud/ui";

interface AuthLayoutProps {
  children: ReactNode;
  headline: string;
  subtext: string;
  formSide?: "left" | "right";
  visualTagline?: string;
}

export function AuthLayout({
  children,
  headline,
  subtext,
  formSide = "left",
  visualTagline = "Your cloud.",
}: AuthLayoutProps) {
  const isFormLeft = formSide === "left";

  return (
    <div className="relative min-h-[100dvh] w-full bg-bg text-text page-fade flex flex-col md:flex-row overflow-x-hidden">
      {/* FORM PANEL (~45% on desktop, full width on mobile) */}
      <div
        className={cn(
          "relative z-10 flex min-h-[100dvh] w-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 md:w-[48%] lg:w-[44%] xl:w-[42%] 2xl:w-[40%]",
          isFormLeft ? "md:order-1" : "md:order-2",
        )}
      >
        <header className="flex items-center justify-start">
          <Logo />
        </header>

        <main className="mx-auto my-auto w-full max-w-[380px] sm:max-w-[400px] py-8">
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-medium tracking-[-0.02em] text-text sm:text-[24px]">
              {headline}
            </h1>
            <p className="text-[13px] text-text-muted leading-relaxed">
              {subtext}
            </p>
          </div>

          <div className="mt-7">{children}</div>
        </main>

        <footer className="pt-4 text-center md:text-left">
          <p className="font-mono text-[11px] text-text-muted tracking-tight">
            Naira billing &middot; Paystack secured &middot; SSH-key auth
          </p>
        </footer>
      </div>

      {/* HERO VISUAL PANEL (~55% on desktop, hidden on mobile <768px) */}
      <div
        className={cn(
          "relative hidden md:flex min-h-[100dvh] flex-1 overflow-hidden select-none",
          isFormLeft ? "md:order-2" : "md:order-1",
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0">
          <Image
            src="/authside.png"
            alt=""
            fill
            priority
            quality={90}
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-center"
          />
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[1]",
            isFormLeft
              ? "bg-gradient-to-r from-bg via-bg/40 to-transparent"
              : "bg-gradient-to-l from-bg via-bg/40 to-transparent",
          )}
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/60 via-transparent to-bg/80" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />

        <div className="relative z-[2] flex h-full w-full flex-col justify-between p-10 lg:p-14">
          <div className="relative h-full w-full">
            <div
              className={cn(
                "absolute rounded-sm border border-border bg-card/90 px-3.5 py-2.5",
                "text-[12px] font-mono tracking-tight text-text/90",
                isFormLeft ? "top-[18%] left-[8%] lg:left-[12%]" : "top-[18%] right-[8%] lg:right-[12%]",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-accent">
                  RUNNING
                </span>
                <span className="text-text-muted">&middot;</span>
                <span className="text-text-secondary">2 vCPU &middot; 4GB RAM</span>
              </div>
            </div>

            <div
              className={cn(
                "absolute rounded-sm border border-border bg-card/90 px-3.5 py-2",
                "text-[12px] font-mono text-text-secondary",
                isFormLeft ? "top-[48%] right-[10%] lg:right-[14%]" : "top-[48%] left-[10%] lg:left-[14%]",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-text-muted">
                  LOS-1
                </span>
                <span className="text-text-muted">&middot;</span>
                <span className="tracking-wide">IP 105.112.4.xx</span>
              </div>
            </div>

            <div
              className={cn(
                "absolute rounded-sm border border-border bg-card/90 px-3.5 py-2",
                "text-[12px] font-mono text-text-secondary",
                isFormLeft ? "bottom-[22%] left-[12%] lg:left-[16%]" : "bottom-[22%] right-[12%] lg:right-[16%]",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-accent">&uarr;</span>
                <span>Provisioned in 42s</span>
              </div>
            </div>
          </div>

          <div className="font-mono text-[12px] text-text-muted tracking-tight">
            {visualTagline}
          </div>
        </div>
      </div>
    </div>
  );
}
