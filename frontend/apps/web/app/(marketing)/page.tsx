import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Browser,
  ChartLineUp,
  CheckCircle,
  CreditCard,
  CurrencyNgn,
  Key,
  Lifebuoy,
  Receipt,
  RocketLaunch,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { Button, PriceTag, cn } from "@nairacloud/ui";
import { AnimatedCounter } from "@/components/animated-counter";
import { Faq } from "@/components/faq";
import { HeroBackground } from "@/components/hero-background";
import { CodeTabs } from "@/components/marketing/code-tabs";
import { CtaOrbit } from "@/components/marketing/cta-orbit";
import { DeployPipeline } from "@/components/marketing/deploy-pipeline";
import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import {
  CheckoutVisual,
  GraceVisual,
  NairaInvoiceVisual,
  ProvisionVisual,
  SupportVisual,
  TerminalVisual,
} from "@/components/marketing/feature-visuals";
import { HeroConsole } from "@/components/marketing/hero-console";
import { InstanceShowcase } from "@/components/marketing/instance-showcase";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { NairaCompare } from "@/components/marketing/naira-compare";
import { Container, SectionHeading } from "@/components/marketing/primitives";
import {
  PricingCard,
  isFeaturedPlan,
} from "@/components/marketing/pricing-card";
import { getPlans, getPublicStats, type Plan } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "NairaCloud — Your cloud.",
  description:
    "Linux servers priced in naira and paid with Paystack. Deploy and SSH in minutes — no dollar card, no conversion fees.",
  alternates: { canonical: "/" },
};

const FEATURES: {
  icon: typeof CurrencyNgn;
  title: string;
  body: string;
  visual: ReactNode;
  span: string;
}[] = [
  {
    icon: CurrencyNgn,
    title: "Priced in naira",
    body: "No dollar card, no conversion games. What you see is what you pay.",
    visual: <NairaInvoiceVisual />,
    span: "lg:col-span-4",
  },
  {
    icon: CreditCard,
    title: "Paystack checkout",
    body: "Cards and bank transfers through a familiar, secure flow.",
    visual: <CheckoutVisual />,
    span: "lg:col-span-2",
  },
  {
    icon: RocketLaunch,
    title: "Online in minutes",
    body: "Pick a plan, pay, and get an IP. Provisioning runs itself.",
    visual: <ProvisionVisual />,
    span: "lg:col-span-2",
  },
  {
    icon: TerminalWindow,
    title: "Developer-first",
    body: "SSH keys, API tokens, and per-instance usage charts that keep you in control.",
    visual: <TerminalVisual />,
    span: "lg:col-span-4",
  },
  {
    icon: Receipt,
    title: "Transparent billing",
    body: "Every kobo itemized. Grace warnings before anything is suspended.",
    visual: <GraceVisual />,
    span: "lg:col-span-3",
  },
  {
    icon: Lifebuoy,
    title: "Real support",
    body: "Engineers in your timezone. Tickets answered by people who run the servers.",
    visual: <SupportVisual />,
    span: "lg:col-span-3",
  },
];

const TRUST = [
  "Ubuntu 22.04",
  "Ubuntu 24.04",
  "Debian 12",
  "Paystack checkout",
  "OpenSSH",
  "NVMe storage",
  "Naira invoices",
];

const DASHBOARD_POINTS = [
  {
    icon: ChartLineUp,
    title: "Live metrics",
    body: "CPU, memory, disk and network per instance.",
  },
  {
    icon: Browser,
    title: "Web console",
    body: "A terminal in the browser when you're away from your laptop.",
  },
  {
    icon: Key,
    title: "SSH & API keys",
    body: "Manage access without touching the server.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    body: "Every charge in naira, downloadable any time.",
  },
];

const DEV_POINTS = [
  "Root access on Ubuntu or Debian",
  "Your SSH key is authorized when the server boots",
  "API keys (nc_live_…) for scripts and CI",
  "A stable SSH port that survives rebuilds",
];

function cheapestPaid(plans: Plan[]): Plan | null {
  const paid = plans
    .filter((p) => p.status === "ACTIVE" && p.priceNgn > 0)
    .sort((a, b) => a.priceNgn - b.priceNgn);
  return paid[0] ?? null;
}

function Band({
  children,
  tone = "base",
  className,
}: {
  children: ReactNode;
  tone?: "base" | "deep";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative py-24 md:py-32",
        tone === "deep" && "border-y border-border bg-sidebar",
        className,
      )}
    >
      {children}
    </section>
  );
}

