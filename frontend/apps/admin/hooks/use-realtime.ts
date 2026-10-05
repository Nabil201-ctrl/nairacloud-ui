"use client";

import { useContext } from "react";
import { RealtimeContext, type ProbeProgressData } from "../components/realtime-provider";

export type { ProbeProgressData };

/**
 * Read the shared realtime socket from context. The socket itself lives in
 * <RealtimeProvider> so it survives route changes — call this hook from any
 * client component to get the live probe feed without reconnecting.
 */
export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within a <RealtimeProvider>");
  }
  return ctx;
}

/** Match a probe event to a node by DB id, IP, or raw id. */
export function eventMatchesNode(
  event: ProbeProgressData,
  node: { id: string; ip?: string | null },
): boolean {
  if (event.nodeDbId && event.nodeDbId === node.id) return true;
  if (node.ip && event.nodeId === node.ip) return true;
  return event.nodeId === node.id;
}