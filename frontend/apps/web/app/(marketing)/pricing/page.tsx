import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@nairacloud/ui";
import { Faq } from "@/components/faq";
import { HeroBackground } from "@/components/hero-background";
import { CtaOrbit } from "@/components/marketing/cta-orbit";
import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { FrameSection, SectionHeading, SectionLabel } from "@/components/marketing/primitives";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { getPlans } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Five NairaCloud plans, priced in naira. From free experiments to production boxes.",
  alternates: { canonical: "/pricing" },
};

const INCLUDED = [
  "Root SSH access",
  "Ubuntu or Debian images",
  "NVMe storage",
  "Live usage metrics",
  "Browser console",
  "Invoices in naira",
  "3-day payment grace period",
  "Support from the people who run the servers",
];

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <>
      <FrameSection innerClassName="relative isolate overflow-hidden pb-20 pt-16 sm:pt-24">
        <HeroBackground />
        <FadeIn>
          <SectionHeading
            as="h1"
            align="center"
            title="Five plans. Zero dollar math."
            description="Every plan includes root SSH access and invoices in naira. Pay monthly through Paystack; change plans any time."
          />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-16">
          {plans ? (
            <PricingGrid plans={plans} />
          ) : (
            <p className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 text-center text-sm text-text-muted">
              Live pricing is unreachable right now. Check the{" "}
              <a href="/status" className="text-text underline underline-offset-4 hover:text-accent">
                status page
              </a>{" "}
              or try again shortly.
            </p>
          )}
        </FadeIn>
      </FrameSection>

      <FrameSection label={<SectionLabel n={1} total={2}>Every plan</SectionLabel>}>
        <FadeIn>
          <SectionHeading title="Included in every plan" description="No add-ons to unlock the basics." />
        </FadeIn>
        <Stagger className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((it) => (
            <StaggerItem key={it} className="flex items-start gap-3 bg-card p-6 text-[15px] text-text-secondary">
              <CheckCircle weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
              {it}
            </StaggerItem>
          ))}
        </Stagger>
      </FrameSection>

      <FrameSection label={<SectionLabel n={2} total={2}>FAQ</SectionLabel>}>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading title="Questions, answered" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Faq items={FAQ_ITEMS} />
          </FadeIn>
        </div>
      </FrameSection>

      <FrameSection innerClassName="relative isolate overflow-hidden py-28 text-center md:py-36">
        <CtaOrbit />
        <FadeIn>
          <h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Start free. Upgrade when it hurts.</h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-text-secondary">Begin on the free plan and move up the moment your project needs it.</p>
          <Button asChild size="lg" className="mt-9">
            <a href={WAITLIST_URL}>Join the waitlist</a>
          </Button>
        </FadeIn>
      </FrameSection>
    </>
  );
}
