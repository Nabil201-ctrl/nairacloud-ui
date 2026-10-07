import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/marketing/motion";

const darkerGrotesque = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-darker-grotesque",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

/** MarketingLayout (FRONTEND_PLAN §1.1): public pages share nav, footer, Plus_Jakarta_Sans and motion settings. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${darkerGrotesque.variable} marketing min-h-[100dvh] overflow-x-clip bg-bg text-text antialiased selection:bg-accent/30 selection:text-text`}
    >
      <MotionProvider>
        <SiteNav />
        {children}
        <SiteFooter />
      </MotionProvider>
    </div>
  );
}
