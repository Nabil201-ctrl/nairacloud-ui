import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? "https://www.nairacloud.xyz").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Waitlist/testing: keep authenticated app surfaces out of the index.
        disallow: [
          "/dashboard/",
          "/login/",
          "/signup/",
          "/onboarding/",
          "/verify-email/",
          "/forgot-password/",
          "/reset-password/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
