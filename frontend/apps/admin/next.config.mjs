/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  // Required for instrumentation.ts on Next.js 14.x
  experimental: { instrumentationHook: true },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://api:3000';
    return [{ source: "/v1/:path*", destination: `${apiUrl}/v1/:path*` }];
  },
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nairacloud.xyz';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://api.nairacloud.xyz';
    const wsSecure = wsUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    // Next.js webpack HMR/eval needs unsafe-eval in development only.
    const scriptSrc =
      process.env.NODE_ENV === "production"
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              `connect-src 'self' ${apiUrl} ${wsUrl} ${wsSecure} https: wss:`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
