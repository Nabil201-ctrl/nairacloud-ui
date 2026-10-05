"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X, Command } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { getDocsSearchIndex, type DocSearchResult } from "@/lib/docs-nav";

const SEARCH_INDEX = getDocsSearchIndex();

function filterResults(query: string): DocSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
  );
}

export function SearchBar({
  isMobile = false,
  className,
  enableShortcut = true,
}: {
  isMobile?: boolean;
  className?: string;
  enableShortcut?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = filterResults(query);

  const goTo = (href: string) => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    router.push(href);
  };

  useEffect(() => {
    if (!enableShortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const result = filteredResults[selectedIndex];
      if (result) goTo(result.href);
    } else if (e.key === "Enter" && filteredResults.length === 1) {
      e.preventDefault();
      goTo(filteredResults[0]!.href);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const resultsList = (
    <>
      {filteredResults.length > 0 ? (
        <ul role="listbox" className="py-1 max-h-60 overflow-y-auto">
          {filteredResults.map((result, index) => (
            <li key={result.href}>
              <button
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2 text-left text-[12px] transition-colors",
                  index === selectedIndex ? "bg-nav-active" : "hover:bg-nav-hover"
                )}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => goTo(result.href)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{result.title}</p>
                  <p className="text-[10px] text-text-muted truncate">{result.description}</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{result.section}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : query ? (
        <div className="px-4 py-4 text-center text-text-muted text-[12px]">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="px-4 py-4 text-center text-text-muted text-[12px]">
          Start typing to search...
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-nav-hover hover:text-text",
              className
            )}
            aria-label="Search documentation"
          >
            <MagnifyingGlass size={18} weight="duotone" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-md p-0" side="top">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <MagnifyingGlass
                size={14}
                weight="duotone"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="w-full bg-control border border-border px-10 py-2 pr-8 text-[13px] text-text placeholder:text-text-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  aria-label="Clear search"
                >
                  <X size={14} weight="duotone" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">{resultsList}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlass
          size={14}
          weight="duotone"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search docs..."
          className="w-full min-w-[12rem] max-w-sm bg-control border border-border pl-10 pr-14 py-2 text-[12px] text-text placeholder:text-text-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent hover:border-border-hover transition-colors"
          autoComplete="off"
          aria-label="Search documentation"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-text-muted">
          <Command size={10} /> K
        </span>
      </div>
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="bg-surface border border-border rounded-md shadow-lg overflow-hidden">
            {resultsList}
          </div>
        </div>
      )}
    </div>
  );
}
