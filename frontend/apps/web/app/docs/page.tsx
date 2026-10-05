"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { DocsShell } from "@/components/docs-shell";
import { SectionLabel, PageHeader, PageDescription } from "@/components/documentation-elements";
import { getDocNavSections } from "@/lib/docs-nav";

export default function DocsIndexPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => getDocNavSections(), []);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            section.label.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query, sections]);

  const totalMatches = filteredSections.reduce((n, s) => n + s.items.length, 0);

  return (
    <DocsShell>
      <article className="min-w-0">
        <div className="mb-10">
          <SectionLabel>Documentation</SectionLabel>
          <PageHeader title="Build on NairaCloud" className="mt-3" />
          <PageDescription description="Guides for renting a cloud server, connecting over SSH, managing billing, and scripting your fleet — each with a practical walk-through you can do right now." />
        </div>

        <div className="mb-10">
          <label htmlFor="docs-search" className="sr-only">
            Search documentation
          </label>
          <div className="relative max-w-xl">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <input
              id="docs-search"
              type="search"
              placeholder='Search docs… try "SSH", "billing", or "API"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-control py-3 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {query && (
            <p className="mt-2 text-sm text-text-muted">
              Showing {totalMatches} guide{totalMatches === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        {filteredSections.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center text-text-muted">
            <p>No guides match &ldquo;{query}&rdquo;. Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredSections.map((section) => (
              <section key={section.label} aria-labelledby={`section-${section.label}`}>
                <h2
                  id={`section-${section.label}`}
                  className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
                >
                  {section.label}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/docs/${item.slug}`}
                      className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-hover hover:bg-surface-hover"
                    >
                      <p className="flex items-center justify-between gap-3 text-sm font-semibold text-text">
                        <span>{item.title}</span>
                        <ArrowRight
                          size={14}
                          aria-hidden
                          className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!query && (
          <div className="mt-12 rounded-lg border border-border bg-main p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">New to NairaCloud?</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Start with{" "}
              <Link href="/docs/getting-started" className="font-semibold text-text underline-offset-2 hover:underline">
                Getting started
              </Link>{" "}
              or the friendlier{" "}
              <Link href="/first-vps" className="font-semibold text-text underline-offset-2 hover:underline">
                Your First VPS
              </Link>{" "}
              walkthrough — waitlist to a live website.
            </p>
          </div>
        )}
      </article>
    </DocsShell>
  );
}
