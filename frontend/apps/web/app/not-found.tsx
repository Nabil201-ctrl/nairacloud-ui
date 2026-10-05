import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <section className="mx-auto max-w-3xl px-4 py-28 text-center md:py-36">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tighter md:text-6xl">This page got lost between servers.</h1>
        <p className="mx-auto mt-4 max-w-[45ch] text-text-muted">The address is wrong or the page moved. Your instances are fine.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="press rounded-sm bg-accent px-6 py-3 font-semibold text-accent-fg hover:bg-accent-hover">Back home</a>
          <a href="/dashboard" className="press rounded-sm border border-border px-6 py-3 hover:border-border-hover">Go to dashboard</a>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
