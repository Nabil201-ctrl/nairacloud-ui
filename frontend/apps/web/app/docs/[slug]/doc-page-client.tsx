"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CaretRight, Copy, Check, CaretDown, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { DocsShell } from "@/components/docs-shell";
import { TableOfContents, RelatedDocs, useHeadings } from "@/components/table-of-contents";
import { DOCS } from "@/lib/docs";
import { getSectionLabelForSlug } from "@/lib/docs-nav";

interface DocPageClientProps {
  doc: (typeof DOCS)[number];
  prev: (typeof DOCS)[number] | undefined;
  next: (typeof DOCS)[number] | undefined;
}

export function DocPageClient({ doc, prev, next }: DocPageClientProps) {
  const headings = useHeadings(doc.body);
  const sectionLabel = getSectionLabelForSlug(doc.slug) ?? "Learn";
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DocsShell rightRail={headings.length > 0 ? <TableOfContents headings={headings} /> : undefined}>
      <article className="min-w-0">
        <header className="mb-8">
          {/* Breadcrumb matching Resend screenshot */}
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-neutral-400">
            <span>{sectionLabel}</span>
            <CaretRight size={12} className="text-neutral-500" />
            <span className="text-neutral-300">{doc.title}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {doc.title}
          </h1>

          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400 max-w-2xl">
            {doc.description}
          </p>

          {/* Action pills row matching Resend screenshot */}
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#141414] px-3 py-1.5 text-[12px] font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800"
              title="Copy page link"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <CaretDown size={11} className="text-neutral-500" />
            </button>
          </div>
        </header>

        {/* Content body */}
        <div className="docs-body text-[14px] leading-relaxed text-neutral-300 space-y-6">
          {doc.body}
        </div>

        {/* Resend Signature Floating "Ask a question..." AI bar at bottom of page */}
        <div className="mt-14">
          <div className="group relative flex items-center justify-between rounded-2xl border border-neutral-800 bg-[#121212] px-4 py-3.5 text-[13px] text-neutral-400 shadow-2xl shadow-black/60 transition-all hover:border-neutral-700">
            <span className="font-normal text-neutral-400">Ask a question...</span>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-[11px] text-neutral-500">
                Ctrl+I
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 transition-colors group-hover:bg-white group-hover:text-black">
                <ArrowUp size={12} weight="bold" />
              </span>
            </div>
          </div>
        </div>

        <RelatedDocs related={doc.related} allDocs={DOCS} />

        <nav
          aria-label="Document navigation"
          className="mt-12 flex items-stretch justify-between gap-4 border-t border-neutral-800/80 pt-6"
        >
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-neutral-800 bg-[#121212] px-4 py-3.5 transition-all hover:border-neutral-700 hover:bg-[#181818]"
            >
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <ArrowLeft size={12} aria-hidden className="transition-transform group-hover:-translate-x-0.5" />
                Previous
              </span>
              <span className="truncate text-sm font-semibold text-white">{prev.title}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex min-w-0 flex-1 flex-col items-end gap-1 rounded-2xl border border-neutral-800 bg-[#121212] px-4 py-3.5 text-right transition-all hover:border-neutral-700 hover:bg-[#181818]"
            >
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Next
                <ArrowRight size={12} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="truncate text-sm font-semibold text-white">{next.title}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      </article>
    </DocsShell>
  );
}
