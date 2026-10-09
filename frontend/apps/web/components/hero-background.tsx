import { GridBackdrop } from "./marketing/primitives";

/** Calm hero backdrop: fading line grid. No glow, no looping motion. */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <GridBackdrop />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