export default async function Home() {
  const [stats, plans] = await Promise.all([getPublicStats(), getPlans()]);
  const from = plans ? cheapestPaid(plans) : null;
  const hasFree = Boolean(
    plans?.some((p) => p.status === "ACTIVE" && p.priceNgn === 0),
  );

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative isolate">
        <HeroBackground />
        <Container className="grid items-center gap-16 pb-24 pt-14 sm:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:pb-32 lg:pt-24">
          <div>
            <FadeIn>
              <a
                href={WAITLIST_URL}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-main/80 py-1 pl-1.5 pr-3 text-[13px] text-text-secondary  transition-colors hover:border-border-hover hover:text-text"
              >
                <span className="rounded-full bg-nav-active px-2 py-0.5 text-[11px] font-medium text-accent">
                  New
                </span>
                Now taking waitlist signups
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="mt-7 text-[3rem] font-semibold leading-[0.98] tracking-[-0.045em] text-text sm:text-7xl ">
                Serious cloud.
                <br />
                <span className="text-accent">No dollar drama.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="mt-7 max-w-[36rem] text-lg leading-relaxed text-text-secondary">
                Linux servers with root SSH, priced in naira and paid through
                Paystack. Choose a plan, pay, and SSH in minutes later — no
                dollar card, no conversion fees.
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="group  rounded-full px-7 text-[15px]  shadow-text/30"
                >
                  <a href={WAITLIST_URL}>
                    Join the waitlist
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-card rounded-full bg-main/60 px-7 text-[15px]"
                >
                  <a href="/pricing">See pricing</a>
                </Button>
              </div>
            </FadeIn>

            {from && (
              <FadeIn delay={0.32}>
                <p className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-text-muted">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                    />
                    Instances from{" "}
                    <PriceTag amount={from.priceNgn} className="text-text" />
                    /month
                  </span>
                  {hasFree && <span>· Free plan available</span>}
                </p>
              </FadeIn>
            )}
          </div>

          <HeroConsole />
        </Container>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section
        aria-label="Supported images and payments"
        className="border-y border-border bg-sidebar py-6"
      >
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="marquee flex w-max gap-12 pr-12">
            {[...TRUST, ...TRUST].map((t, i) => (
              <li
                key={i}
                aria-hidden={i >= TRUST.length}
                className="flex shrink-0 items-center gap-2.5 font-mono text-[13px] text-text-muted"
              >
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-text-disabled"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Live stats (real data only) ────────────────────────────────── */}
      {stats && (
        <section aria-label="Live platform metrics" className="pt-24 md:pt-32">
          <Container>
            <FadeIn>
              <div className="elev-panel grid grid-cols-1 overflow-hidden rounded-3xl sm:grid-cols-3">
                {[
                  { v: stats.activeInstances, l: "Active instances" },
                  { v: stats.customers, l: "Developers" },
                  { v: stats.onlineNodes, l: "Nodes online" },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className={cn(
                      "px-8 py-10",
                      i > 0 &&
                        "border-t border-border sm:border-l sm:border-t-0",
                    )}
                  >
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                      {i === 0 && (
                        <span
                          className="dot-live h-1.5 w-1.5 rounded-full bg-accent"
                          aria-hidden
                        />
                      )}
                      {s.l}
                    </p>
                    <p className="mt-4 font-mono text-5xl font-medium tracking-tight text-text">
                      <AnimatedCounter value={s.v} direction="up" />
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </Container>
        </section>
      )}

      {/* ── How it works ───────────────────────────────────────────────── */}
      <Band>
        <Container>
          <FadeIn>
            <SectionHeading
              eyebrow="How it works"
              title="From checkout to SSH in one flow."
              description="Every step is automated, and you can watch each one happen in your dashboard."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="mt-14">
            <DeployPipeline />
          </FadeIn>
        </Container>
      </Band>

      {/* ── Features bento ─────────────────────────────────────────────── */}
      <Band tone="deep">
        <Container>
          <FadeIn>
            <SectionHeading
              eyebrow="Why NairaCloud"
              title="Cloud that fits how you pay and how you build."
              description="Everything you expect from a global cloud provider — without the dollar card, the FX markup, or a support queue in another timezone."
            />
          </FadeIn>
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={(i % 2) * 0.08} className={f.span}>
                <article className="elev-panel group flex h-full flex-col rounded-3xl p-2.5 transition-colors hover:border-border-hover">
                  {f.visual}
                  <div className="flex items-start gap-4 p-5 pt-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                      <f.icon size={20} weight="duotone" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-lg font-medium tracking-tight text-text">
                        {f.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-text-muted">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Band>

      {/* ── Dashboard showcase ─────────────────────────────────────────── */}
      <Band>
        <Container>
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="Dashboard"
              title="Your server, at a glance."
              description="Live usage, a browser console, and one-click restart or rebuild — without opening a ticket."
            />
          </FadeIn>
          <div className="mt-16">
            <InstanceShowcase />
          </div>
          <Stagger className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {DASHBOARD_POINTS.map((p) => (
              <StaggerItem
                key={p.title}
                className="border-l border-border pl-5"
              >
                <p.icon
                  className="h-5 w-5 text-accent"
                  weight="duotone"
                  aria-hidden
                />
                <h3 className="mt-4 font-medium text-text">{p.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-text-muted">
                  {p.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Band>

      {/* ── Naira vs dollar ────────────────────────────────────────────── */}
      <Band tone="deep">
        <Container>
          <FadeIn>
            <SectionHeading
              eyebrow="Billing"
              title="Stop paying in dollars for servers you use in naira."
              description="A dollar-billed cloud charges you twice: once for the server, and again for the exchange rate."
            />
          </FadeIn>
          <div className="mt-14">
            <NairaCompare />
          </div>
        </Container>
      </Band>

      {/* ── Pricing teaser ─────────────────────────────────────────────── */}
      {plans && plans.length > 0 && (
        <Band>
          <Container>
            <FadeIn>
              <SectionHeading
                eyebrow="Pricing"
                title="Transparent compute."
                description="Flat monthly prices in naira. The number on the card is the number on your invoice."
                action={
                  <Button
                    asChild
                    variant="outline"
                    className="group h-10 rounded-full bg-main/60 px-5"
                  >
                    <a href="/pricing">
                      Compare all plans{" "}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </Button>
                }
              />
            </FadeIn>
            <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.slice(0, 4).map((p) => (
                <StaggerItem key={p.id}>
                  <PricingCard plan={p} featured={isFeaturedPlan(p)} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Band>
      )}

      {/* ── Developers ─────────────────────────────────────────────────── */}
      <Band tone="deep">
        <Container className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <FadeIn>
              <SectionHeading
                eyebrow="For developers"
                title="Built for people who live in a terminal."
                description="Root SSH from minute one, a REST API with your own keys, and nothing between you and your box."
              />
            </FadeIn>
            <Stagger className="mt-10 space-y-4">
              {DEV_POINTS.map((p) => (
                <StaggerItem
                  key={p}
                  className="flex items-start gap-3 text-[15px] text-text-secondary"
                >
                  <CheckCircle
                    weight="fill"
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    aria-hidden
                  />
                  {p}
                </StaggerItem>
              ))}
            </Stagger>
            <FadeIn delay={0.2}>
              <Button
                asChild
                variant="outline"
                className="group mt-10 h-10 rounded-full bg-main/60 px-5"
              >
                <a href="/docs">
                  Read the docs{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <CodeTabs />
          </FadeIn>
        </Container>
      </Band>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Band>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered"
              description="The short version of how NairaCloud works today."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Faq items={FAQ_ITEMS.slice(0, 4)} />
          </FadeIn>
        </Container>
      </Band>

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <section className="pb-24 md:pb-32">
        <Container>
          <FadeIn>
            <div className="bg-card relative isolate overflow-hidden rounded-[2rem] px-6 py-24 text-center sm:px-12 md:py-32">
              <CtaOrbit />
              <h2 className="mx-auto max-w-3xl text-balance text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl md:text-6xl">
                Your next server is one checkout away.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
                Join the waitlist and we&apos;ll invite you as capacity opens.
                Naira billing, fast servers, and an infrastructure team in your
                timezone.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-card w-full rounded-full px-8 text-[15px] sm:w-auto"
                >
                  <a href={WAITLIST_URL}>Join the waitlist</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-card w-full rounded-full bg-main/60 px-8 text-[15px] sm:w-auto"
                >
                  <a href="/docs">Read the docs</a>
                </Button>
              </div>
              <p className="mt-6 text-xs text-text-muted">
                By joining the waitlist you agree to our{" "}
                <a
                  href="/terms"
                  className="text-text-secondary underline-offset-4 hover:text-text hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-text-secondary underline-offset-4 hover:text-text hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
