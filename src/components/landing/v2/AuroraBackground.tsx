// Fixed full-page backdrop for the landing: drifting aurora gradients over a
// faint engineering grid. Pure CSS animation (transform/opacity only — GPU
// composited, no layout/paint), disabled under prefers-reduced-motion via the
// motion-reduce variants.

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background" aria-hidden="true">
      {/* Engineering grid — lighter on light mode so it reads as a hint, not noise */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border) / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.55) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      {/* Aurora blobs — softer opacity for the light scheme so the page reads as airy */}
      <div
        className="absolute -top-40 -left-32 w-[44rem] h-[44rem] rounded-full blur-3xl opacity-30 motion-safe:animate-aurora-1 motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 65%)' }}
      />
      <div
        className="absolute top-1/4 -right-48 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-25 motion-safe:animate-aurora-2 motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--watt-trust) / 0.32), transparent 65%)' }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20 motion-safe:animate-aurora-3 motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--watt-bitcoin) / 0.28), transparent 65%)' }}
      />
      {/* Vignette to keep edges calm */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}
