import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { IBM_Plex_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", preload: false, weight: ["400", "500", "600", "700"] });
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap", preload: false, weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "NairaCloud — Your cloud.", template: "%s · NairaCloud" },
  description: "Naira-priced cloud instances with Paystack payments. Deploy and SSH in minutes. No dollar card required.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "https://www.nairacloud.xyz"),
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "NairaCloud",
    title: "NairaCloud — Your cloud.",
    description: "Naira pricing, Paystack checkout, servers online in minutes.",
    images: [{ url: "/og-image", width: 1200, height: 630, alt: "NairaCloud — Your cloud." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NairaCloud",
    description: "Your cloud.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased selection:bg-accent selection:text-accent-fg">
        <a href="#main" className="sr-only">Skip to content</a>
        <Providers>
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
