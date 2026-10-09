import type { ReactNode } from "react";
import localFont from "next/font/local";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/marketing/motion";

// Host Grotesk is newer than Next 14's Google font list, so it is self-hosted (latin, variable 300–800).
const hostGrotesk = localFont({
  src: "./fonts/HostGrotesk-Variable.woff2",
  variable: "--font-host-grotesk",
  weight: "300 800",
  display: "swap",
});

/** MarketingLayout (FRONTEND_PLAN §1.1): public pages share nav, footer, Host Grotesk and motion settings. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${hostGrotesk.variable} marketing min-h-[100dvh] overflow-x-clip bg-bg text-text antialiased selection:bg-accent/30 selection:text-text`}>
      <MotionProvider>
        <SiteNav />
        {children}
        <SiteFooter />
      </MotionProvider>
    </div>
  );
}
