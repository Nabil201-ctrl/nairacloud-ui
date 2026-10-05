import Image from "next/image";
import { WaitlistForm } from "@/components/waitlist-form";
import { HeroBackground } from "@/components/hero-background";
import { Analytics } from "@vercel/analytics/react";

export const revalidate = 60;

const FEATURES = [
  {
    title: "Priced in naira",
    body: "What you see is what you pay. No dollar card, no FX surprises.",
  },
  {
    title: "Paystack checkout",
    body: "Cards and bank transfers through the flow Nigerians already trust.",
  },
  {
    title: "Online in minutes",
    body: "Pick a plan, pay, get an IP. SSH keys authorized from day one.",
  },
] as const;

const STEPS = [
  { n: "01", label: "Join the list", body: "Drop your email. Takes ten seconds." },
  { n: "02", label: "Get early access", body: "We open seats in waves as capacity grows." },
  { n: "03", label: "Deploy your first box", body: "Pay in naira, SSH in, ship." },
] as const;

const FAQ = [
  {
    q: "When does early access open?",
    a: "We're opening in waves. Join the list and you'll get an email as soon as your seat is ready.",
  },
  {
    q: "How do I pay?",
    a: "Checkout runs on Paystack — local cards and bank transfers, priced in naira.",
  },
  {
    q: "Is this the same as the product waitlist?",
    a: "This is the launch waitlist for early access. Once you're in, you create instances from the dashboard like any other customer.",
  },
  {
    q: "Will you spam me?",
    a: "No. One email when access opens, plus rare product updates you can leave anytime.",
  },
] as const;

function formatCount(n: number): string {
  if (n <= 0) return "Be among the first";
  if (n < 10) return `${n}+ builders already in`;
  return `${n.toLocaleString()}+ builders already in`;
}

export default function Home() {
  // Frontend-only build: the waitlist counter is a static UI element here.
  // Wire the count to your own endpoint when the backend is ready.
  const count = 0;

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-bg font-sans text-text selection:bg-accent/30 selection:text-text">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-12 max-w-7xl items-center justify-between rounded-xl border border-border/50 bg-bg/70 px-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:px-4"
        >
          <Image
            src="/logo.png"
            alt="NairaCloud"
            width={160}
            height={36}
            priority
            className="h-7 w-auto object-contain object-left"
          />
          <a
            href="#join"
            className="press inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-bold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-fg/70" />
            Join waitlist
          </a>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36 lg:pt-40">
          <HeroBackground />
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="text-center md:text-center lg:text-left">
              <h1 className="mt-2 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.065em] text-text sm:text-6xl md:text-7xl lg:text-[5rem]">
                Serious cloud.
                <br />
                <span className="bg-gradient-to-r from-accent via-text to-text-muted bg-clip-text text-transparent">
                  No dollar drama.
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg lg:mx-0">
                High-performance compute priced in naira. Join the waitlist for early access.
              </p>
            </div>

            <div id="join" className="mx-auto w-full max-w-xl scroll-mt-28 lg:mx-0">
              <div className="rounded-xl border border-border/60 bg-surface/40 p-5 shadow-xl backdrop-blur-sm sm:p-7">
                <div className="mb-5">
                  <h2 className="text-lg font-bold tracking-tight text-text">Request early access</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {count > 0 ? formatCount(count) : "Be among the first builders in."}
                  </p>
                </div>
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[150px]" />
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-text sm:text-4xl">
              Engineered for experience.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
              Everything you expect from serious cloud, localized for Nigerian builders.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-surface/40 p-8 transition-colors hover:border-border/80"
              >
                <h3 className="text-xl font-bold text-text">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-text-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border/40 bg-surface/10 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tighter text-text sm:text-4xl">
                From waitlist to SSH in three steps
              </h2>
            </div>
            <ol className="grid gap-6 sm:grid-cols-3">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="rounded-xl border border-border/60 bg-surface/40 p-6 sm:p-8"
                >
                  <span className="font-mono text-sm text-accent">{step.n}</span>
                  <h3 className="mt-4 text-lg font-bold text-text">{step.label}</h3>
                  <p className="mt-2 leading-relaxed text-text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg px-6 py-10 sm:px-10 sm:py-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Built for builders
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                  Your next VPS should feel local — in currency, latency, and support.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
                  NairaCloud is cloud infrastructure for Nigerian teams: transparent billing,
                  Paystack payments, and engineers who answer tickets in your timezone.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-surface/40 p-4 font-mono text-xs leading-6 text-text-muted shadow-xl">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  <span className="h-2 w-2 rounded-full bg-danger/80" />
                  <span className="h-2 w-2 rounded-full bg-warning/80" />
                  <span className="h-2 w-2 rounded-full bg-accent/80" />
                  <span className="ml-2">ssh session</span>
                </div>
                <p>
                  <span className="text-accent">$</span> ssh root@nairacloud-box
                </p>
                <p className="text-text-muted"># authenticated · key already authorized</p>
                <p>
                  <span className="text-accent">$</span> uptime
                </p>
                <p>14:02:11 up 2 min, 1 user, load 0.08</p>
                <p>
                  <span className="text-accent">$</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-10">
          <div className="mb-10 text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tighter text-text">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/60 bg-surface/40 px-5 py-4 open:bg-surface/70"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-text marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="font-mono text-accent transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Ready when Nigeria is.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-text-muted sm:text-base">
                Grab a seat before the next wave opens.
              </p>
              <a
                href="#join"
                className="press mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Request early access
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-surface/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 font-mono text-[11px] text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} NairaCloud. All rights reserved.</p>
          <span className="uppercase tracking-[0.12em]">Your cloud. Built for Nigeria.</span>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
