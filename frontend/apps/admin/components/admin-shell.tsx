"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  House,
  SquaresFour,
  Cloud,
  Stack,
  Users,
  CreditCard,
  Receipt,
  ChartBar,
  WarningOctagon,
  ShieldWarning,
  ClockCounterClockwise,
  GearSix,
  ArrowSquareOut,
  List,
  X,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Package,
  CloudArrowUp,
  BookOpen,
} from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";
import { SecurityBadge } from "./ui";
import { GroqAgent } from "./groq-chat";
import { useRealtime } from "@/hooks/use-realtime";

type Item = { href: string; label: string; icon: any; badge?: string };
type NavGroup = { group: string; items: Item[] };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: House },
      { href: "/orders", label: "Orders", icon: Package },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      { href: "/nodes", label: "Nodes Hub", icon: SquaresFour },
      { href: "/instances", label: "Instances", icon: Cloud },
      { href: "/plans", label: "Plan Matrix", icon: Stack },
      { href: "/agent-releases", label: "Agent Releases", icon: CloudArrowUp },
    ],
  },
  {
    group: "Commercial",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/transactions", label: "Wallet Ledger", icon: Receipt },
      { href: "/payments", label: "Paystack Stream", icon: CreditCard },
    ],
  },
  {
    group: "System & SecOps",
    items: [
      { href: "/usage", label: "Usage Metrics", icon: ChartBar },
      { href: "/incidents", label: "Incidents", icon: WarningOctagon },
      { href: "/abuse", label: "Abuse Queue", icon: ShieldWarning },
      { href: "/audit-logs", label: "Audit Trail", icon: ClockCounterClockwise },
      { href: "/docs", label: "Admin Docs", icon: BookOpen },
      { href: "/settings", label: "Global Settings", icon: GearSix },
    ],
  },
];

