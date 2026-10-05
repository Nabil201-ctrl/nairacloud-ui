"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  ChartBar,
  Cloud,
  DotsThree,
  GearSix,
  Gift,
  House,
  Key,
  Lifebuoy,
  List,
  Receipt,
  SignOut,
  TerminalWindow,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { cn } from "@nairacloud/ui";
import { api } from "@/lib/api";
import { GraceBanner } from "./grace-banner";
import { Logo } from "./logo";
import { LinkButton, SecondaryButton } from "./dashboard/buttons";

type Item = { href: string; label: string; icon: typeof House };

const NAV: Array<{ head?: string; items: Item[] }> = [
  {
    items: [
      { href: "/dashboard", label: "Overview", icon: House },
      { href: "/dashboard/instances", label: "Instances", icon: Cloud },
      { href: "/dashboard/usage", label: "Usage", icon: ChartBar },
      { href: "/dashboard/ssh-keys", label: "SSH Keys", icon: Key },
    ],
  },
  {
    head: "Billing",
    items: [
      { href: "/dashboard/billing/wallet", label: "Wallet", icon: Wallet },
      { href: "/dashboard/billing/invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    head: "Account",
    items: [
      { href: "/dashboard/referrals", label: "Earn Credit", icon: Gift },
      { href: "/dashboard/api-keys", label: "API & Keys", icon: TerminalWindow },
      { href: "/dashboard/support", label: "Support", icon: Lifebuoy },
      { href: "/dashboard/settings", label: "Settings", icon: GearSix },
      { href: "/docs", label: "Documentation", icon: BookOpen },
    ],
  },
];

const MOBILE_PRIMARY: Item[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/instances", label: "Deploy", icon: Cloud },
  { href: "/dashboard/usage", label: "Usage", icon: ChartBar },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/instances": "Instances",
  "/dashboard/instances/new": "Deploy Instance",
  "/dashboard/usage": "Usage",
  "/dashboard/ssh-keys": "SSH Keys",
  "/dashboard/billing/wallet": "Wallet",
  "/dashboard/billing/invoices": "Invoices",
  "/dashboard/billing/payment-methods": "Payment Methods",
  "/dashboard/billing/subscriptions": "Subscriptions",
  "/dashboard/referrals": "Earn Credit",
  "/dashboard/api-keys": "API & Keys",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function DashboardShell({ name, email, children }: { name: string | null; email?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [profileOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  async function signOut() {
    try {
      await api().post("/v1/auth/logout");
    } catch {
      // Session cookies are gone either way; still send the user home.
    }
    setProfileOpen(false);
    toast.success("You've been signed out");
    router.push("/login");
    router.refresh();
  }

  const initial = (name?.trim()?.[0] ?? "N").toUpperCase();
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/dashboard/instances/")
      ? "Instance"
      : pathname.startsWith("/dashboard/support/")
        ? "Support"
        : "Dashboard");

  const NavLinks = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {NAV.map((group, gi) => (
        <div key={gi} className="mb-5 last:mb-0">
          {!collapsed && group.head ? (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-disabled">
              {group.head}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((it) => {
              const active = isActivePath(pathname, it.href);
              return (
                <li key={it.label}>
                  <a
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex h-10 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors duration-150",
                      active
                        ? "bg-nav-active text-white"
                        : "bg-transparent text-text-muted hover:bg-nav-hover hover:text-text-hover",
                      collapsed && "justify-center"
                    )}
                    onClick={() => setMoreOpen(false)}
                  >
                    <it.icon
                      size={16}
                      weight={active ? "fill" : "regular"}
                      className={cn("shrink-0", active ? "text-white" : "text-text-muted group-hover:text-text-hover")}
                      aria-hidden
                    />
                    {!collapsed && <span className="truncate font-medium">{it.label}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-bg lg:flex">
      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        className={cn(
          "hidden shrink-0 flex-col border-r border-border-subtle bg-sidebar lg:flex transition-all duration-200 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-[200px]"
        )}
      >
        <div className={cn("flex h-12 items-center transition-all duration-200", sidebarCollapsed ? "px-3 justify-center" : "px-4")}>
          <Logo size="sm" showText={!sidebarCollapsed} />
        </div>
        <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-2 py-3">
          <NavLinks collapsed={sidebarCollapsed} />
        </nav>
        <div className={cn("space-y-2 border-t border-border-subtle transition-all duration-200", sidebarCollapsed ? "p-2" : "p-3")}>
          <LinkButton
            href="/dashboard/instances/new"
            className={cn("flex items-center justify-center gap-2", sidebarCollapsed ? "w-full px-0" : "w-full")}
          >
            {!sidebarCollapsed && <span>Deploy</span>}
            {sidebarCollapsed && <span>+</span>}
          </LinkButton>
          <SecondaryButton
            onClick={() => void signOut()}
            className={cn("flex items-center justify-center gap-2", sidebarCollapsed ? "w-full px-0" : "w-full")}
          >
            <SignOut size={14} />
            {!sidebarCollapsed && <span>Sign out</span>}
          </SecondaryButton>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border-subtle bg-topnav px-4 lg:h-14 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
              aria-label="Open menu"
            >
              <List size={18} />
            </button>
            <div className="hidden min-w-0 items-center gap-1.5 text-[13px] lg:flex">
              <span className="truncate text-text-muted">Workspace</span>
              <span className="text-text-disabled">/</span>
              <span className="truncate text-text-secondary">{title}</span>
            </div>
            <p className="truncate text-[13px] font-medium text-white lg:hidden">{title}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label={`Account menu for ${name ?? "customer"}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[12px] font-medium text-white transition-colors hover:border-border-hover"
              >
                {initial}
              </button>
              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-md border border-border bg-card elev-3"
                >
                  <div className="border-b border-border-subtle px-3 py-2.5">
                    <p className="truncate text-[13px] font-medium text-white">{name ?? "Customer"}</p>
                    <p className="truncate text-[12px] text-text-muted">{email ?? "Signed in"}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void signOut()}
                      className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] text-text-muted transition-colors hover:bg-surface-hover hover:text-white"
                    >
                      <SignOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto outline-none" tabIndex={-1}>
          <GraceBanner />
          <div className="px-4 pb-24 pt-4 md:px-6 lg:px-6 lg:pb-8 lg:pt-5">
            <div className="rounded-lg border border-border-faint bg-main p-4 md:p-6 lg:p-8 elev-1">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile more sheet */}
      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close menu" onClick={() => setMoreOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[calc(100%-3rem)] flex-col border-r border-border bg-card elev-2">
            <div className="flex h-12 items-center justify-between border-b border-border-subtle px-4">
              <Logo size="sm" />
              <button type="button" onClick={() => setMoreOpen(false)} className="p-1.5 text-text-muted hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-4">
              <NavLinks collapsed={false} />
            </nav>
            <div className="space-y-2 border-t border-border-subtle p-3">
              <LinkButton href="/dashboard/instances/new" className="w-full" onClick={() => setMoreOpen(false)}>
                Deploy
              </LinkButton>
              <SecondaryButton onClick={() => void signOut()} className="w-full">
                <SignOut size={14} />
                Sign out
              </SecondaryButton>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Floating mobile bottom nav */}
      <nav
        aria-label="Mobile"
        className="fixed bottom-3 left-3 right-3 z-40 flex h-14 items-center justify-around rounded-mobile-nav border border-border bg-mobile-nav px-2 lg:hidden"
      >
        {MOBILE_PRIMARY.map((it) => {
          const active = isActivePath(pathname, it.href);
          return (
            <a
              key={it.href}
              href={it.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] transition-colors duration-150",
                active ? "text-white" : "text-text-muted",
              )}
            >
              <it.icon size={18} weight={active ? "fill" : "regular"} />
              <span>{it.label}</span>
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] text-text-muted transition-colors hover:text-white"
        >
          <DotsThree size={18} weight="bold" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
