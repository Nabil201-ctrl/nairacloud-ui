"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { DashCard, LinkButton, PrimaryButton } from "@/components/dashboard";

type Message = { author: "you" | "support"; at: string; text: string };
type Ticket = { id: string; subject: string; category: string; status: string; lastUpdateAt: string; messages: Message[] };

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const t = await api().get(`/v1/support/${params.id}`) as Ticket;
        setTicket(t ?? null);
      } catch (err) {
        console.error("Failed to load ticket", err);
      }
    };
    void load();
  }, [params.id]);

  if (!ticket) {
    return (
      <div className="space-y-3">
        <h1 className="text-[20px] font-medium tracking-tight text-white">Ticket not found</h1>
        <p className="text-[13px] text-text-muted">It may have been archived.</p>
        <LinkButton href="/dashboard/support" variant="secondary" className="mt-2">
          Back to tickets
        </LinkButton>
      </div>
    );
  }

  const send = async () => {
    if (!reply.trim()) return;
    try {
      await api().post(`/v1/support/${ticket.id}/reply`, { message: reply.trim() });
      const updated = await api().get(`/v1/support/${ticket.id}`) as Ticket;
      setTicket(updated ?? null);
      setReply("");
      toast.success("Replied");
    } catch (err) {
      toast.error("Reply failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/support" className="press inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-white">
        <ArrowLeft size={14} aria-hidden /> Tickets
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight text-white sm:text-[22px]">{ticket.subject}</h1>
          <p className="mt-1 text-[12px] text-text-muted">
            {ticket.category} · {ticket.id}
          </p>
        </div>
        <span className={`font-mono text-[12px] ${ticket.status === "open" ? "text-accent" : "text-text-muted"}`}>
          {ticket.status.toUpperCase()}
        </span>
      </div>

      <ul className="space-y-3">
        {ticket.messages.map((m, i) => (
          <li key={i} className={`flex ${m.author === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-md border px-4 py-3 ${
                m.author === "you" ? "border-border bg-surface" : "border-border-faint bg-card"
              }`}
            >
              <p className="text-[11px] text-text-muted">
                {m.author === "you" ? "You" : "NairaCloud support"} · {fmt(m.at)}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-white">{m.text}</p>
            </div>
          </li>
        ))}
      </ul>

      {ticket.status === "open" && (
        <DashCard>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Reply on the thread…"
            className="w-full resize-none rounded-sm border border-border bg-bg px-3 py-2 text-[13px] text-white focus:border-border-hover focus:outline-none"
          />
          <div className="mt-3 flex justify-end">
            <PrimaryButton onClick={() => void send()} disabled={!reply.trim()}>
              Send reply
            </PrimaryButton>
          </div>
        </DashCard>
      )}
      {ticket.status === "closed" && (
        <DashCard>
          <p className="text-center text-[12px] text-text-muted">
            This ticket is closed. Open a new one if the issue is still biting.
          </p>
        </DashCard>
      )}
    </div>
  );
}
