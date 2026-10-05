"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PageHead, Pill } from "@/components/ui";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-border/70 bg-surface/30 p-5">
      <h2 className="text-base font-bold text-text">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-muted">{children}</div>
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-border/60 bg-surface/70 px-1.5 py-0.5 font-mono text-[11px] text-text">
      {children}
    </code>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  );
}

const SECTIONS = [
  { id: "agent-releases", label: "Agent Releases & Redeploy" },
  { id: "nodes", label: "Nodes & Onboarding" },
  { id: "instances", label: "Instances & Capacity" },
  { id: "abuse", label: "Abuse & AUP" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export default function AdminDocsPage() {
  return (
    <div className="space-y-6">
      <PageHead
        title="Admin Docs"
        sub="Operator runbooks for the NairaCloud control plane: agent releases, node lifecycle, capacity safety, abuse handling and day-to-day troubleshooting."
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="h-fit space-y-1 rounded-xl border border-border/70 bg-surface/30 p-3">
          <p className="px-2 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
            On this page
          </p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block rounded-md px-2 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface/70 hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-4">
          <Section id="agent-releases" title="Agent Releases & Redeploy">
            <p>
              Every node runs the same Go node-agent binary. Releases are uploaded once to the control
              plane and streamed to hosts on demand, so a fleet-wide agent upgrade never touches customer
              instances.
            </p>
            <Bullets
              items={[
                <>
                  Build the binary: <Code>GOOS=linux GOARCH=amd64 go build -o nairacloud-node-agent ./apps/node-agent</Code> inside{" "}
                  <Code>backend/</Code>.
                </>,
                <>
                  Upload it under <Link href="/agent-releases" className="font-semibold text-accent hover:text-accent-hover">Agent Releases</Link> with a semver version. The
                  sha256 is computed in-browser and verified server-side.
                </>,
                <>
                  Mark a release <strong className="text-text">active</strong> so one-click updates default to it.
                </>,
                <>
                  On <Link href="/nodes" className="font-semibold text-accent hover:text-accent-hover">Nodes Hub</Link>, press{" "}
                  <strong className="text-text">Update Agent</strong> and pick the target version. The node shows{" "}
                  <Pill tone="accent">updating → vX</Pill> until the new agent heartbeats.
                </>,
              ]}
            />
            <p className="text-xs">
              Swap mechanics: the agent downloads the release over the HMAC-authenticated internal route, verifies
              sha256, runs a <Code>-check</Code> self-test, keeps the old binary as <Code>agent.prev</Code>, then
              re-execs itself in place (same PID and supervisor). Docker containers are never restarted, so customer
              uptime is untouched; only the agent&apos;s own API blips for under a second. If the swapped process fails
              to confirm a healthy heartbeat within <Code>AGENT_SWAP_TIMEOUT_SECONDS</Code> (default 90s), the watchdog
              restores the previous binary automatically.
            </p>
            <p className="text-xs">
              REST surface: <Code>GET/POST /v1/admin/agent-releases</Code>,{" "}
              <Code>POST /v1/admin/agent-releases/:id/activate</Code>,{" "}
              <Code>DELETE /v1/admin/agent-releases/:id</Code>,{" "}
              <Code>POST /v1/admin/nodes/:id/restart-agent</Code> (body: optional{" "}
              <Code>{'{ releaseId }'}</Code> or <Code>{'{ version }'}</Code>).
            </p>
          </Section>

          <Section id="nodes" title="Nodes & Onboarding">
            <Bullets
              items={[
                <>
                  <strong className="text-text">Onboard Node</strong> installs Docker and the agent over SSH, registers
                  the host and starts heartbeats. Credentials are stored AES-GCM encrypted and reused by{" "}
                  <strong className="text-text">Retry Onboard</strong>.
                </>,
                <>
                  <strong className="text-text">Drain</strong> stops new placements while existing instances keep
                  running. <strong className="text-text">Maintenance</strong> additionally pauses console tokens and
                  automation for the host.
                </>,
                <>
                  <strong className="text-text">Reconcile containers</strong> enumerates live Docker containers and
                  raises the node&apos;s allocated counters so the scheduler never sells capacity that is already in use.
                </>,
                <>
                  Statuses: <Pill tone="accent">ONLINE</Pill> healthy, <Pill tone="warn">DEGRADED</Pill> heartbeat
                  pressure, <Pill tone="danger">OFFLINE</Pill> missed heartbeats, plus{" "}
                  <Code>PROVISIONING</Code>, <Code>DRAINING</Code>, <Code>MAINTENANCE</Code>.
                </>,
              ]}
            />
          </Section>

          <Section id="instances" title="Instances & Capacity">
            <Bullets
              items={[
                "The scheduler only places instances on ONLINE, non-drained nodes with free CPU/RAM/storage headroom.",
                "Sales counters are reserved atomically at order time; failed provisioning releases the reservation automatically.",
                "Rebuild replaces a guest image in place and persists the same public port so customer SSH keys keep working.",
              ]}
            />
          </Section>

          <Section id="abuse" title="Abuse & AUP">
            <Bullets
              items={[
                "The abuse worker scans port-25 egress and other AUP violations every 5 minutes and files cases in the Abuse Queue.",
                "Agents block outbound SMTP/25 for managed containers, so offenders cannot relay mail from the platform.",
                "Resolving a case can suspend the offending instance, suspend the account, or terminate the account; every action is written to the Audit Trail.",
              ]}
            />
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <Bullets
              items={[
                <>
                  <strong className="text-text">Agent shows OFFLINE</strong> — check the node&apos;s 8443 reachability and
                  the agent service on the host; the control plane only mutates nodes over the HMAC agent API.
                </>,
                <>
                  <strong className="text-text">Update stuck on “updating”</strong> — the heartbeat never confirmed: the
                  watchdog rolls the host back automatically. Re-run the update after fixing the underlying issue.
                </>,
                <>
                  <strong className="text-text">sha256 mismatch on upload</strong> — the browser and server disagree on the
                  digest, so the upload was rejected. Re-download the binary and try again.
                </>,
                <>
                  <strong className="text-text">Capacity looks oversold</strong> — run{" "}
                  <Code>POST /v1/admin/nodes/:id/reconcile-containers</Code> to re-derive allocated counters from live
                  containers.
                </>,
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
