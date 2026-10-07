#!/usr/bin/env node
/**
 * DEV ONLY. Serves SAMPLE responses for the public endpoints the marketing
 * site reads, so pricing/stats/status sections render without the backend.
 * Prices and counts here are placeholders, not the real catalog.
 *
 *   npm run mock:api --workspace=@nairacloud/web      (port 3099)
 *   NEXT_PUBLIC_API_URL=http://localhost:3099 npm run dev:web
 */
import http from "node:http";

const PORT = Number(process.env.PORT ?? 3099);

const plan = (sortOrder, name, priceNgn, cpu, ramMb, storageGb, status = "ACTIVE") => ({
  id: `sample-${name.toLowerCase()}`,
  name,
  slug: name.toLowerCase(),
  description: null,
  cpu,
  ramMb,
  storageGb,
  priceNgn,
  status,
  sortOrder,
});

const now = Date.now();
const ROUTES = {
  "/v1/plans": [
    plan(0, "FREE", 0, 1, 512, 10),
    plan(1, "STARTER", 5000, 1, 1024, 25),
    plan(2, "BASIC", 9500, 2, 2048, 50),
    plan(3, "STANDARD", 18000, 2, 4096, 80),
    plan(4, "PRO", 36000, 4, 8192, 160, "LIMITED"),
  ],
  "/v1/public/stats": { activeInstances: 128, customers: 342, onlineNodes: 2 },
  "/v1/public/status": {
    overall: "operational",
    components: { api: "operational", payments: "operational", compute: "operational", networking: "operational", dashboard: "operational" },
    openIncidents: [],
    generatedAt: new Date(now).toISOString(),
  },
  "/v1/public/incidents": [
    {
      id: "sample-1",
      title: "Delayed provisioning on node 2",
      component: "compute",
      status: "RESOLVED",
      message: "New instances took up to 6 minutes to boot. Resolved after an agent restart.",
      startedAt: new Date(now - 9 * 864e5).toISOString(),
      resolvedAt: new Date(now - 9 * 864e5 + 42 * 6e4).toISOString(),
    },
  ],
};

http
  .createServer((req, res) => {
    const data = ROUTES[(req.url ?? "").split("?")[0]];
    res.writeHead(data ? 200 : 404, { "content-type": "application/json" });
    res.end(JSON.stringify(data ? { success: true, data } : { success: false, error: { code: "NOT_FOUND" } }));
  })
  .listen(PORT, () => console.log(`mock public API (sample data) on http://localhost:${PORT}`));
