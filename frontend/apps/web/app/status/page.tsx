import type { Metadata } from "next";
import { Timeline } from "@nairacloud/ui";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { getPublicStatus, getIncidents } from "@/lib/public";

export const metadata: Metadata = {
  title: "Status",
  description: "Live NairaCloud component health and incident history.",
  alternates: { canonical: "/status" },
};

const FRIENDLY: Record<string, string> = {
  "control-plane": "Control plane API",
  api: "API",
  payments: "Payments",
  compute: "Compute",
  networking: "Networking",
  dashboard: "Dashboard",
};

export default async function StatusPage() {
  const [status, incidents] = await Promise.all([getPublicStatus(), getIncidents()]);
  const ok = status?.overall === "operational";

  return (
    <>
      <SiteNav />
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 md:pt-24">
        <Reveal>
          <p className="eyebrow">Status</p>
          <h1 className="mt-6 text-4xl font-bold tracking-tighter md:text-6xl">System status</h1>
        </Reveal>
        <Reveal delay={80}>
          <div role="status" className="mt-8 flex items-center gap-3 rounded-md border border-border bg-surface px-5 py-4">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${status ? (ok ? "bg-accent dot-live" : "bg-warning") : "bg-text-muted"}`} />
            <p className="font-semibold">{!status ? "Live status unreachable" : ok ? "All systems operational" : "Degraded performance"}</p>
          </div>
          {!status && <p className="mt-3 text-sm text-text-muted">We could not reach the status endpoint. The platform may still be fine; try refreshing.</p>}
        </Reveal>
        {status && (
          <Reveal delay={120}>
            <h2 className="mt-12 text-xl font-bold">Components</h2>
            <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-surface">
              {Object.entries(status.components).map(([key, state]) => (
                <li key={key} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm font-medium">{FRIENDLY[key] ?? key}</span>
                  <span className="flex items-center gap-2 font-mono text-xs text-text-muted">
                    <span aria-hidden className={`h-2 w-2 rounded-full ${state === "operational" ? "bg-accent" : state === "degraded" ? "bg-warning" : "bg-danger"}`} />
                    {state.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-xs text-text-muted">Updated {new Date(status.generatedAt).toLocaleString("en-NG")}</p>
          </Reveal>
        )}
        <Reveal delay={160}>
          <h2 className="mt-12 text-xl font-bold">Incident history</h2>
          <div className="mt-4">
            {incidents && incidents.length > 0 ? (
              <Timeline items={incidents.map((i) => ({
                id: i.id,
                title: `${i.title} · ${i.status}`,
                at: new Date(i.startedAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }),
                ...(i.message ? { body: i.message } : {}),
              }))} />
            ) : (
              <p className="rounded-md border border-border bg-surface px-5 py-4 text-sm text-text-muted">No incidents recorded in the last 90 days.</p>
            )}
          </div>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}
