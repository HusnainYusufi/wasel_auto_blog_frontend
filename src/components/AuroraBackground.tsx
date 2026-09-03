export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#ffffff_0%,#f2f8ff_45%,#e8f2ff_100%)]" />

      {/* Floating light-blue orbs */}
      <div className="animate-float absolute -left-40 top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(127,216,255,0.55),transparent_65%)] blur-3xl" />
      <div
        className="animate-drift absolute -right-32 top-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_60%_40%,rgba(98,174,255,0.45),transparent_65%)] blur-3xl"
        style={{ animationDelay: '-4s' }}
      />
      <div
        className="animate-float absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(196,224,255,0.6),transparent_65%)] blur-3xl"
        style={{ animationDelay: '-2.5s' }}
      />

      {/* Fine grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(36,112,221,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(36,112,221,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(85% 60% at 50% 20%, black 0%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(85% 60% at 50% 20%, black 0%, transparent 78%)',
        }}
      />
    </div>
  );
}
