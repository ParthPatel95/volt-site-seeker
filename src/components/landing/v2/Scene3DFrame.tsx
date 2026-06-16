import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Shared shell for every procedural 3D scene on the landing page. Handles the
// concerns common to all of them so each scene file is just geometry:
//   * lazy-mounts the Canvas on viewport intersection (off-screen = free),
//   * a tonal fallback shown pre-mount and when WebGL is unavailable,
//   * dpr clamp + the cinematic inner vignette,
//   * reduced-motion flag handed to the scene so it can freeze animation.
//
// The scene is supplied as a render function so it receives `reduced` without
// needing context.

export type SceneCamera = {
  fov?: number;
  position?: [number, number, number];
  near?: number;
  far?: number;
};

export function Scene3DFrame({
  className,
  eager = false,
  camera,
  fallback,
  overlay,
  children,
}: {
  className?: string;
  eager?: boolean;
  camera?: SceneCamera;
  /** Background shown until the Canvas mounts / when WebGL is unavailable. */
  fallback?: string;
  /** DOM layered over the canvas (caption chips, labels). */
  overlay?: ReactNode;
  children: (reduced: boolean) => ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (eager) {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            fallback ??
            'radial-gradient(60% 55% at 50% 45%, #142844 0%, #0a1729 60%, #060e1c 100%)',
        }}
      />

      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.6]}
            shadows={false}
            camera={{
              fov: camera?.fov ?? 45,
              position: camera?.position ?? [11, 6, 9],
              near: camera?.near ?? 0.1,
              far: camera?.far ?? 80,
            }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ display: 'block' }}
          >
            <Suspense fallback={null}>{children(reduced)}</Suspense>
          </Canvas>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 140px rgba(0,0,0,0.55)' }}
        aria-hidden="true"
      />

      {overlay}
    </div>
  );
}
