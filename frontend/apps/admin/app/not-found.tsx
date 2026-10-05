import Link from "next/link";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 border border-danger/30 text-danger">
        <WarningCircle size={28} weight="bold" />
      </div>
      <h1 className="font-mono text-2xl font-bold tracking-tight text-text">404 — Endpoint Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        The administrative route or resource ID you requested does not exist in this control plane.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="press inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-xs font-bold text-accent-fg shadow-[0_0_15px_rgba(0,217,160,0.25)] hover:bg-accent-hover transition-all"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Return to Command Center</span>
        </Link>
      </div>
    </div>
  );
}
