"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Fade-and-rise on first viewport entry. Transform/opacity only; inert under reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = { "--reveal-delay": `${delay}ms`, animationDelay: `${delay}ms` } as CSSProperties;
  return <div ref={ref} className={`reveal ${className ?? ""}`} style={style}>{children}</div>;
}
