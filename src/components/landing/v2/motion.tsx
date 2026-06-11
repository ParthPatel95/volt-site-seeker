// Landing v2 motion primitives — one consistent animation language for the
// whole page, built on framer-motion and respecting prefers-reduced-motion.

import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  motion, useInView, useReducedMotion, useSpring, useTransform, useMotionValue,
} from 'framer-motion';

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
