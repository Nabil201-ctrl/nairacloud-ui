import type { Metadata } from "next";
import { CreditCard, CurrencyNgn, Lifebuoy, Receipt, RocketLaunch, TerminalWindow, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PriceTag } from "@nairacloud/ui";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { HeroBackground } from "@/components/hero-background";
import { HoverCard } from "@/components/hover-card";
import { AnimatedTerminal } from "@/components/animated-terminal";
import { AnimatedCounter } from "@/components/animated-counter";
import { getPlans, getPublicStats, formatSpecs, type Plan } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "NairaCloud — Your cloud.",
  description: "Cloud instances priced in naira and paid with Paystack. Deploy and SSH in minutes.",
  alternates: { canonical: "/" },
};

const WHY = [
  { icon: CurrencyNgn, title: "Priced in naira", body: "No dollar card, no conversion games. What you see is what you pay." },
  { icon: CreditCard, title: "Paystack checkout", body: "Cards and bank transfers through a familiar, secure flow." },
  { icon: RocketLaunch, title: "Online in minutes", body: "Pick a plan, pay, and get an IP. Provisioning runs itself." },
  { icon: TerminalWindow, title: "Developer-first", body: "SSH keys, API tokens, and per-instance usage charts that keep you in control." },
  { icon: Receipt, title: "Transparent billing", body: "Every kobo itemized. Grace warnings before anything is suspended." },
  { icon: Lifebuoy, title: "Real support", body: "Engineers in your timezone. Tickets answered by people who run the servers." },
] as const;

const STEPS = [
  { n: "01", title: "Choose a plan", body: "Five sizes, from free experiments to production boxes." },
  { n: "02", title: "Pay in naira", body: "Paystack checkout. Receipts and invoices in your dashboard." },
  { n: "03", title: "We provision", body: "We pick a host, write the disk, boot, and open the network — you watch progress in the dashboard." },
  { n: "04", title: "SSH in", body: "Your key is already authorized. Root access, immediately." },
] as const;

function cheapestActive(plans: Plan[]): Plan | null {
  const actives = plans.filter((p) => p.status === "ACTIVE").sort((a, b) => a.priceNgn - b.priceNgn);
  return actives[0] ?? null;
}

