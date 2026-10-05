import type { Metadata } from "next";
import { PriceTag, CapacityBanner } from "@nairacloud/ui";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Faq } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import { getPlans, formatSpecs } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Five NairaCloud plans, priced in naira. From free experiments to production boxes.",
  alternates: { canonical: "/pricing" },
};

const FAQ = [
  { q: "Why might a plan show as limited?", a: "We run a two-server cloud for now. Larger plans take a bigger slice of that capacity, so a plan may temporarily show as limited when hardware is full. Seats reopen as servers free up." },
  { q: "What happens if I exceed my plan?", a: "Nothing silently. Failed payments get a 3-day grace period, and plan changes apply right away with the new price on the next invoice." },
  { q: "Do you offer backups?", a: "Not yet — automated snapshots are on the roadmap. Today the reliable way to keep your data is your own: back files up with tar or rsync over SSH. That also survives a rebuild, whereas a rebuild alone wipes the disk." },
  { q: "What payment methods do you accept?", a: "Anything Paystack supports: Nigerian cards and bank transfers. Every charge is in naira with an invoice to match." },
];

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <>
      <SiteNav />
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-16 md:pt-24">
        <Reveal>
          <p className="eyebrow">Pricing</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tighter text-balance md:text-6xl">Five plans. Zero dollar math.</h1>
          <p className="mt-4 max-w-[55ch] text-lg text-text-muted">Every plan includes root SSH access and invoices in naira.</p>
        </Reveal>
        {plans ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {plans.map((p, i) => {
              const popular = p.slug === "starter" || p.name.toLowerCase() === "starter";
              const soldOut = p.status === "LIMITED";
              return (
                <Reveal key={p.id} delay={i * 60}>
                  <article className="card-lift flex h-full flex-col rounded-md border border-border bg-surface p-6" style={popular ? { borderColor: "var(--accent)" } : undefined}>
                    {popular && <span className="mb-3 inline-block w-fit rounded-sm bg-accent px-2 py-0.5 text-xs font-semibold text-accent-fg">Most popular</span>}
                    <h2 className="font-semibold">{p.name}</h2>
                    {p.description && <p className="mt-1 text-sm text-text-muted">{p.description}</p>}
                    <p className="mt-3"><PriceTag amount={p.priceNgn} className="text-3xl font-bold" /><span className="text-sm text-text-muted">/mo</span></p>
                    <p className="mt-2 font-mono text-xs text-text-muted">{formatSpecs(p)}</p>
                    <span className="flex-1" aria-hidden />
                    {soldOut ? (
                      <div className="mt-5"><CapacityBanner plan={p.name} /></div>
                    ) : (
                      <a href={WAITLIST_URL} className={`press mt-5 rounded-sm px-4 py-2 text-center text-sm font-semibold ${popular ? "bg-accent text-accent-fg hover:bg-accent-hover" : "border border-border hover:border-accent hover:text-accent"}`}>Join waitlist</a>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <p className="mt-12 rounded-md border border-border bg-surface p-6 text-sm text-text-muted">Live pricing is unreachable right now. Check the <a href="/status" className="text-accent">status page</a> or try again shortly.</p>
        )}
        <Reveal className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Questions, answered</h2>
          <div className="mt-4 border-t border-border"><Faq items={FAQ} /></div>
        </Reveal>
      </section>
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl">Start free. Upgrade when it hurts.</h2>
          <a href={WAITLIST_URL} className="press mt-6 inline-block rounded-sm bg-accent px-8 py-3.5 font-semibold text-accent-fg hover:bg-accent-hover">Join waitlist</a>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
