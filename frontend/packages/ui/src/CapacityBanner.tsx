export function CapacityBanner({ plan }: { plan: string }) {
  return (
    <div role="alert" className="rounded-sm border border-warning bg-surface px-4 py-3 text-sm text-text">
      {plan} — currently unavailable. Join the waitlist and we will notify you.
    </div>
  );
}
