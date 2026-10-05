"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowSquareOut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { DashCard, PageHeader, PrimaryButton, SecondaryButton, LinkButton } from "@/components/dashboard";
import { Skeleton, GridSkeleton } from "@nairacloud/ui";

const FREESCOUT_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FREESCOUT_URL?.replace(/\/$/, "")) ||
  "https://support.nairacloud.xyz";

type Ticket = { id: string; subject: string; category: string; status: string; lastUpdateAt: string; messages: { author: "you" | "support"; at: string; text: string }[] };

const CATEGORIES = ["Billing", "Network", "Deployment", "Account", "Feature"];

const STATUS_TONE: Record<string, string> = { open: "text-accent", closed: "text-text-muted" };

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [category, setCategory] = useState("Billing");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api().get("/v1/support") as { items: Ticket[]; meta: { page: number; limit: number; total: number } };
        setTickets(data.items ?? []);
      } catch (err) {
        console.error("Failed to load tickets", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const openNew = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Give the ticket a subject and a description");
      return;
    }
    try {
      const t = await api().post("/v1/support", { category, subject: subject.trim(), body: body.trim() }) as Ticket;
      setSubject("");
      setBody("");
      setShowNew(false);
      router.push(`/dashboard/support/${t.id}`);
    } catch (err) {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={loading ? "" : "Support"}
        description={loading ? "" : "Open on WhatsApp, closed within the day. Anchored Nigerian time."}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <LinkButton
              href={FREESCOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              <ArrowSquareOut size={14} weight="bold" />
              Agent desk
            </LinkButton>
            <PrimaryButton onClick={() => setShowNew(true)} disabled={loading}>
              <Plus size={14} weight="bold" /> New ticket
            </PrimaryButton>
          </div>
        }
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <GridSkeleton items={6} cols={{ base: 1, sm: 2, lg: 3 }} />
        </>
      ) : tickets.length === 0 ? (
        <DashCard className="text-center">
          <p className="text-[13px] text-text-muted">No tickets yet.</p>
        </DashCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/support/${t.id}`}
              className="elev-1 transition-colors hover:border-border hover:bg-surface-hover/30"
            >
              <DashCard className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{t.subject}</p>
                    <p className="mt-1 text-[12px] text-text-muted">
                      {t.category} · {t.messages.length} message{t.messages.length === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-[12px] text-text-muted">
                      Updated {new Date(t.lastUpdateAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`font-mono text-[12px] ${STATUS_TONE[t.status]}`}>{t.status.toUpperCase()}</span>
                </div>
              </DashCard>
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button type="button" aria-label="Close" onClick={() => setShowNew(false)} className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="New support ticket"
            className="relative w-full max-w-md rounded-md border border-border-faint bg-card p-5"
          >
            <h2 className="text-[15px] font-medium text-white">New ticket</h2>
            <label className="mt-4 block">
              <span className="mb-1 block text-[13px] font-medium text-white">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-[13px] font-medium text-white">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's going on?"
                autoFocus
                className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-[13px] font-medium text-white">Description</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Include the hostname and what you tried."
                className="w-full resize-none rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <SecondaryButton onClick={() => setShowNew(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={() => void openNew()}>Open ticket</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
