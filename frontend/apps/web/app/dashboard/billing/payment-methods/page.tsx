"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, CreditCard, Info } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashCard, LinkButton, PageHeader, PrimaryButton, SecondaryButton } from "@/components/dashboard";
import { ListSkeleton, Skeleton, CardSkeleton } from "@nairacloud/ui";

type PaymentMethod = {
  id: string;
  last4: string;
  cardType: string;
  bank: string | null;
  expMonth: string | null;
  expYear: string | null;
  isDefault: boolean;
  createdAt: string;
};

function brandLabel(cardType: string): string {
  const t = cardType.toLowerCase();
  if (t.includes("visa")) return "Visa";
  if (t.includes("master")) return "Mastercard";
  if (t.includes("verve")) return "Verve";
  return cardType || "Card";
}

function formatExp(month: string | null, year: string | null): string {
  if (!month || !year) return "—";
  const m = month.padStart(2, "0");
  const y = year.length === 4 ? year.slice(-2) : year;
  return `${m}/${y}`;
}

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api().get("/v1/billing/payment-methods") as PaymentMethod[];
      setCards(data ?? []);
    } catch (err) {
      console.error("Failed to load payment methods", err);
      toast.error("Could not load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const removeCard = async (id: string) => {
    try {
      await api().del(`/v1/billing/payment-methods/${id}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Payment method removed");
    } catch {
      toast.error("Remove failed");
    }
    setConfirmId(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={loading ? "" : "Payment Methods"}
        description={loading ? "" : "Cards saved by Paystack when you complete checkout. Full details never reach our servers."}
        actions={
          <PrimaryButton onClick={() => setShowAdd(true)} disabled={loading}>
            <Plus size={14} weight="bold" /> Add payment method
          </PrimaryButton>
        }
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <ListSkeleton items={6} />
        </>
      ) : (
        <DashCard padding={false} className="overflow-hidden">
          <ul className="divide-y divide-border-faint">
            {cards.map((card) => (
            <li key={card.id} className="flex flex-col justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface-hover/50 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border-subtle bg-surface text-text-muted">
                  <CreditCard size={20} weight="regular" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">
                    {brandLabel(card.cardType)} &bull;&bull;&bull;&bull; {card.last4}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-text-muted">Exp {formatExp(card.expMonth, card.expYear)}</span>
                    {card.bank && <span className="text-[11px] text-text-muted">{card.bank}</span>}
                    {card.isDefault && (
                      <span className="inline-flex items-center rounded-sm bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmId(card.id)}
                  aria-label={`Remove ${brandLabel(card.cardType)} ending in ${card.last4}`}
                  className="press inline-flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash size={16} />
                </button>
              </div>
            </li>
          ))}
          {cards.length === 0 && (
            <li className="px-4 py-8 text-center text-[13px] text-text-muted">
              No payment methods yet. Complete a Paystack checkout to save a card.
            </li>
          )}
        </ul>
      </DashCard>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" role="presentation">
          <button type="button" aria-label="Close" onClick={() => setShowAdd(false)} className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add payment method"
            className="relative w-full max-w-md overflow-hidden rounded-md border border-border-faint bg-card"
          >
            <div className="border-b border-border-faint px-5 py-4">
              <h2 className="text-[15px] font-medium text-white">Add Payment Method</h2>
              <p className="mt-1 text-[12px] text-text-muted">Cards are tokenized by Paystack during checkout</p>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3 rounded-md border border-border-faint bg-surface p-4">
                <Info size={18} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[13px] leading-relaxed text-text-muted">
                  We cannot capture card numbers in the dashboard. Pay a new instance invoice or fund your wallet — Paystack stores a reusable authorization on success, and the card appears here automatically.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border-faint px-5 py-4 sm:flex-row sm:justify-end">
              <SecondaryButton onClick={() => setShowAdd(false)}>Close</SecondaryButton>
              <LinkButton href="/dashboard/billing/wallet">Fund wallet</LinkButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Remove payment method?"
        body="If this is your default payment method, renewals may fail until another card is saved via checkout."
        confirmLabel="Remove card"
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) void removeCard(confirmId);
        }}
      />
    </div>
  );
}
