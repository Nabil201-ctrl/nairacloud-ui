import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Browser,
  CaretRight,
  ChartLineUp,
  CheckCircle,
  CreditCard,
  CurrencyNgn,
  Key,
  Lifebuoy,
  LinuxLogo,
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
import { CheckoutVisual, GraceVisual, NairaInvoiceVisual, ProvisionVisual, SupportVisual, TerminalVisual } from "@/components/marketing/feature-visuals";
import { HeroConsole } from "@/components/marketing/hero-console";
import { InstanceShowcase } from "@/components/marketing/instance-showcase";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { NairaCompare } from "@/components/marketing/naira-compare";
import { FrameSection, SectionHeading, SectionLabel } from "@/components/marketing/primitives";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { getPlans, getPublicStats, type Plan } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "NairaCloud — Your cloud.",
  description: "Linux servers priced in naira and paid with Paystack. Deploy and SSH in minutes — no dollar card, no conversion fees.",
  alternates: { canonical: "/" },
};

type Feature = { icon: typeof CurrencyNgn; tag: string; title: string; body: string; visual: ReactNode; link?: { href: string; label: string } };

const FEATURES: Feature[] = [
  { icon: CurrencyNgn, tag: "Naira billing", title: "Priced in naira", body: "No dollar card, no conversion games. What you see is what you pay.", visual: <NairaInvoiceVisual />, link: { href: "/pricing", label: "See pricing" } },
  { icon: CreditCard, tag: "Paystack", title: "Paystack checkout", body: "Cards and bank transfers through a familiar, secure flow.", visual: <CheckoutVisual /> },
  { icon: RocketLaunch, tag: "Provisioning", title: "Online in minutes", body: "Pick a plan, pay, and get an IP. Provisioning runs itself.", visual: <ProvisionVisual />, link: { href: "/first-vps", label: "Your first VPS" } },
  { icon: TerminalWindow, tag: "Developer tools", title: "Developer-first", body: "SSH keys, API tokens, and per-instance usage charts that keep you in control.", visual: <TerminalVisual />, link: { href: "/docs", label: "Read the docs" } },
  { icon: Receipt, tag: "Billing", title: "Transparent billing", body: "Every kobo itemized. Grace warnings before anything is suspended.", visual: <GraceVisual /> },
  { icon: Lifebuoy, tag: "Support", title: "Real support", body: "Engineers in your timezone. Tickets answered by people who run the servers.", visual: <SupportVisual /> },
];

const TRUST = [
  { icon: LinuxLogo, label: "Ubuntu 22.04" },
  { icon: LinuxLogo, label: "Ubuntu 24.04" },
  { icon: LinuxLogo, label: "Debian 12" },
  { icon: CreditCard, label: "Paystack" },
];

const DASHBOARD_POINTS = [
  { icon: ChartLineUp, title: "Live metrics", body: "CPU, memory, disk and network for every instance." },
  { icon: Browser, title: "Web console", body: "A terminal in the browser when you're away from your laptop." },
  { icon: Key, title: "SSH & API keys", body: "Manage access without touching the server." },
  { icon: Receipt, title: "Invoices", body: "Every charge in naira, ready whenever you need it." },
];

const DEV_POINTS = [
  "Root access on Ubuntu or Debian",
  "Your SSH key is authorized when the server boots",
  "API keys (nc_live_…) for scripts and CI",
  "A stable SSH port that survives rebuilds",
];

function cheapestPaid(plans: Plan[]): Plan | null {
  const paid = plans.filter((p) => p.status === "ACTIVE" && p.priceNgn > 0).sort((a, b) => a.priceNgn - b.priceNgn);
  return paid[0] ?? null;
}

const PAD = "px-5 sm:px-10 lg:px-14";

