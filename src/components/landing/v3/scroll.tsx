// Scroll-choreography primitives shared by every cinematic chapter so the
// whole page speaks one motion language. Built on framer-motion's scroll
// utilities; all of them no-op gracefully under prefers-reduced-motion.

import { type ReactNode, type RefObject, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// Re-export the v2 motion vocabulary so chapters import everything from here.
export { Reveal, SplitWords, CountUp, Magnetic, TiltCard, GlassPanel, staggerContainer, staggerItem } from '../v2/motion';

/** 0→1 progress of an element travelling through the viewport. */
export function useElementProgress(
  ref: RefObject<HTMLElement>,
  offset: ['start end' | 'start start' | 'start center', 'end start' | 'center start' | 'end end'] = ['start end', 'end start'],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as never });
  return scrollYProgress;
}

// ── Parallax ─────────────────────────────────────────────────────────────────
// Translates its child on the cross-scroll axis as the section moves through
// the viewport. `speed` is the total travel in px across the full pass;
// negative moves opposite the scroll.

export function Parallax({
  children,
  speed = 80,
  axis = 'y',
  className,
}: {
  children: ReactNode;
  speed?: number;
  axis?: 'x' | 'y';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const raw = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const value = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : (axis === 'y' ? { y: value } : { x: value })}>
        {children}
      </motion.div>
    </div>
  );
}

// ── Pinned cinematic chapter ─────────────────────────────────────────────────
// A tall scroll runway whose inner content sticks to the viewport while you
// scroll past it. The render-prop hands you a 0→1 progress MotionValue so the
// chapter can choreograph scale / opacity / cross-fades against the scroll.
//   <PinnedChapter heightVh={260}>{(p) => <Scene progress={p} />}</PinnedChapter>

export function PinnedChapter({
  children,
  heightVh = 240,
  className,
  innerClassName,
}: {
  children: (progress: MotionValue<number>) => ReactNode;
  heightVh?: number;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <div ref={ref} className={cn('relative', className)} style={{ height: `${heightVh}vh` }}>
      <div className={cn('sticky top-0 h-screen overflow-hidden', innerClassName)}>
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

// ── Scroll-scrubbed value helpers (for use inside PinnedChapter) ──────────────

export function useScrub(
  progress: MotionValue<number>,
  input: number[],
  output: number[],
) {
  return useTransform(progress, input, output);
}

// ── Full-bleed cinematic band with a parallaxed background layer ──────────────

export function CinematicBand({
  children,
  background,
  className,
  overlayClassName = 'bg-gradient-to-b from-watt-navy/70 via-watt-navy/40 to-watt-navy/80',
}: {
  children: ReactNode;
  background: ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    // `isolate` keeps the absolutely-positioned background layers inside this
    // section's own stacking context — without it a negative z-index would
    // render the image BEHIND the opaque page background and hide it.
    <section ref={ref} className={cn('relative isolate overflow-hidden', className)}>
      <motion.div className="absolute inset-0 z-0 scale-125" style={reduced ? undefined : { y }}>
        {background}
      </motion.div>
      <div className={cn('absolute inset-0 z-0', overlayClassName)} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
