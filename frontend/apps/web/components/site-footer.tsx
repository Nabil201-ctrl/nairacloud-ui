import { Logo } from "./logo";
import { StatusBadge } from "./status-badge";
import { Container } from "./marketing/primitives";
import { WAITLIST_URL } from "@/lib/site";

const COLS: Array<{
  head: string;
  links: Array<{ href: string; label: string }>;
}> = [
  {
    head: "Product",
    links: [
      { href: "/first-vps", label: "First VPS" },
      { href: "/docs", label: "Docs" },
      { href: "/pricing", label: "Pricing" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    head: "Company",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/aup", label: "Acceptable use" },
    ],
  },
  { head: "Account", links: [{ href: WAITLIST_URL, label: "Join waitlist" }] },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-sidebar">
      {/* Dot-grid texture, top right, fading out */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-24 h-72 w-[36rem]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(closest-side, black, transparent)",
          WebkitMaskImage: "radial-gradient(closest-side, black, transparent)",
        }}
      />

      <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Logo size="lg" textClassName="text-2xl font-semibold" />
          <p className="max-w-xs text-sm text-pretty leading-relaxed text-text-muted">
            Cloud instances priced in naira, paid with Paystack.
          </p>
          <StatusBadge />
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLS.map((c) => (
            <nav
              key={c.head}
              aria-label={c.head}
              className="flex flex-col gap-3"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-text">
                {c.head}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <Container className="relative flex flex-col gap-3 border-t border-border-subtle py-6 font-mono text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} NairaCloud.</p>
        <p>Built for builders everywhere.</p>
      </Container>

      {/* Oversized wordmark: sized in vw so it scales with the viewport */}
      <div
        aria-hidden
        className="pointer-events-none relative -mb-[4vw] select-none"
      >
        <p
          className="bg-clip-text text-center text-[18vw] font-semibold leading-none tracking-tighter text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent)",
          }}
        >
          nairacloud
        </p>
      </div>
    </footer>
  );
}
