import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Public origin behind nginx; req.url is localhost:3003 in standalone. */
function publicOrigin(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const proto =
    (req.headers.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() ||
    "https";
  const host =
    (
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "admin.nairacloud.xyz"
    )
      .split(",")[0]
      ?.trim() || "admin.nairacloud.xyz";

  return `${proto}://${host}`;
}

function redirectTo(path: string, req: NextRequest) {
  return NextResponse.redirect(new URL(path, publicOrigin(req)));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, Next.js internal files, and favicon
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const hasAccessCookie = Boolean(req.cookies.get("nc_access"));

  // Standalone Admin Login route
  if (pathname === "/login") {
    if (hasAccessCookie) {
      return redirectTo("/", req);
    }
    return NextResponse.next();
  }

  // All other admin routes require nc_access session cookie
  if (!hasAccessCookie) {
    return redirectTo("/login", req);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
