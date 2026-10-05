import { NextResponse } from "next/server";
import { ogSvg } from "@/lib/og-svg";

export const dynamic = "force-static";

export function GET() {
  return new NextResponse(ogSvg(), { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800" } });
}