"use client";

import { useEffect, useState } from "react";
import { PriceTag, EmptyState, TableSkeleton, Skeleton, CardSkeleton } from "@nairacloud/ui";
import { Download, FileText, Receipt } from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { DashCard, PageHeader } from "@/components/dashboard";

type Invoice = {
  id: string;
  number: string;
  amountNgn: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
};

type InvoicePdf =
  | { url: string }
  | { html: string; number?: string; amountNgn?: number; status?: string; dueDate?: string; paidAt?: string | null };

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-success/10 text-success",
  DUE: "bg-warning/10 text-warning",
  FAILED: "bg-danger/10 text-danger",
  VOID: "bg-surface text-text-muted",
};

function statusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "Paid";
    case "DUE":
      return "Due";
    case "FAILED":
      return "Failed";
    case "VOID":
      return "Void";
    default:
      return status;
  }
}

async function openInvoicePdf(id: string, mode: "view" | "download") {
  const data = await api().get(`/v1/billing/invoices/${id}/pdf`) as InvoicePdf;
  if ("url" in data && data.url) {
    if (mode === "download") {
      const a = document.createElement("a");
      a.href = data.url;
      a.download = "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
    return;
  }
  if ("html" in data && data.html) {
    const blob = new Blob([data.html], { type: "text/html" });
    const objectUrl = URL.createObjectURL(blob);
    if (mode === "download") {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${data.number ?? id}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } else {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
    return;
  }
  throw new Error("No invoice document returned");
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api().get("/v1/billing/invoices") as { items: Invoice[]; meta: { page: number; limit: number; total: number } };
        setInvoices(data.items ?? []);
      } catch (err) {
        console.error("Failed to load invoices", err);
        toast.error("Could not load invoices");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handlePdf = async (inv: Invoice, mode: "view" | "download") => {
    setBusyId(inv.id);
    try {
      await openInvoicePdf(inv.id, mode);
    } catch {
      toast.error(mode === "download" ? "Download failed" : "Could not open invoice");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={loading ? "" : "Invoices"}
        description={loading ? "" : "A complete history of your account charges, generated monthly."}
      />

      {loading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <TableSkeleton rows={8} columns={5} />
        </>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          body="Invoices appear after you pay for an instance or renew a subscription."
          icon={<Receipt size={32} />}
        />
      ) : (
        <DashCard padding={false} className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-faint text-[11px] font-medium uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-24 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-faint">
              {invoices.map((inv) => (
                <tr key={inv.id} className="group transition-colors hover:bg-surface-hover/50">
                  <td className="px-4 py-3.5 font-mono text-[13px] font-medium text-white">{inv.number}</td>
                  <td className="px-4 py-3.5 text-text-muted">
                    {new Date(inv.createdAt ?? inv.dueDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-white">
                    <PriceTag amount={inv.amountNgn} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${STATUS_TONE[inv.status] ?? "bg-surface text-text-muted"}`}>
                      {statusLabel(inv.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={busyId === inv.id}
                        onClick={() => void handlePdf(inv, "view")}
                        aria-label={`View ${inv.number}`}
                        className="press inline-flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-white disabled:opacity-50"
                      >
                        <FileText size={16} aria-hidden />
                      </button>
                      <button
                        type="button"
                        disabled={busyId === inv.id}
                        onClick={() => void handlePdf(inv, "download")}
                        aria-label={`Download ${inv.number}`}
                        className="press inline-flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-white disabled:opacity-50"
                      >
                        <Download size={16} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      )}
    </div>
  );
}
