import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NairaCloud — Join the waitlist",
  description:
    "Serious cloud for Nigeria. Pay in naira, deploy in minutes. Join the waitlist for early access.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://join.nairacloud.xyz",
  ),
  icons: { icon: "/icon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "NairaCloud — Join the waitlist",
    description: "Cloud priced in naira. Paystack checkout. Early access is opening soon.",
    siteName: "NairaCloud",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NairaCloud — Join the waitlist",
    description: "Cloud priced in naira. Paystack checkout. Early access is opening soon.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e2024",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-bg font-sans text-text antialiased selection:bg-accent selection:text-accent-fg">
        {children}
      </body>
    </html>
  );
}
