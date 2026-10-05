import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "SUPPORT" | "ADMIN";
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DELETED";
  orgId?: string;
  twoFactorEnabled?: boolean;
};

/** Server-only: forward httpOnly session cookies to GET /v1/auth/me. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const jar = cookies().toString();
  try {
    const res = await fetch(`${base}/v1/auth/me`, {
      headers: { cookie: jar },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success: boolean; data?: SessionUser };
    return body.success ? (body.data ?? null) : null;
  } catch {
    return null;
  }
}
