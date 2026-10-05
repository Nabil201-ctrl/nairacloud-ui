export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute left-[-10%] top-[-20%] h-[120%] w-[120%]">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[800px] -translate-x-1/2 animate-hero-glow rounded-full bg-accent/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute left-[calc(50%-2rem)] h-[150px] w-px animate-scan bg-gradient-to-b from-transparent via-accent to-transparent" />
        <div className="absolute left-[calc(50%+6rem)] h-[200px] w-px animate-scan-slow bg-gradient-to-b from-transparent via-accent to-transparent" />
      </div>
    </div>
  );
}
