/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  // Required for instrumentation.ts on Next.js 14.x
  experimental: { instrumentationHook: true },
  async headers() {
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "",
      "https://js.paystack.co",
      "https://cdn.jsdelivr.net",
    ]
      .filter(Boolean)
      .join(" ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' http://localhost:3000 http://localhost:3002 https://api.nairacloud.xyz wss://api.nairacloud.xyz https://bot.nairacloud.xyz https:",
              "frame-src https://js.paystack.co https://checkout.paystack.com https://bot.nairacloud.xyz",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