export default async function Home() {
  const [stats, plans] = await Promise.all([getPublicStats(), getPlans()]);
  const from = plans ? cheapestPaid(plans) : null;
  const hasFree = Boolean(plans?.some((p) => p.status === "ACTIVE" && p.priceNgn === 0));
  const showPricing = Boolean(plans && plans.length > 0);

  // Section numbers follow what actually renders.
  const order = ["how", "platform", "dashboard", "billing", ...(showPricing ? ["pricing"] : []), "developers", "faq"];
  const label = (key: string, text: string) => (
    <SectionLabel n={order.indexOf(key) + 1} total={order.length}>
      {text}
    </SectionLabel>
  );

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <FrameSection innerClassName="relative isolate overflow-hidden pb-20 pt-16 sm:pt-24 md:pb-24">
        <HeroBackground />
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <FadeIn>
            <a
              href={WAITLIST_URL}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-main py-1 pl-1.5 pr-3 text-[13px] text-text-secondary transition-colors hover:border-border-hover hover:text-text"
            >
              <span className="rounded-full bg-nav-active px-2 py-0.5 text-[11px] font-medium text-accent">New</span>
              Now taking waitlist signups
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-8 text-5xl font-semibold leading-[1] tracking-[-0.03em] text-text sm:text-7xl lg:text-[5.25rem]">
              Serious cloud.
              <br />
              <span className="text-accent">No dollar drama.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto mt-7 max-w-[38rem] text-lg leading-relaxed text-text-secondary">
              Linux servers with root SSH, priced in naira and paid through Paystack. Choose a plan, pay, and SSH in minutes later — no dollar card, no conversion fees.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <a href={WAITLIST_URL}>
                  Join the waitlist
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/pricing">See pricing</a>
              </Button>
            </div>
          </FadeIn>

          {from && (
            <FadeIn delay={0.32}>
              <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[13px] text-text-muted">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Instances from <PriceTag amount={from.priceNgn} className="text-text" />
                  /month
                </span>
                {hasFree && <span>· Free plan available</span>}
              </p>
            </FadeIn>
          )}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-left">
          <HeroConsole />
        </div>
      </FrameSection>

      {/* ── Trust cells ────────────────────────────────────────────────── */}
      <FrameSection innerClassName="p-0 sm:p-0 lg:p-0 md:py-0">
        <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6" aria-label="Supported images and payments">
          <li className={cn("col-span-2 flex items-center bg-bg py-7 text-[15px] leading-snug text-text-secondary sm:col-span-3 lg:col-span-2", PAD)}>
            <span>
              Runs the images you know. <span className="text-accent">Paid the way you already pay.</span>
            </span>
          </li>
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center justify-center gap-2.5 bg-bg py-7 font-mono text-[13px] text-text-secondary">
              <t.icon className="h-5 w-5 text-text-muted" aria-hidden />
              {t.label}
            </li>
          ))}
        </ul>
      </FrameSection>

      {/* ── Live stats (real data only) ────────────────────────────────── */}
      {stats && (
        <FrameSection innerClassName="p-0 sm:p-0 lg:p-0 md:py-0">
          <dl className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
            {[
              { v: stats.activeInstances, l: "Active instances" },
              { v: stats.customers, l: "Developers" },
              { v: stats.onlineNodes, l: "Nodes online" },
            ].map((s, i) => (
              <div key={s.l} className={cn("flex flex-col gap-3 bg-card py-10", PAD)}>
                <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  {i === 0 && <span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                  {s.l}
                </dt>
                <dd className="font-mono text-5xl font-medium tracking-tight text-text">
                  <AnimatedCounter value={s.v} direction="up" />
                </dd>
              </div>
            ))}
          </dl>
        </FrameSection>
      )}

      {/* ── 01 How it works ────────────────────────────────────────────── */}
      <FrameSection label={label("how", "How it works")}>
        <FadeIn>
          <SectionHeading title="From checkout to SSH in one flow." description="Every step is automated, and you can watch each one happen in your dashboard." />
        </FadeIn>
        <FadeIn delay={0.1} className="mt-14">
          <DeployPipeline />
        </FadeIn>
      </FrameSection>

      {/* ── 02 Platform ────────────────────────────────────────────────── */}
      <FrameSection label={label("platform", "Platform")} innerClassName="p-0 sm:p-0 lg:p-0 md:py-0">
        <div className={cn("py-16 md:py-20", PAD)}>
          <FadeIn>
            <SectionHeading
              title="Cloud that fits how you pay and how you build."
              description="Everything you expect from a global cloud provider — without the dollar card, the FX markup, or a support queue in another timezone."
            />
          </FadeIn>
        </div>
        <Stagger className="grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title} className="flex">
              <article className={cn("flex w-full flex-col bg-card py-8 transition-colors hover:bg-main lg:py-10", PAD)}>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-main px-3 py-1.5 text-[13px] text-text-secondary">
                  <f.icon className="h-4 w-4 text-accent" weight="duotone" aria-hidden />
                  {f.tag}
                </span>
                <h3 className="mt-6 text-xl font-medium tracking-tight text-text">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{f.body}</p>
                {f.link && (
                  <a href={f.link.href} className="mt-4 inline-flex w-fit items-center gap-1 text-sm text-accent hover:underline hover:underline-offset-4">
                    {f.link.label} <CaretRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
                <div className="mt-8 flex flex-1 items-end">
                  <div className="w-full">{f.visual}</div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </FrameSection>

      {/* ── 03 Dashboard ───────────────────────────────────────────────── */}
      <FrameSection label={label("dashboard", "Dashboard")} innerClassName="p-0 sm:p-0 lg:p-0 md:py-0">
        <div className={cn("py-16 md:py-20", PAD)}>
          <FadeIn>
            <SectionHeading title="Your server, at a glance." description="Live usage, a browser console, and one-click restart or rebuild — without opening a ticket." />
          </FadeIn>
        </div>
        <div className="grid border-t border-border lg:grid-cols-[1.55fr_1fr]">
          <div className={cn("bg-sidebar py-10 md:py-14", PAD)}>
            <InstanceShowcase />
          </div>
          <Stagger className="divide-y divide-border border-t border-border lg:border-l lg:border-t-0">
            {DASHBOARD_POINTS.map((p) => (
              <StaggerItem key={p.title} className={cn("py-7", PAD)}>
                <h3 className="flex items-center gap-3 text-lg font-medium text-text">
                  <p.icon className="h-5 w-5 text-accent" weight="duotone" aria-hidden />
                  {p.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{p.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </FrameSection>

      {/* ── 04 Billing ─────────────────────────────────────────────────── */}
      <FrameSection label={label("billing", "Billing")}>
        <FadeIn>
          <SectionHeading
            title="Stop paying in dollars for servers you use in naira."
            description="A dollar-billed cloud charges you twice: once for the server, and again for the exchange rate."
          />
        </FadeIn>
        <div className="mt-14">
          <NairaCompare />
        </div>
      </FrameSection>

      {/* ── 05 Pricing ─────────────────────────────────────────────────── */}
      {showPricing && plans && (
        <FrameSection label={label("pricing", "Pricing")}>
          <FadeIn>
            <SectionHeading
              title="Transparent compute."
              description="Flat monthly prices in naira. The number on the card is the number on your invoice."
              action={
                <Button asChild variant="outline" className="group">
                  <a href="/pricing">
                    Compare all plans <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
              }
            />
          </FadeIn>
          <FadeIn delay={0.1} className="mt-14">
            <PricingGrid plans={plans.slice(0, 4)} />
          </FadeIn>
        </FrameSection>
      )}

      {/* ── 06 Developers ──────────────────────────────────────────────── */}
      <FrameSection label={label("developers", "For developers")}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <FadeIn>
            <SectionHeading title="Built for people who live in a terminal." description="Root SSH from minute one, a REST API with your own keys, and nothing between you and your box." />
          </FadeIn>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {DEV_POINTS.map((p) => (
              <StaggerItem key={p} className="flex items-start gap-3 text-[15px] text-text-secondary">
                <CheckCircle weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                {p}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <FadeIn delay={0.1} className="mt-14">
          <CodeTabs />
        </FadeIn>
      </FrameSection>

      {/* ── 07 FAQ ─────────────────────────────────────────────────────── */}
      <FrameSection label={label("faq", "FAQ")}>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading title="Questions, answered" description="The short version of how NairaCloud works today." />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Faq items={FAQ_ITEMS.slice(0, 4)} />
          </FadeIn>
        </div>
      </FrameSection>

      {/* ── Closing CTA ────────────────────────────────────────────────── */}
      <FrameSection innerClassName="relative isolate overflow-hidden py-28 text-center md:py-36">
        <CtaOrbit />
        <FadeIn>
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Your next server is one checkout away.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Join the waitlist and we&apos;ll invite you as capacity opens. Naira billing, fast servers, and an infrastructure team in your timezone.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={WAITLIST_URL}>Join the waitlist</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/docs">Read the docs</a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-text-muted">
            By joining the waitlist you agree to our{" "}
            <a href="/terms" className="text-text-secondary underline-offset-4 hover:text-text hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-text-secondary underline-offset-4 hover:text-text hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </FadeIn>
      </FrameSection>
    </>
  );
}
