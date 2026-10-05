import type { Metadata } from "next";
import {
  ArrowRight,
  ChartLineUp,
  Clock,
  CurrencyNgn,
  GlobeHemisphereWest,
  HardDrives,
  Key,
  ShieldCheck,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { TerminalPreview } from "@nairacloud/ui";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { HeroBackground } from "@/components/hero-background";
import { HoverCard } from "@/components/hover-card";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your First VPS",
  description:
    "A friendly walkthrough for first-time server owners: what a VPS is, how to deploy one on NairaCloud, SSH in, and run your first website.",
  alternates: { canonical: "/first-vps" },
};

const INCLUDES = [
  { icon: TerminalWindow, title: "Root SSH access", body: "Full control over your box from day one. Your key is authorized the moment we provision." },
  { icon: GlobeHemisphereWest, title: "A public address", body: "Every instance is reachable on a public IPv4 through its own SSH port — and that port never changes, even across rebuilds." },
  { icon: Clock, title: "Always on", body: "Your server stays running and reachable around the clock. The status page shows real-time platform health." },
  { icon: HardDrives, title: "Your own OS", body: "Pick Ubuntu 22.04, Ubuntu 24.04, or Debian 12 when you deploy. Rebuild any time with the same connection details." },
  { icon: CurrencyNgn, title: "Naira billing", body: "Paystack checkout in naira with an invoice for every charge. No dollar conversion games." },
  { icon: ChartLineUp, title: "Live metrics", body: "CPU, memory, and network charts on the instance page so you always know it's healthy." },
];

const STEPS = [
  { n: "01", title: "Join the waitlist", body: "Drop your email on the waitlist. We'll invite you when early access opens." },
  { n: "02", title: "Deploy an instance", body: "Pick a plan, name your server, choose an OS. Free plans need no payment, so provisioning starts the moment you confirm." },
  { n: "03", title: "SSH in", body: "Use the exact connection string from the dashboard. Root access, right away." },
  { n: "04", title: "Make it yours", body: "Install software, point your domain at it, and start shipping." },
];

const OPS = [
  { icon: Key, title: "Switch to SSH keys", body: "Keys beat passwords. Paste your public key under SSH Keys — after that, even the dashboard uses it." },
  { icon: ShieldCheck, title: "Lock the firewall", body: "Run ufw and allow only the ports you need — usually 22 and 80/443. One command, big payoff." },
  { icon: HardDrives, title: "Back up yourself", body: "Automated snapshots aren't here yet, so schedule your own: a cron script that tars your data and copies it elsewhere (object storage, another server, your laptop)." },
  { icon: ChartLineUp, title: "Watch the metrics", body: "CPU and memory charts on the dashboard catch problems before your users do." },
];

