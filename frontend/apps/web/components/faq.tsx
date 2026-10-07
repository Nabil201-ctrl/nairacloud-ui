import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@nairacloud/ui";

export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <Accordion type="single" collapsible defaultValue="faq-0" className="border-t border-border">
      {items.map((it, i) => (
        <AccordionItem key={it.q} value={`faq-${i}`} className="border-border">
          <AccordionTrigger className="py-5 text-left text-[15px] font-medium text-text hover:no-underline [&[data-state=open]]:text-text [&>svg]:text-text-muted">
            {it.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-[65ch] pb-5 text-[15px] leading-relaxed text-text-muted">{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
