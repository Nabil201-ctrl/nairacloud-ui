"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";
import { EASE } from "./motion";

const DOLLAR = [
  "Hunt for a card that accepts dollar charges",
  "Pay an FX markup on every renewal",
  "Card declined at renewal, server at risk",
  "Invoices in a currency you don't earn",
];
const NAIRA = [
  "Pay with Nigerian cards or bank transfer",
  "One price in naira, every month",
  "3-day grace period before anything is suspended",
  "Invoices in naira, ready for your records",
];

function Column({
  title,
  tag,
  items,
  good,
}: {
  title: string;
  tag: string;
  items: string[];
  good: boolean;
}) {
  const Icon = good ? CheckCircle : XCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay: good ? 0.15 : 0 }}
      className={cn(
        "relative rounded-3xl p-7 sm:p-9",
        good ? "" : "elev-panel",
      )}
    >
      {good && (
        <span
          aria-hidden
          className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        />
      )}
      <p
        className={cn(
          "font-mono text-[11px] uppercase tracking-[0.16em]",
          good ? "text-accent" : "text-text-muted",
        )}
      >
        {tag}
      </p>
      <h3
        className={cn(
          "mt-3 text-2xl font-medium tracking-tight",
          good ? "text-text" : "text-text-secondary",
        )}
      >
        {title}
      </h3>
      <ul className="mt-8 space-y-4">
        {items.map((it, i) => (
          <motion.li
            key={it}
            initial={{ opacity: 0, x: good ? 12 : -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              ease: EASE,
              delay: 0.3 + i * 0.12 + (good ? 0.2 : 0),
            }}
            className="flex items-start gap-3 text-[15px]"
          >
            <Icon
              weight="fill"
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                good ? "text-accent" : "text-danger/70",
              )}
              aria-hidden
            />
            <span
              className={
                good
                  ? "text-text"
                  : "text-text-muted line-through decoration-text-disabled/60"
              }
            >
              {it}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function NairaCompare() {
  return (
    <div className="relative grid gap-4 lg:grid-cols-2">
      <Column
        tag="Dollar-billed cloud"
        title="Two bills: the server and the exchange rate."
        items={DOLLAR}
        good={false}
      />
      <Column
        tag="NairaCloud"
        title="One bill, in the currency you earn."
        items={NAIRA}
        good
      />
      <span
        aria-hidden
        className="bg-card absolute left-1/2 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[11px] text-text-muted lg:flex"
      >
        vs
      </span>
    </div>
  );
}
