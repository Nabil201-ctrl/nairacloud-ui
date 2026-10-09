import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button, PriceTag, cn } from "@nairacloud/ui";
import type { Plan } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export function isFeaturedPlan(p: Plan): boolean {
  return p.slug === "starter" || p.name.toLowerCase() === "starter";
}

const ram = (mb: number) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-3 xl:grid-cols-5",
};

/** Plans as bordered columns separated by hairlines (home teaser + /pricing). */
export function PricingGrid({ plans }: { plans: Plan[] }) {
  return (
    <div className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2", COLS[plans.length] ?? "lg:grid-cols-4")}>
      {plans.map((p) => {
        const featured = isFeaturedPlan(p);
        const limited = p.status === "LIMITED";
        const specs = [
          `${p.cpu} vCPU ${p.cpu === 1 ? "core" : "cores"}`,
          `${ram(p.ramMb)} memory`,
          `${p.storageGb} GB NVMe storage`,
          "Root SSH access",
        ];
        return (
          <article key={p.id} className={cn("relative flex flex-col", featured ? "bg-main" : "bg-card")}>
            {featured && <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent" />}

            <header className="border-b border-border p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium text-text">{p.name.charAt(0) + p.name.slice(1).toLowerCase()}</h3>
                {featured && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[12px] text-accent">Most popular</span>}
                {limited && <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[12px] text-warning">Limited</span>}
              </div>
              {p.description && <p className="mt-2 text-sm text-text-muted">{p.description}</p>}
            </header>

            <div className="border-b border-border p-6">
              <p className="flex items-baseline gap-1.5">
                <PriceTag amount={p.priceNgn} className="text-4xl font-medium tracking-tight text-text" />
                <span className="text-sm text-text-muted">/month</span>
              </p>
              <Button asChild variant={featured && !limited ? "default" : "secondary"} className="mt-6 w-full">
                <a href={WAITLIST_URL}>Join waitlist</a>
              </Button>
            </div>

            <ul className="flex-1 divide-y divide-border-subtle">
              {specs.map((s) => (
                <li key={s} className="flex items-center gap-3 px-6 py-3.5 text-sm text-text-secondary">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface">
                    <Check weight="bold" className="h-2.5 w-2.5 text-text-muted" aria-hidden />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
