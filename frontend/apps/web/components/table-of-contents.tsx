"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@nairacloud/ui";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pl-1"
      aria-label="Table of contents"
    >
      <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-neutral-400">
        <span className="text-[14px]">≡</span> On this page
      </div>
      <div className="relative border-l border-neutral-800/80 space-y-1 text-[13px]">
        {headings.map((h) => {
          const isActive = activeId === h.id || (!activeId && headings[0]?.id === h.id);
          return (
            <div key={h.id} className={cn(h.level === 3 && "pl-3")}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "block -ml-px border-l-2 leading-relaxed transition-colors py-1 pl-3.5",
                  isActive
                    ? "border-white font-medium text-white"
                    : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.pushState(null, "", `#${h.id}`);
                    setActiveId(h.id);
                  }
                }}
              >
                {h.text}
              </a>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export function RelatedDocs({
  related,
  allDocs,
}: {
  related: string[] | undefined;
  allDocs: typeof import("@/lib/docs").DOCS;
}) {
  if (!related || related.length === 0) return null;

  const relatedDocs = related
    .map((slug) => allDocs.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  if (relatedDocs.length === 0) return null;

  return (
    <nav
      aria-label="Related documentation"
      className="mt-12 rounded-lg border border-border bg-surface p-5"
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Related guides
      </p>
      <ul className="space-y-2">
        {relatedDocs.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className="group flex flex-col gap-0.5 rounded-md px-1 py-1.5 transition-colors hover:bg-nav-hover sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="text-sm font-medium text-text group-hover:text-accent">
                {doc.title}
              </span>
              <span className="text-xs text-text-muted sm:truncate">{doc.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function useHeadings(content: React.ReactNode): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const article = document.querySelector(".docs-body");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3");
    const extracted: Heading[] = [];

    headingElements.forEach((el) => {
      if (!el.id) {
        const id = el.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (id) el.id = id;
      }
      if (el.id) {
        extracted.push({
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName[1]),
        });
      }
    });

    setHeadings(extracted);
  }, [content]);

  return headings;
}
