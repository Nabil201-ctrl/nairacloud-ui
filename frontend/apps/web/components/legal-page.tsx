import type { ReactNode } from "react";
import { Eyebrow } from "./marketing/primitives";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pb-24 pt-16 sm:px-8 md:pt-24">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-xs text-text-muted">Last updated {updated}</p>
      <div className="mt-10 space-y-10 border-t border-border pt-10 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-text-secondary [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[15px] [&_ul]:text-text-secondary">
        {children}
      </div>
    </article>
  );
}
