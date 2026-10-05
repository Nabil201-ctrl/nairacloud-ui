/** Public (unauthenticated) API shapes. Envelope-unwrapped by the backend contract. */
export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
  status: "ACTIVE" | "LIMITED" | "DISABLED";
  sortOrder: number;
};

export type PublicStats = { activeInstances: number; customers: number; onlineNodes: number };

export type PublicStatus = {
  overall: "operational" | "degraded";
  components: Record<string, "operational" | "degraded" | "major_outage">;
  openIncidents: Incident[];
  generatedAt: string;
};

export type Incident = {
  id: string;
  title: string;
  component: string;
  status: string;
  message: string | null;
  startedAt: string;
  resolvedAt: string | null;
};

function base(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
}

async function getJSON<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${base()}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const body = (await res.json()) as { success: boolean; data?: T };
    return body.success ? (body.data ?? null) : null;
  } catch {
    return null;
  }
}

/** Homepage aggregate (5min cache). Plans catalog (5min cache). */
export const getPublicStats = (): Promise<PublicStats | null> => getJSON<PublicStats>("/v1/public/stats", 300);
export const getPlans = (): Promise<Plan[] | null> => getJSON<Plan[]>("/v1/plans", 300);
/** Status page (30s cache per backend). Incident history (5min cache). */
export const getPublicStatus = (): Promise<PublicStatus | null> => getJSON<PublicStatus>("/v1/public/status", 30);
export const getIncidents = (): Promise<Incident[] | null> => getJSON<Incident[]>("/v1/public/incidents", 300);

export function formatSpecs(p: Plan): string {
  const ram = p.ramMb >= 1024 ? `${p.ramMb / 1024}GB RAM` : `${p.ramMb}MB RAM`;
  return `${p.cpu} vCPU · ${ram} · ${p.storageGb}GB SSD`;
}
