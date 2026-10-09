import type { ReactNode } from "react";
import { cn } from "@nairacloud/ui";

/** Marketing page width. One measure everywhere keeps edges aligned section to section. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small mono label above a heading. The green dot is the only accent in the block. */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted",
        className,
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div
        className={cn("max-w-3xl", centered && "flex flex-col items-center")}
      >
        {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
        <Heading
          className={cn(
            "text-balance font-semibold tracking-[-0.025em] text-text",
            Heading === "h1"
              ? "text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl"
              : "text-[2rem] leading-[1.06] sm:text-[2.6rem] md:text-[3.25rem]",
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Faint line grid that fades out from the top. Decorative only. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        "bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] bg-[size:56px_56px]",
        "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]",
        className,
      )}
    />
  );
}

/** "+" marker where a section hairline meets the rails. */
function Cross({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("absolute z-10 hidden h-[9px] w-[9px] lg:block", className)}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-text-muted" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-text-muted" />
    </span>
  );
}

/**
 * Framed section: content sits between two vertical hairline "rails" at the
 * container edges; sections stack with full-width hairlines between them.
 */
export function FrameSection({
  children,
  label,
  className,
  innerClassName,
  id,
}: {
  children: ReactNode;
  label?: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative border-b border-border", className)}>
      <div className="relative mx-auto w-full max-w-[1320px] border-x border-border">
        <Cross className="-left-[5px] -top-[5px]" />
        <Cross className="-right-[5px] -top-[5px]" />
        {label}
        <div className={cn("px-5 py-16 sm:px-10 md:py-20 lg:px-14", innerClassName)}>{children}</div>
      </div>
    </section>
  );
}

/** Section index row: `[ 01 / 06 ] · How it works`, with an accent tick on the rail. */
export function SectionLabel({ n, total, children }: { n: number; total: number; children: ReactNode }) {
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="relative flex items-center gap-3 border-b border-border px-5 py-4 font-mono text-[12px] uppercase tracking-[0.14em] text-text-muted sm:px-10 lg:px-14">
      <span aria-hidden className="absolute -left-px top-1/2 h-4 w-0.5 -translate-y-1/2 bg-accent" />
      <span>
        [ <span className="text-accent">{pad(n)}</span> / {pad(total)} ]
      </span>
      <span aria-hidden>·</span>
      <span>{children}</span>
    </div>
  );
}
