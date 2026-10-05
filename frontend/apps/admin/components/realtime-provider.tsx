"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

export type ProbeProgressData = {
  nodeId: string;
  nodeDbId?: string;
  nodeName?: string;
  step: string;
  cmd?: string;
  out?: string;
  code?: number;
  aiInput?: string;
  aiReason?: string;
  aiSource?: "groq" | "pattern";
  timestamp: string;
};

type RealtimeContextValue = {
  isConnected: boolean;
  probeProgress: ProbeProgressData[];
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearProbeProgress: () => void;
};

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * Persistent WebSocket provider. The probe/onboard live feed must survive
 * route changes: a user can open the onboard modal, step away to the node
 * detail page, then come back, and the stream must still be connected.
 *
 * Mounting useRealtime() per-component disconnected the socket on every
 * unmount, so navigating away from a running probe killed the feed and
 * restarting it on return made the page feel like it reset.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [probeProgress, setProbeProgress] = useState<ProbeProgressData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // nc_access is httpOnly, so JavaScript often cannot read it. The socket
    // still authenticates: the browser sends the cookie to the API host.
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("nc_access="))
      ?.split("=")[1];

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
    const socket = io(`${wsUrl}/ws`, {
      ...(token ? { auth: { token } } : {}),
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    socket.on("node.probe.progress", (data: ProbeProgressData) => {
      setProbeProgress((prev) => {
        const next = [...prev, data];
        return next.length > 300 ? next.slice(-300) : next;
      });
    });

    socket.on("error", (err: { message?: string } | string) => {
      setError(typeof err === "string" ? err : err?.message || "WebSocket error");
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const clearProbeProgress = useCallback(() => {
    setProbeProgress([]);
  }, []);

  // Connect once on mount; the socket then lives for the lifetime of the
  // app shell, so probe feeds keep streaming across route changes.
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const value = useMemo(
    () => ({ isConnected, probeProgress, error, connect, disconnect, clearProbeProgress }),
    [isConnected, probeProgress, error, connect, disconnect, clearProbeProgress],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}