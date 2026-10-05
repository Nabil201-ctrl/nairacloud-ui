"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowsClockwise, CheckCircle, CloudArrowUp, Trash, UploadSimple } from "@phosphor-icons/react";
import {
  EmptyState,
  Field,
  PageHead,
  Pill,
  RTable,
  TableSkeleton,
  btnGhost,
  btnPrimary,
  inputCls,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@/lib/api";

type AgentRelease = {
  id: string;
  version: string;
  sha256: string;
  sizeBytes?: number;
  fileName?: string;
  notes?: string;
  active: boolean;
  uploadedBy?: string;
  createdAt?: string;
};

async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytes(n?: number): string {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function when(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentReleasesPage() {
  const [releases, setReleases] = useState<AgentRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentRelease | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api().get<AgentRelease[]>("/v1/admin/agent-releases");
      setReleases(Array.isArray(rows) ? rows : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load agent releases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activeRelease = useMemo(() => releases.find((r) => r.active) ?? null, [releases]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Choose the agent binary first");
      return;
    }
    if (!version.trim()) {
      toast.error("Version is required (e.g. 0.2.0)");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("version", version.trim());
      if (notes.trim()) form.append("notes", notes.trim());
      form.append("sha256", await sha256Hex(file));
      const saved = await api().upload<AgentRelease>("/v1/admin/agent-releases", form);
      toast.success(`Stored agent release v${saved.version}`, {
        description: "Nodes can now be updated to it from the Compute Nodes page.",
      });
      setFile(null);
      setVersion("");
      setNotes("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (release: AgentRelease) => {
    setBusyId(release.id);
    try {
      await api().post(`/v1/admin/agent-releases/${release.id}/activate`, {});
      toast.success(`v${release.version} is now the active release`, {
        description: "One-click agent updates default to this version.",
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate release");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setBusyId(target.id);
    try {
      await api().del(`/v1/admin/agent-releases/${target.id}`);
      toast.success(`Deleted release v${target.version}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete release");
    } finally {
      setBusyId(null);
    }
  };

  const rows = releases.map((r) => [
    {
      v: (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-text">v{r.version}</span>
          {r.active ? <Pill tone="accent">active</Pill> : null}
        </span>
      ),
    },
    {
      v: (
        <span className="font-mono text-[11px] text-text-muted" title={r.sha256}>
          {r.sha256?.slice(0, 20)}…
        </span>
      ),
    },
    { v: <span className="text-sm text-text-muted">{bytes(r.sizeBytes)}</span> },
    { v: <span className="text-sm text-text-muted">{r.notes || "—"}</span> },
    { v: <span className="text-sm text-text-muted">{when(r.createdAt)}</span> },
    {
      v: (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={r.active || busyId === r.id}
            onClick={() => void handleActivate(r)}
            className="press inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-accent/50 hover:text-accent disabled:opacity-40"
          >
            <CheckCircle size={12} weight="bold" />
            Make active
          </button>
          <button
            type="button"
            disabled={r.active || busyId === r.id}
            onClick={() => setDeleteTarget(r)}
            title={r.active ? "Activate another release first" : "Delete this release"}
            className="press inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-danger/50 hover:text-danger disabled:opacity-40"
          >
            <Trash size={12} weight="bold" />
            Delete
          </button>
        </div>
      ),
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHead
        title="Agent Releases"
        sub="Versioned node-agent binaries. Upload once, then roll every host forward from Compute Nodes with a single in-place swap — customer instances keep running throughout."
        actions={
          <button type="button" onClick={() => void load()} title="Refresh releases" className={btnGhost}>
            <ArrowsClockwise size={14} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      <div className="rounded-xl border border-border/70 bg-surface/30 p-5">
        <h2 className="text-sm font-bold text-text">How a smooth agent update works</h2>
        <ol className="mt-3 grid gap-3 text-sm text-text-muted sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-lg border border-border/50 bg-surface/40 p-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">01 · Upload</span>
            <p className="mt-1.5 leading-relaxed">
              Store a linux/amd64 agent binary here. The sha256 is computed in your browser and verified
              server-side before anything is stored.
            </p>
          </li>
          <li className="rounded-lg border border-border/50 bg-surface/40 p-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">02 · Push</span>
            <p className="mt-1.5 leading-relaxed">
              “Update Agent” on a node sends an HMAC-signed redeploy command. The agent downloads the
              release over the same authenticated channel.
            </p>
          </li>
          <li className="rounded-lg border border-border/50 bg-surface/40 p-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">03 · Swap</span>
            <p className="mt-1.5 leading-relaxed">
              The agent verifies sha256, self-checks the new binary, keeps the old one as
              <span className="font-mono"> .prev</span> and re-execs itself in place — same PID, same
              supervisor, containers untouched.
            </p>
          </li>
          <li className="rounded-lg border border-border/50 bg-surface/40 p-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">04 · Confirm</span>
            <p className="mt-1.5 leading-relaxed">
              The first healthy heartbeat confirms the new version. No heartbeat within 90s and the
              watchdog restores the previous binary automatically.
            </p>
          </li>
        </ol>
        <p className="mt-3 text-xs text-text-muted">
          Full runbook:{" "}
          <Link href="/docs#agent-releases" className="font-semibold text-accent hover:text-accent-hover">
            Admin Docs → Agent Releases &amp; Redeploy
          </Link>
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-surface/30 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-text">
          <UploadSimple size={16} weight="bold" className="text-accent" />
          Upload a release
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Field label="Agent binary (linux/amd64)" hint="max 128 MB">
            <input
              type="file"
              accept=".bin,application/octet-stream,application/executable"
              onChange={(e) => {
                const picked = e.target.files?.[0] ?? null;
                setFile(picked);
                if (picked && !version.trim()) {
                  const m = picked.name.match(/(\d+\.\d+\.\d+)/);
                  setVersion(m?.[1] ?? "");
                }
              }}
              className="w-full rounded-md border border-border/70 bg-surface/60 px-3.5 py-2 text-sm text-text file:mr-3 file:rounded file:border-0 file:bg-accent/15 file:px-3 file:py-1 file:font-mono file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:text-accent"
            />
          </Field>
          <Field label="Version" hint="semver, e.g. 0.2.0">
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="0.2.0"
              className={inputCls}
            />
          </Field>
          <Field label="Release notes" hint="optional">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="SMTP-25 enforcement, per-instance metrics, self-updater"
              className={inputCls}
            />
          </Field>
          <div className="flex items-end">
            <button type="button" disabled={uploading || !file || !version.trim()} onClick={() => void handleUpload()} className={btnPrimary}>
              <CloudArrowUp size={15} weight="bold" />
              {uploading ? "Uploading…" : "Upload release"}
            </button>
          </div>
        </div>
        {file ? (
          <p className="mt-3 font-mono text-[11px] text-text-muted">
            {file.name} · {bytes(file.size)} · sha256 verified in-browser before upload
          </p>
        ) : null}
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : releases.length === 0 ? (
        <EmptyState
          icon={<CloudArrowUp size={30} />}
          title="No agent releases yet"
          description="Upload the node-agent binary above, mark it active, then use “Update Agent” on any node to roll it out without touching running instances."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">
            One-click updates currently target{" "}
            <span className="font-mono font-bold text-text">v{activeRelease?.version ?? "— (latest upload)"}</span>
            .
          </p>
          <RTable
            head={["Version", "SHA-256", "Size", "Notes", "Uploaded", "Actions"]}
            colSizes={["14%", "20%", "8%", "24%", "14%", "20%"]}
            rows={rows}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete release v${deleteTarget?.version ?? ""}?`}
        body="The stored binary is removed from the control plane. Nodes already running it keep working; they simply lose their rollback target until a new release is uploaded."
        confirmLabel="Delete release"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
