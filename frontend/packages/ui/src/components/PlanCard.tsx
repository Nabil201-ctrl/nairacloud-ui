import { PriceTag } from "./PriceTag";

export type Plan = { id: string; name: string; price: number; cpu: string; ram: string; storage: string; disabled?: boolean; badge?: string };

export function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected?: boolean; onSelect?: (id: string) => void }) {
  return (
    <button
      type="button"
      disabled={plan.disabled}
      onClick={() => onSelect?.(plan.id)}
      className="rounded-md border border-border-faint bg-card p-4 text-left transition-colors duration-150 hover:border-border disabled:cursor-not-allowed disabled:opacity-50"
      style={selected ? { borderColor: "var(--accent)" } : undefined}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-text">{plan.name}</h3>
        {plan.badge ? (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">{plan.badge}</span>
        ) : null}
      </div>
      <p className="mt-2">
        <PriceTag amount={plan.price} className="text-[18px] font-medium text-text" />
      </p>
      <p className="mt-1 font-mono text-[11px] text-text-muted">
        {plan.cpu} · {plan.ram} · {plan.storage}
      </p>
    </button>
  );
}
