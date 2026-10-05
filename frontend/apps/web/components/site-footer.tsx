import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./logo";
import { StatusBadge } from "./status-badge";
import { WAITLIST_URL } from "@/lib/site";

const COLS: Array<{ head: string; links: Array<{ href: string; label: string }> }> = [
  { head: "Product", links: [{ href: "/first-vps", label: "First VPS" }, { href: "/docs", label: "Docs" }, { href: "/pricing", label: "Pricing" }, { href: "/status", label: "Status" }] },
  { head: "Company", links: [{ href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }, { href: "/aup", label: "Acceptable use" }] },
  { head: "Account", links: [{ href: WAITLIST_URL, label: "Join waitlist" }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/20">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:pt-20">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg px-6 py-10 sm:px-10 sm:py-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Your next server is one checkout away</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">Build locally. Ship seriously.</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">Naira billing, high-performance compute, and an infrastructure team in your timezone.</p>
            </div>
            <a href={WAITLIST_URL} className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-bold text-accent-fg hover:bg-accent-hover">Join the waitlist <ArrowUpRight size={17} weight="bold" /></a>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-text-muted">Cloud instances priced in naira, paid with Paystack.</p>
          <StatusBadge />
        </div>
        {COLS.map((c) => (
          <nav key={c.head} aria-label={c.head}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{c.head}</h3>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.href}><a href={l.href} className="text-sm text-text-muted transition-colors hover:text-text">{l.label}</a></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 font-mono text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NairaCloud.</p>
          <p>Built for builders everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
