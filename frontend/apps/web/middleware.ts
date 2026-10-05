import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/", "/pricing", "/status", "/docs", "/terms", "/privacy", "/aup"];
const AUTH = ["/login", "/signup"];
const AUTHORIZED = ["/dashboard", "/onboarding", "/billing"];

/**
 * Docs are served at the root of their own domain. On the docs subdomain the
 * middleware maps:
 *   docs.nairacloud.xyz            -> /docs          (docs index)
 *   docs.nairacloud.xyz/ssh-access -> /docs/ssh-access
 * App-only top-level routes (pricing, auth, dashboard, legal) redirect to the
 * main site so a stray click lands somewhere useful.
 */
const DOCS_HOSTS = new Set(["docs.nairacloud.xyz"]);
const MAIN_BASE = process.env.NEXT_PUBLIC_WEB_URL ?? "https://www.nairacloud.xyz";

/**
 * Edge wall = session presence only (httpOnly cookies are opaque here).
 * Verification (PENDING_VERIFICATION) + onboarding + role gates run
 * server-side in layouts via GET /v1/auth/me — see dashboard/layout.tsx.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "");
  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

  const isDocsHost = DOCS_HOSTS.has(host);

  if (isDocsHost) {
    if (pathname === "/") return NextResponse.rewrite(new URL("/docs", req.url));
    if (pathname === "/docs" || pathname.startsWith("/docs/")) return NextResponse.next();
    const appRoute =
      AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
      AUTHORIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
      PUBLIC.some((p) => p !== "/" && p !== "/docs" && (pathname === p || pathname.startsWith(`${p}/`)));
    if (appRoute) {
      return NextResponse.redirect(new URL(`${pathname}${req.nextUrl.search}`, MAIN_BASE));
    }
    return NextResponse.rewrite(new URL(`/docs${pathname}`, req.url));
  }

  const authed = Boolean(req.cookies.get("nc_access"));

  if (AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (authed) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  // Verify page stays reachable without a session (backend enforces the OTP).
  if (pathname === "/verify-email" || pathname === "/forgot-password" || pathname === "/reset-password") return NextResponse.next();
  if (!authed && AUTHORIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };