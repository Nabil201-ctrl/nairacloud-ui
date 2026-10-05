import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-16 md:pt-24">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-6 text-4xl font-bold tracking-tighter md:text-5xl">{title}</h1>
        <p className="mt-3 font-mono text-xs text-text-muted">Last updated {updated}</p>
        <div className="mt-8 space-y-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_p]:mt-2 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-text-muted [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-[15px] [&_ul]:text-text-muted">
          {children}
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
