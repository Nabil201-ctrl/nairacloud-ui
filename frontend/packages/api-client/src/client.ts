export type ApiErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "CSRF_REJECTED" | "EMAIL_UNVERIFIED" | "INVALID_CREDENTIALS" | "OTP_INVALID" | "OTP_EXPIRED" | "NO_CAPACITY" | "PAYMENT_REQUIRED" | "HOSTNAME_TAKEN" | "SUSPENDED" | "NOT_RUNNING" | "RATE_LIMITED" | "UNKNOWN";

export type ApiEnvelope<T> = { success: true; data: T; meta?: { page: number; limit: number; total: number; totalPages: number }; requestId: string } | { success: false; error: { code: string; message: string; details?: unknown }; requestId: string };

export class ApiError extends Error {
  code: ApiErrorCode;
  requestId: string;
  constructor(code: ApiErrorCode, message: string, requestId: string) {
    super(message);
    this.code = code;
    this.requestId = requestId;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1] as string) : null;
}

/** In-memory CSRF fallback when the cookie Domain is not readable on this origin. */
let csrfToken: string | null = null;

function rememberCsrf(res: Response): void {
  const header = res.headers.get("X-CSRF-Token");
  if (header) csrfToken = header;
}

function currentCsrf(): string | null {
  return readCookie("nc_csrf") ?? csrfToken;
}

const MUTATING = new Set(["POST", "PATCH", "PUT", "DELETE"]);
let refreshing: Promise<void> | null = null;

async function doRefresh(base: string): Promise<void> {
  if (!refreshing) {
    refreshing = fetch(`${base}/v1/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res) => {
        rememberCsrf(res);
      })
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });
  }
  await refreshing;
}

export function createClient(base: string) {
  async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
    const method = (init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers);
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    // Multipart bodies must keep the browser-generated boundary header.
    if (!isFormData) headers.set("Content-Type", "application/json");
    if (MUTATING.has(method)) {
      const csrf = currentCsrf();
      if (csrf) headers.set("X-CSRF-Token", csrf);
    }
    const res = await fetch(`${base}${path}`, { ...init, method, headers, credentials: "include" });
    rememberCsrf(res);
    const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (body && body.success) return body.data;
    const code = (body && !body.success ? body.error.code : "UNKNOWN") as ApiErrorCode;
    if (res.status === 401 && code === "UNAUTHORIZED" && !retried) {
      await doRefresh(base);
      return request<T>(path, init, true);
    }
    // Cross-origin setups can lose the readable CSRF cookie (or the in-memory
    // token) after a full navigation. /v1/auth/refresh issues a fresh token in
    // both the cookie and X-CSRF-Token header, so retry the call with it.
    if (
      res.status === 403 &&
      code === "CSRF_REJECTED" &&
      !retried &&
      MUTATING.has(method)
    ) {
      await doRefresh(base);
      return request<T>(path, init, true);
    }
    throw new ApiError(code, (body && !body.success ? body.error.message : res.statusText) || "Request failed", (body?.requestId ?? ""));
  }
  return {
    get: <T>(p: string) => request<T>(p),
    post: <T>(p: string, json?: unknown) => request<T>(p, { method: "POST", body: JSON.stringify(json ?? {}) }),
    patch: <T>(p: string, json?: unknown) => request<T>(p, { method: "PATCH", body: JSON.stringify(json ?? {}) }),
    del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
    upload: <T>(p: string, form: FormData) => request<T>(p, { method: "POST", body: form }),
  };
}