export default async function Home() {
  const [stats, plans] = await Promise.all([getPublicStats(), getPlans()]);
  const from = plans ? cheapestActive(plans) : null;

  return (
    <div className="bg-bg min-h-screen text-text overflow-x-hidden font-sans selection:bg-accent/30 selection:text-text">
      <SiteNav />
      
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 md:pb-28 md:pt-36 lg:pt-44">
        <HeroBackground />
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="text-center md:text-center lg:text-left">
            <Reveal delay={100} className="w-full">
              <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.065em] text-text sm:text-6xl md:text-7xl lg:text-[5.4rem]">
                Serious cloud.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-text to-text-muted">No dollar drama.</span>
              </h1>
            </Reveal>

            <Reveal delay={200} className="w-full">
              <p className="mt-7 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
                Deploy high-performance compute, pay in naira, and get straight back to building. No foreign cards. No surprise conversion fees.
              </p>
            </Reveal>

            <Reveal delay={300} className="w-full">
              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:justify-center lg:justify-start">
                <a href={WAITLIST_URL} className="press group relative flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-bold text-accent-fg hover:bg-accent-hover">
                  Join waitlist
                  <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
                </a>
                <a href="/pricing" className="press flex items-center justify-center rounded-lg border border-border/70 bg-surface/70 px-7 py-3.5 text-base font-semibold text-text hover:border-border-hover hover:bg-surface">
                  See every price
                </a>
              </div>
            </Reveal>

            <Reveal delay={400}>
              {from && <p className="mt-8 font-mono text-[13px] text-text-muted">Instances from <PriceTag amount={from.priceNgn} className="text-text font-bold" /> /month</p>}
            </Reveal>
          </div>

          <Reveal delay={350} className="w-full perspective-1000">
            <div style={{ transform: "rotateX(2deg) rotateY(-2deg)" }} className="terminal-frame transition-transform duration-700 hover:rotate-0">
              <AnimatedTerminal />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live stat strip */}
      {stats && (
        <section aria-label="Live platform metrics" className="border-y border-border/40 bg-surface/20 py-12 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40 px-6">
            {[
              { v: stats.activeInstances, l: "Active Instances", d: "up" }, 
              { v: stats.customers, l: "Developers", d: "up" }, 
              { v: stats.onlineNodes, l: "Nodes Online", d: "up" }
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 100}>
                <div className="flex flex-col items-center pt-8 sm:pt-0">
                  <dd className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-text">
                    <AnimatedCounter value={s.v} direction={s.d as "up" | "down"} />
                  </dd>
                  <dt className="mt-3 text-sm font-medium uppercase tracking-widest text-text-muted">{s.l}</dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      {/* Why us */}
      <section className="relative mx-auto max-w-7xl px-6 py-32 lg:py-48">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-text">Engineered for experience.</h2>
            <p className="mt-6 text-xl text-text-muted max-w-2xl mx-auto">Everything you expect from global tier-1 cloud providers, meticulously localized for developers.</p>
          </div>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <HoverCard className="h-full p-8 flex flex-col">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border/80 text-text shadow-sm">
                  <f.icon size={24} weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-text">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-text-muted">{f.body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      {plans && plans.length > 0 && (
        <section className="border-y border-border/40 bg-surface/10 py-32 lg:py-48">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                <div className="max-w-2xl">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">Transparent compute.</h2>
                  <p className="mt-6 text-xl text-text-muted">Predictable monthly billing. Never worry about exchange rate fluctuations again.</p>
                </div>
                <a href="/pricing" className="press group inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent transition-colors">
                  Compare specs <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {plans.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <HoverCard className={`h-full p-8 flex flex-col ${p.slug === "starter" || p.name.toLowerCase() === "starter" ? "ring-1 ring-accent" : ""}`}>
                    {(p.slug === "starter" || p.name.toLowerCase() === "starter") && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-fg shadow-lg">
                        Recommended
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <div className="mt-4 mb-8">
                      <PriceTag amount={p.priceNgn} className="text-4xl font-bold tracking-tighter" />
                      <span className="text-text-muted font-medium ml-1">/mo</span>
                    </div>
                    
                    <ul className="space-y-4 font-mono text-[13px] text-text-muted flex-1 mb-8">
                      <li className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span>vCPU</span>
                        <span className="text-text font-bold">{p.cpu} Cores</span>
                      </li>
                      <li className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span>Memory</span>
                        <span className="text-text font-bold">{p.ramMb / 1024} GB</span>
                      </li>
                      <li className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span>Storage</span>
                        <span className="text-text font-bold">{p.storageGb} GB NVMe</span>
                      </li>
                    </ul>
                    
                    <a href={WAITLIST_URL} className="press block w-full rounded-lg bg-surface hover:bg-surface-hover border border-border/80 py-3 text-center text-sm font-semibold transition-colors">Join waitlist</a>
                  </HoverCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-32 lg:py-48">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-center mb-20">Ship faster than ever.</h2>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/40 hidden lg:block -z-10" />
          
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div className="relative bg-bg pt-8">
                <div className="absolute top-0 left-0 lg:left-1/2 lg:-translate-x-1/2 w-12 h-12 rounded-full bg-surface border border-border/80 flex items-center justify-center font-mono text-sm font-bold text-accent shadow-sm z-10">
                  {s.n}
                </div>
                <div className="mt-8 lg:text-center px-4">
                  <h3 className="text-xl font-bold text-text mb-3">{s.title}</h3>
                  <p className="text-text-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t border-border/40 bg-surface/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,217,160,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center lg:py-48">
          <Reveal>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-balance">Build the future. <br/><span className="text-text-muted">Host it locally.</span></h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl text-text-muted">Join the fastest growing cloud platform, designed for builders everywhere.</p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={WAITLIST_URL} className="press rounded-lg bg-text px-10 py-4 font-bold text-bg hover:bg-text/90 transition-colors w-full sm:w-auto">
                Join waitlist
              </a>
              <a href="/docs" className="press rounded-lg border border-border/80 bg-surface px-10 py-4 font-semibold text-text hover:bg-surface-hover transition-colors w-full sm:w-auto">
                Read the docs
              </a>
            </div>

            

            <p className="mt-4 text-xs text-text-muted/75">
              By joining the waitlist you agree to our{" "}
              <a href="/terms" className="font-medium text-text underline-offset-4 transition-colors hover:text-accent hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="font-medium text-text underline-offset-4 transition-colors hover:text-accent hover:underline">Privacy Policy</a>.
            </p>
            
            <p className="mt-10 font-mono text-xs text-text-muted uppercase tracking-widest">
              Cloud hosting, simplified.
            </p>
          </Reveal>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
