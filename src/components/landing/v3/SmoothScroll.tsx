// Weighted, inertial smooth scroll for the cinematic landing — the
// "heavy glide" feel of premium editorial sites (Breakthrough Energy et al.).
//
// Built on Lenis. Lenis scrolls the real document and keeps window.scrollY
// accurate, so framer-motion's useScroll / IntersectionObserver-based reveals
// all keep working — it only smooths the motion. Disabled entirely under
// prefers-reduced-motion so we never hijack a user's native scrolling.

import { type ReactNode, useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import { useReducedMotion } from 'framer-motion';

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  // Drive Lenis from a single rAF loop.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const loop = (time: number) => {
      lenisRef.current?.lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Smooth-scroll same-page anchor links (the nav jumps).
  useEffect(() => {
    if (reduced) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenisRef.current?.lenis?.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reduced]);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.09,          // weight of the glide (lower = heavier)
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,    // leave native momentum on touch devices
        autoRaf: false,      // we drive raf ourselves above
      }}
    >
      {children}
    </ReactLenis>
  );
}
