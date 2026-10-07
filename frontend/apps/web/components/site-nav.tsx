"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";
import { Button, cn } from "@nairacloud/ui";
import { Logo } from "./logo";
import { WAITLIST_URL } from "@/lib/site";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/status", label: "Status" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200",
        solid ? "border-border bg-bg/80 backdrop-blur-xl" : "border-transparent bg-transparent"
      )}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-10">
          <Logo size="sm" textClassName="text-[15px] font-semibold" />
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-[14px] transition-colors hover:text-text",
                      active ? "text-text" : "text-text-secondary"
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden md:block">
          <Button asChild size="sm" className="h-8 rounded-full px-4 text-[13px]">
            <a href={WAITLIST_URL}>Join waitlist</a>
          </Button>
        </div>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-bg md:hidden">
          <ul className="flex flex-col px-5 pt-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="flex items-center justify-between border-b border-border-subtle py-4 text-lg text-text"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </a>
              </li>
            ))}
          </ul>
          <div className="px-5 pt-8">
            <Button asChild size="lg" className="h-12 w-full rounded-full text-base">
              <a href={WAITLIST_URL}>Join waitlist</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
