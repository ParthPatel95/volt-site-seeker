// Landing v2 motion primitives — one consistent animation language for the
// whole page, built on framer-motion and respecting prefers-reduced-motion.

import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, useMotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Frosted content panel ────────────────────────────────────────────────────
// All reading content sits on glass so the persistent 3D scene behind the
// page stays vivid without ever fighting the text. Strong blur + a high-
// opacity background tint is what makes long body copy readable over the
// busy scene; the border + shadow give the panel an edge against the sky.

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/70 bg-background/85 backdrop-blur-xl',
        'shadow-[0_8px_40px_-12px_rgb(0_0_0_/_0.15)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Scroll-choreographed reveal ──────────────────────────────────────────────

export function Reveal({
  children, delay = 0, y = 24, className,
}: {
  children: ReactNode; delay?: number; y?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container + child item, for grids/lists. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.65, 0.36, 1] as const } },
};

// ── Word-by-word headline reveal ─────────────────────────────────────────────

export function SplitWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.21, 0.65, 0.36, 1] }}
            aria-hidden="true"
          >
            {w}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── Count-up metric ──────────────────────────────────────────────────────────

export function CountUp({
  value, duration = 1.6, format = (n: number) => Math.round(n).toLocaleString(),
}: {
  value: number; duration?: number; format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? format(value) : format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setDisplay(format(value)); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(format(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, reduced]);

  return <span ref={ref} className="tabular-nums">{display}</span>;
}

// ── Magnetic hover (CTAs) ────────────────────────────────────────────────────

export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ── Cinematic photography ────────────────────────────────────────────────────
// One treatment for every real photo on the page so they read like film, not
// stock: a slow Ken-Burns push, a scroll-linked parallax drift, a fine grain
// layer that kills the "flat JPEG" look, and a wipe reveal on enter. The image
// is over-sized inside an overflow-clipped frame so neither the parallax nor
// the push ever exposes an edge. All motion is gated on prefers-reduced-motion.

// Tiling fractal-noise grain, inlined so it costs no request. Low opacity +
// overlay blend keeps photos photoreal rather than gritty.
const GRAIN_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/></svg>",
  );

type Grade = 'navy' | 'bottom' | 'none';

const GRADE_BG: Record<Grade, string> = {
  // Navy duotone wash — keeps the premium dark accent the brand leans on while
  // letting the real photo show through.
  navy:
    'linear-gradient(180deg, hsl(var(--watt-navy) / 0.15) 0%, hsl(var(--watt-navy) / 0.55) 60%, hsl(var(--watt-navy) / 0.92) 100%)',
  // Light-section legibility scrim, matched to the page background.
  bottom:
    'linear-gradient(to top, hsl(var(--background) / 0.85) 0%, transparent 55%)',
  none: 'transparent',
};

export function CinematicPhoto({
  src,
  alt,
  className,
  imgClassName,
  grade = 'none',
  parallax = 48,
  kenBurns = true,
  eager = false,
  children,
}: {
  src: string;
  alt: string;
  /** Frame classes — sizing, radius, ring, shadow live here. */
  className?: string;
  imgClassName?: string;
  /** Color-grade overlay baked over the photo. */
  grade?: Grade;
  /** Scroll parallax travel in px (image drifts ±parallax/2). 0 disables. */
  parallax?: number;
  kenBurns?: boolean;
  /** Set on above-the-fold imagery so it doesn't lazy-load. */
  eager?: boolean;
  /** Caption chips / labels layered over the photo. */
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  });
  // Drift the over-sized image against the scroll direction.
  const rawY = useTransform(scrollYProgress, [0, 1], [-parallax / 2, parallax / 2]);
  const y = useSpring(rawY, { stiffness: 90, damping: 30, mass: 0.4 });

  const animateMotion = !reduced;

  return (
    <motion.div
      ref={frameRef}
      className={cn('relative overflow-hidden', className)}
      initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
      whileInView={reduced ? undefined : { clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {/* Over-sized so parallax + push never reveal a frame edge. */}
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // Centred via positional offsets (not translate) so framer-motion's
        // x/y/scale transforms compose without clobbering the centering.
        className={cn(
          'absolute left-[-6%] top-[-10%] w-[112%] h-[120%] object-cover will-change-transform',
          imgClassName,
        )}
        style={animateMotion && parallax ? { y } : undefined}
        animate={
          animateMotion && kenBurns
            ? { scale: [1.0, 1.08, 1.0], x: ['0%', '-1.5%', '0%'] }
            : undefined
        }
        transition={
          animateMotion && kenBurns
            ? { duration: 24, repeat: Infinity, ease: 'easeInOut' }
            : undefined
        }
      />

      {/* Color grade */}
      {grade !== 'none' && (
        <div className="pointer-events-none absolute inset-0" style={{ background: GRADE_BG[grade] }} />
      )}

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: '160px 160px' }}
        aria-hidden="true"
      />

      {children}
    </motion.div>
  );
}

// ── 3D tilt card with glare ──────────────────────────────────────────────────

export function TiltCard({
  children, className, max = 7,
}: {
  children: ReactNode; className?: string; max?: number;
}) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 260, damping: 26 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 260, damping: 26 });
  const glare = useTransform(
    [mx, my],
    ([gx, gy]: number[]) =>
      `radial-gradient(420px circle at ${20 + gx * 60}% ${20 + gy * 60}%, hsl(var(--primary) / 0.12), transparent 65%)`,
  );

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
