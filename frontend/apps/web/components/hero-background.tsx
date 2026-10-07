import { GridBackdrop } from "./marketing/primitives";

/** Calm hero backdrop: fading line grid + one soft, static accent glow. No looping motion. */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <GridBackdrop />
      <div className="absolute -top-40 right-[-10%] h-[520px] w-[720px] rounded-full bg-accent/[0.07] blur-[120px]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