export default function FirstVpsPage() {
  return (
    <div className="bg-bg min-h-screen text-text overflow-x-hidden font-sans selection:bg-accent/30 selection:text-text">
      <SiteNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 md:pb-28 md:pt-36 lg:pt-44">
        <HeroBackground />
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow">First VPS · Free guide</p>
            <h1 className="mt-6 text-5xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-6xl md:text-7xl">
              Your first server,<br />
              <span className="bg-gradient-to-r from-accent via-text to-text-muted bg-clip-text text-transparent">end to end.</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
              You've never run a VPS before? Perfect. This guide walks you from the waitlist to a live website —
              using the kind of server your business will actually grow on.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={WAITLIST_URL} className="press inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 font-bold text-accent-fg transition-colors hover:bg-accent-hover">
                Join waitlist <ArrowRight size={16} weight="bold" />
              </a>
              <a href="/pricing" className="press rounded-lg border border-border/80 bg-surface px-8 py-3.5 font-semibold text-text transition-colors hover:bg-surface-hover">
                See the plans
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What a server is */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow">The mental model</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">A server is just a computer that's always on.</h2>
            <p className="mt-5 text-base leading-relaxed text-text-muted">
              Same CPU, RAM, and disk as the laptop in front of you — except it lives in a data centre, has a public IP,
              and never sleeps. You connect over SSH, install whatever you want, and it stays reachable on the internet
              while you're not looking.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              On NairaCloud your server comes as an <span className="font-mono text-text">instance</span> on a bigger
              physical server. It behaves exactly like a dedicated machine: its own root login, its own software, its own
              reachable address (the node's public IP, with a private SSH port). You just don't have to buy the hardware.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Everything a rented box should include.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <HoverCard className="h-full">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-border/70 bg-surface text-accent">
                  <f.icon size={20} weight="bold" />
                </div>
                <h3 className="mt-5 font-semibold tracking-tight text-text">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">From waitlist to SSH in four steps.</h2>
            </Reveal>
            <div className="mt-10 space-y-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 80}>
                  <div className="flex gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface font-mono text-sm font-bold text-accent">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight text-text">{s.title}</h3>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-muted">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={150} className="lg:pt-16">
            <div className="rounded-xl border border-border/40 bg-surface-hover/30 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
              <div className="overflow-hidden rounded-lg border border-border/60 bg-bg">
                <div className="flex items-center gap-2 border-b border-border/60 bg-surface/50 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-danger/60" />
                  <span className="h-3 w-3 rounded-full bg-warning/60" />
                  <span className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 font-mono text-[11px] tracking-wider text-text-muted/80">connect — nairacloud</span>
                </div>
                <div className="space-y-3 p-6 font-mono text-[13px] leading-relaxed">
                  <p className="flex items-center gap-3"><span className="font-bold text-accent">$</span> <span className="text-text">ssh root@102.89.13.22 -p 22000</span></p>
                  <p className="ml-5 text-text-muted/80">The authenticity of host can't be established…</p>
                  <p className="ml-5 text-text-muted/80">· · ·</p>
                  <p className="ml-5 text-text">Welcome to Ubuntu 24.04 LTS (GNU/Linux 5.15.0-91 x86_64)</p>
                  <p className="ml-5 flex items-center gap-2 text-accent">root@first-server:~# <span className="inline-block h-4 w-2 bg-accent" /></p>
                </div>
              </div>
              <p className="mt-3 px-2 pb-1 text-xs leading-relaxed text-text-muted">
                The dashboard shows you one ready-to-paste connection string. No port forwarding, no config.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* First deploy */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow">Your first deploy</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Say it with a website.</h2>
            <p className="mt-5 text-base leading-relaxed text-text-muted">
              Once you're inside, three commands turn your server into a running website. Ubuntu ships with the tools you
              need — paste these one at a time:
            </p>
          </Reveal>
          <Reveal delay={100}>
            <TerminalPreview showLineNumbers lines={[
              "$ apt update && apt upgrade -y",
              "$ apt install -y nginx",
              "$ systemctl enable --now nginx",
              "$ curl -s http://$(hostname -I | awk '{print $1}') | head -5",
              "<!DOCTYPE html> · Welcome to nginx! · _",
            ]} />
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 text-base leading-relaxed text-text-muted">
              nginx is up and the IP answered. Public web-port mapping isn't available yet, so to look at it in your
              browser now, forward the port with SSH tunnel — then add a domain later (point an A record at your
              server), drop your app in <span className="font-mono text-text">/var/www</span>, or swap nginx for Node,
              Python, Go — whatever you build in.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Operations */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal>
          <p className="eyebrow">Run it like a pro</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Four habits that keep a server boring.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPS.map((o, i) => (
            <Reveal key={o.title} delay={i * 60}>
              <HoverCard className="h-full">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-border/70 bg-surface text-accent">
                  <o.icon size={20} weight="bold" />
                </div>
                <h3 className="mt-5 font-semibold tracking-tight text-text">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{o.body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative mt-24 overflow-hidden border-t border-border/40 bg-surface/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,217,160,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tighter text-balance sm:text-5xl">The first server is the hardest.<br /><span className="text-text-muted">We make it the easiest one.</span></h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-text-muted">Deploy now, pay in naira, and you'll be SSH-ing into your own box within minutes.</p>
            <div className="mt-10">
              <a href={WAITLIST_URL} className="press inline-flex items-center gap-2 rounded-lg bg-accent px-10 py-4 font-bold text-accent-fg transition-colors hover:bg-accent-hover">
                Join waitlist <ArrowRight size={16} weight="bold" />
              </a>
            </div>
            <p className="mt-8 font-mono text-xs tracking-widest text-text-muted uppercase">Built for builders everywhere</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}