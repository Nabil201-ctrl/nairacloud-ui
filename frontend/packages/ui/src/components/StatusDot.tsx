import { cn } from "../lib/utils";

export type InstanceStatus = "Running" | "Stopped" | "Error" | "Suspended" | "Creating" | "Paused";

const DOT: Record<InstanceStatus, string> = {
  Running: "bg-accent",
  Stopped: "bg-text-muted",
  Error: "bg-danger",
  Suspended: "bg-warning",
  Creating: "bg-info",
  Paused: "bg-warning",
};

function normalizeStatus(status: string): InstanceStatus {
  const key = status.trim().toUpperCase().replace(/[\s-]+/g, "_");
  switch (key) {
    case "RUNNING":
    case "ACTIVE":
      return "Running";
    case "STOPPED":
    case "STOPPING":
      return "Stopped";
    case "ERROR":
    case "FAILED":
      return "Error";
    case "SUSPENDED":
      return "Suspended";
    case "PAUSED":
      return "Paused";
    case "CREATING":
    case "PROVISIONING":
    case "PENDING":
      return "Creating";
    case "RUNNING_UI":
      return "Running";
    default: {
      const titled = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (titled in DOT) return titled as InstanceStatus;
      return "Stopped";
    }
  }
}

export function StatusDot({ status, className }: { status: InstanceStatus | string; className?: string }) {
  const normalized = normalizeStatus(status);
  const pulse = normalized === "Running" || normalized === "Creating" ? "dot-live" : "";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", DOT[normalized], pulse)} />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-muted">{normalized}</span>
    </span>
  );
}