const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001").replace(/\/$/, "");

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isConnected } = useRealtime();
  const closeMenuBtnRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeMenuBtnRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // React 18: set inert via DOM so off-screen drawer links are not focusable
  useEffect(() => {
    const el = mobileDrawerRef.current;
    if (!el) return;
    if (mobileMenuOpen) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
        requestAnimationFrame(() => hamburgerRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  // Determine page title & section
  let title = "Command Center";
  let section = "Overview";
  if (pathname === "/") {
    title = "Command Center";
    section = "Overview";
  } else {
    for (const g of NAV_GROUPS) {
      const match = g.items.find((i) => pathname.startsWith(i.href) && i.href !== "/");
      if (match) {
        title = match.label;
        section = g.group;
        break;
      }
    }
  }

  const navContent = (isMobile = false) => (
    <nav aria-label="Admin Navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-none">
      {NAV_GROUPS.map((group) => (
        <div key={group.group}>
          {(!collapsed || isMobile) && (
            <h3 className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted/60">
              {group.group}
            </h3>
          )}
          {collapsed && !isMobile && <div className="my-2 border-t border-border/40" />}
          <div className="space-y-1">
            {group.items.map((it) => {
              const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
              const Icon = it.icon;
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed && !isMobile ? it.label : undefined}
                  onClick={() => {
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150",
                    active
                      ? "bg-surface/90 border border-border/80 text-text shadow-sm shadow-black/20"
                      : "text-text-muted border border-transparent hover:bg-surface/50 hover:text-text",
                    collapsed && !isMobile && "justify-center px-0"
                  )}
                >
                  <Icon
                    weight={active ? "fill" : "regular"}
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      active ? "text-accent" : "text-text-muted group-hover:text-text"
                    )}
                    aria-hidden="true"
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="truncate">{it.label}</span>
                      {active && (
                        <div className="ml-auto flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,217,160,0.9)]" />
                        </div>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footerContent = (isMobile = false) => (
    <div className="border-t border-border/60 p-3 bg-surface/30 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {(!collapsed || isMobile) ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-border/80 shadow-inner">
              <span className="font-mono text-xs font-bold text-accent">NC</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent border border-bg" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text truncate">Control Plane</span>
              <span className="font-mono text-[10px] text-accent tracking-wider font-semibold">SECLEVEL 9</span>
            </div>
          </div>
          <a
            href={WEB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-surface/40 py-2.5 text-xs font-semibold text-text-muted transition-colors hover:border-accent/40 hover:bg-surface hover:text-text"
          >
            <span>Client Portal</span>
            <ArrowSquareOut size={13} className="text-text-muted" />
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <a
            href={WEB_URL}
            target="_blank"
            rel="noreferrer"
            title="Open Client Portal"
            className="flex items-center justify-center rounded-md border border-border/70 bg-surface/40 p-2 text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowSquareOut size={16} />
          </a>
        </div>
      )}
    </div>
  );

  if (pathname === "/login") {
    return <div className="min-h-dvh w-full bg-bg text-text antialiased">{children}</div>;
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-bg text-text antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        ref={mobileDrawerRef}
        id="admin-mobile-nav"
        role="dialog"
        aria-modal={mobileMenuOpen}
        aria-label="Admin navigation"
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[min(18rem,calc(100%-3rem))] flex-col border-r border-border/70 bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          "pt-[env(safe-area-inset-top)]",
          mobileMenuOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/60 bg-surface/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 border border-accent/30 text-accent font-mono font-bold text-xs">
              ₦
            </div>
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-text truncate">NairaCloud Admin</span>
          </div>
          <button
            ref={closeMenuBtnRef}
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              requestAnimationFrame(() => hamburgerRef.current?.focus());
            }}
            aria-label="Close navigation"
            className="press shrink-0 rounded-md border border-border/70 p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
          {navContent(true)}
          {footerContent(true)}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r border-border/60 bg-[linear-gradient(180deg,var(--surface)_0%,var(--bg)_100%)] md:flex shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-20 transition-[width] duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/60">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-85">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/15 border border-accent/40 text-accent font-mono font-bold text-xs shadow-[0_0_8px_rgba(0,217,160,0.3)]">
                ₦
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold tracking-tight uppercase text-text">NairaCloud</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-accent/15 border border-accent/40 text-accent font-mono font-bold text-xs">
              ₦
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "press rounded-md border border-border/70 p-1 text-text-muted hover:border-border-hover hover:bg-surface hover:text-text",
              collapsed && "hidden"
            )}
          >
            <CaretLeft size={14} />
          </button>
        </div>

        {collapsed && (
          <div className="p-2 border-b border-border/40 flex justify-center shrink-0">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="press rounded-md border border-border/70 p-1.5 text-text-muted hover:border-border-hover hover:bg-surface hover:text-text"
            >
              <CaretRight size={14} />
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
          {navContent(false)}
          {footerContent(false)}
        </div>
      </aside>

      {/* Main Column */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Global SaaS Topbar */}
        <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-bg/85 px-3 backdrop-blur-md sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-nav"
              className="press shrink-0 rounded-md border border-border/70 p-1.5 text-text-muted hover:bg-surface hover:text-text md:hidden"
            >
              <List size={18} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-muted">
              <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-text-muted/60">{section}</span>
              <span className="hidden sm:inline-block text-text-muted/40">/</span>
              <span className="truncate font-semibold text-text">{title}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
              aria-label="Open command palette"
              className="group flex items-center gap-2 rounded-md border border-border/70 bg-surface/40 p-1.5 text-xs text-text-muted transition-all hover:border-accent/40 hover:bg-surface hover:text-text sm:px-2.5 sm:py-1"
            >
              <MagnifyingGlass size={13} className="text-text-muted group-hover:text-accent transition-colors" />
              <span className="hidden md:inline font-mono text-[11px]">Command Palette</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-surface border border-border/80 px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Realtime Socket Status — icon-only under sm */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider sm:px-2",
                isConnected
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-warning/30 bg-warning/10 text-warning"
              )}
              title={isConnected ? "WebSocket stream connected" : "WebSocket disconnected (polling active)"}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-accent shadow-[0_0_6px_rgba(0,217,160,0.8)] animate-pulse" : "bg-warning")} />
              <span className="hidden sm:inline">{isConnected ? "WS: LIVE" : "POLLING"}</span>
              <span className="sr-only sm:hidden">{isConnected ? "WebSocket live" : "Polling"}</span>
            </div>

            <SecurityBadge level="9" label="ADMIN" className="hidden sm:inline-flex" />
            <SecurityBadge level="9" label="ADMIN" compact className="sm:hidden" />
          </div>
        </header>

        {/* Main Content Area — owns vertical scroll */}
        <main
          id="main"
          className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8 lg:px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </main>

        {/* Universal Groq / Command Agent accessible everywhere */}
        <GroqAgent />
      </div>
    </div>
  );
}
