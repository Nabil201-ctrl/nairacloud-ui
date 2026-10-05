import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Providers } from "@/components/providers";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = { title: "Admin · NairaCloud", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${mono.variable}`}>
      <body className="font-sans grain">
        <a href="#main" className="sr-only">Skip to content</a>
        <Providers>
          <AdminShell>
            {children}
          </AdminShell>
          <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: "var(--surface-hover)", border: "1px solid var(--border-hover)", color: "var(--text)" } }} />
        </Providers>
      </body>
    </html>
  );
}