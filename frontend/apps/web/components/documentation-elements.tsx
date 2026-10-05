"use client";

import { cn } from "@nairacloud/ui";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        "text-[10px] font-semibold uppercase tracking-widest",
        "text-text-muted bg-surface border border-border rounded-[6px]",
        className
      )}
    >
      {children}
    </span>
  );
}

interface PageHeaderProps {
  title: string;
  className?: string;
}

export function PageHeader({ title, className }: PageHeaderProps) {
  return (
    <h1
      className={cn(
        "text-3xl sm:text-4xl font-bold tracking-tight text-text",
        "max-w-3xl",
        className
      )}
    >
      {title}
    </h1>
  );
}

interface PageDescriptionProps {
  description: string;
  className?: string;
}

export function PageDescription({ description, className }: PageDescriptionProps) {
  return (
    <p
      className={cn(
        "mt-4 text-base sm:text-lg leading-relaxed text-text-secondary",
        "max-w-3xl",
        className
      )}
    >
      {description}
    </p>
  );
}

interface ContentSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ id, children, className }: ContentSectionProps) {
  return (
    <section
      id={id}
      className={cn("py-8 sm:py-12 border-t border-border", className)}
    >
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}