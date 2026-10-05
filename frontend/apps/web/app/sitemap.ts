import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_WEB_URL ?? "https://www.nairacloud.xyz").replace(/\/$/, "");
  const lastModified = new Date();
  const docPages: MetadataRoute.Sitemap = ["getting-started", "creating-an-instance", "ssh-access", "networking-firewall", "billing-subscriptions", "api-reference"].map((slug) => ({
    url: `${base}/docs/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/first-vps`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pricing`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/status`, lastModified, changeFrequency: "hourly", priority: 0.7 },
    ...docPages,
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/aup`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}