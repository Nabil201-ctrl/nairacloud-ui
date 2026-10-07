import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button, PriceTag, cn } from "@nairacloud/ui";
import type { Plan } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export function isFeaturedPlan(p: Plan): boolean {
  return p.slug === "starter" || p.name.toLowerCase() === "starter";
}

function formatRam(mb: number): string {
  return mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`;
}

/** Marketing plan card (home teaser + /pricing). The deploy-wizard card is PlanCard in @nairacloud/ui. */
export function PricingCard({
  plan,
  featured = false,
}: {
  plan: Plan;
  featured?: boolean;
}) {
  const atCapacity = plan.status === "LIMITED";
  const specs = [
    {
      label: "vCPU",
      value: `${plan.cpu} ${plan.cpu === 1 ? "Core" : "Cores"}`,
    },
    { label: "Memory", value: formatRam(plan.ramMb) },
    { label: "Storage", value: `${plan.storageGb} GB NVMe` },
  ];

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl p-6 transition-colors",
        featured ? " border-accent/40" : "elev-panel hover:border-border-hover",
      )}
    >
      {featured && (
        <span
          aria-hidden
          className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        />
      )}

      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-text-secondary">
          {plan.name}
        </h3>
        {featured && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent">
            Recommended
          </span>
        )}
        {atCapacity && (
          <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning">
            Limited
          </span>
        )}
      </header>
      {plan.description && (
        <p className="mt-2 text-sm text-text-muted">{plan.description}</p>
      )}

      <p className="mt-6 flex items-baseline gap-1">
        <PriceTag
          amount={plan.priceNgn}
          className="text-[2rem] font-medium leading-none tracking-tight text-text"
        />
        <span className="text-sm text-text-muted">/mo</span>
      </p>

      <dl className="mb-8 mt-6 flex-1 divide-y divide-border-subtle border-y border-border-subtle font-mono text-[13px]">
        {specs.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-3">
            <dt className="text-text-muted">{s.label}</dt>
            <dd className="text-text">{s.value}</dd>
          </div>
        ))}
      </dl>

      <Button
        asChild
        variant={featured && !atCapacity ? "default" : "outline"}
        className={cn(
          "w-full rounded-full",
          !(featured && !atCapacity) && "bg-transparent",
        )}
      >
        <a href={WAITLIST_URL}>
          Join waitlist
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </Button>
    </article>
  );
}
