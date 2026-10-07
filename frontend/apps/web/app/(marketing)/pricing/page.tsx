import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@nairacloud/ui";
import { Faq } from "@/components/faq";
import { HeroBackground } from "@/components/hero-background";
import { CtaOrbit } from "@/components/marketing/cta-orbit";
import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { Container, SectionHeading } from "@/components/marketing/primitives";
import {
  PricingCard,
  isFeaturedPlan,
} from "@/components/marketing/pricing-card";
import { getPlans } from "@/lib/public";
import { WAITLIST_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Five NairaCloud plans, priced in naira. From free experiments to production boxes.",
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
      <section className="relative isolate">
        <HeroBackground />
        <Container className="pb-24 pt-14 sm:pt-20 lg:pt-24">
          <FadeIn>
            <SectionHeading
              as="h1"
              align="center"
              eyebrow="Pricing"
              title="Five plans. Zero dollar math."
              description="Every plan includes root SSH access and invoices in naira. Pay monthly through Paystack; change plans any time."
            />
          </FadeIn>

          {plans ? (
            <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {plans.map((p) => (
                <StaggerItem key={p.id}>
                  <PricingCard plan={p} featured={isFeaturedPlan(p)} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="elev-panel mx-auto mt-16 max-w-xl rounded-2xl p-6 text-center text-sm text-text-muted">
              Live pricing is unreachable right now. Check the{" "}
              <a
                href="/status"
                className="text-text underline underline-offset-4 hover:text-accent"
              >
                status page
              </a>{" "}
              or try again shortly.
            </p>
          )}

          <FadeIn delay={0.1}>
            <div className="elev-panel mt-6 rounded-3xl p-7 sm:p-9">
              <h2 className="text-lg font-medium tracking-tight text-text">
                Included in every plan
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                {INCLUDED.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2.5 text-[15px] text-text-secondary"
                  >
                    <CheckCircle
                      weight="fill"
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden
                    />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="border-y border-border bg-sidebar py-24 md:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Faq items={FAQ_ITEMS} />
          </FadeIn>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <FadeIn>
            <div className="bg-card relative isolate overflow-hidden rounded-[2rem] px-6 py-24 text-center sm:px-12">
              <CtaOrbit />
              <h2 className="text-balance text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                Start free. Upgrade when it hurts.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-text-secondary">
                Begin on the free plan and move up the moment your project needs
                it.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-9 h-12 rounded-full px-8 text-[15px]"
              >
                <a href={WAITLIST_URL}>Join the waitlist</a>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
