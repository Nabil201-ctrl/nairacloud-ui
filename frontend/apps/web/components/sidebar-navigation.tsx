"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDown,
  BookOpen,
  Terminal,
  Key,
  Globe,
  Package,
  Pulse,
  CreditCard,
  Code,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { getDocNavSections } from "@/lib/docs-nav";

const ICONS: Record<string, React.ReactNode> = {
  "getting-started": <BookOpen size={13} weight="duotone" />,
  "creating-an-instance": <Package size={13} weight="duotone" />,
  "ssh-access": <Key size={13} weight="duotone" />,
  "networking-firewall": <Globe size={13} weight="duotone" />,
  "docker-caddy": <Terminal size={13} weight="duotone" />,
  "vps-monitoring": <Pulse size={13} weight="duotone" />,
  "billing-subscriptions": <CreditCard size={13} weight="duotone" />,
  "api-reference": <Code size={13} weight="duotone" />,
};

const navigation = getDocNavSections();

export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.map((_, i) => `section-${i}`)
  );

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(`section-${index}`)
        ? prev.filter((s) => s !== `section-${index}`)
        : [...prev, `section-${index}`]
    );
  };

  const isActive = (slug: string) => pathname === `/docs/${slug}`;

  return (
    <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6" aria-label="Documentation navigation">
      {/* Resend-style Search Bar inside Sidebar */}
      <div className="px-0.5">
        <Link
          href="/docs"
          className="group flex items-center justify-between rounded-xl border border-neutral-800 bg-[#121212] px-3 py-2 text-[13px] text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-200"
        >
          <div className="flex items-center gap-2">
            <MagnifyingGlass size={14} weight="bold" className="shrink-0 text-neutral-500" />
            <span>Search...</span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
            Ctrl K
          </span>
        </Link>
      </div>

      <div className="space-y-5">
        <Link
          href="/docs"
          {...(onNavigate ? { onClick: onNavigate } : {})}
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors",
            pathname === "/docs"
              ? "bg-[#1f1f1f] text-white shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          {...(pathname === "/docs" ? { "aria-current": "page" as const } : {})}
        >
          <BookOpen size={14} weight="duotone" className="shrink-0 text-neutral-400" />
          Docs home
        </Link>

        {navigation.map((section, sectionIndex) => (
          <section key={section.label} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection(sectionIndex)}
              className="flex items-center justify-between w-full px-3 py-1 text-[11px] font-semibold tracking-tight text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-expanded={expandedSections.includes(`section-${sectionIndex}`)}
            >
              <span>{section.label}</span>
              <CaretDown
                size={11}
                weight="bold"
                className={cn(
                  "transition-transform text-neutral-500",
                  expandedSections.includes(`section-${sectionIndex}`) && "rotate-180"
                )}
              />
            </button>

            <ul
              role="list"
              className={cn(
                "space-y-0.5 overflow-hidden transition-all duration-200 ease-out",
                !expandedSections.includes(`section-${sectionIndex}`) && "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              {section.items.map((item) => {
                const active = isActive(item.slug);
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      {...(onNavigate ? { onClick: onNavigate } : {})}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors",
                        active
                          ? "bg-[#1f1f1f] text-white shadow-sm"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-900/40"
                      )}
                      {...(active ? { "aria-current": "page" as const } : {})}
                    >
                      <span className={cn("shrink-0", active ? "text-white" : "text-neutral-500")}>
                        {ICONS[item.slug]}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
