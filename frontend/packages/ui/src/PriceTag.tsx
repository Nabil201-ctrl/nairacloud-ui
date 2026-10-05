export function formatNaira(amount: number): string {
  if (!Number.isFinite(amount)) return "₦0";
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function PriceTag({ amount, className }: { amount: number; className?: string }) {
  return <span className={className} style={{ fontFamily: "var(--font-mono)" }}>{formatNaira(amount)}</span>;
}
