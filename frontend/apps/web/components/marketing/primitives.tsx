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
            "text-balance font-semibold tracking-[-0.035em] text-text",
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
