import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, useTexture } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// True-3D photo treatment: the real facility photograph is mapped onto a
// gently curved plane inside a PerspectiveCamera scene. The camera dollies
// and tilts — idle drift + spring-damped pointer parallax — so the plane's
// curvature produces real perspective shift across the photo. Atmospheric
// sparkles float in front of and behind the plane to sell depth; a soft
// vignette + brand glow plane finishes the cinematic feel.
//
// Performance contract:
//   * Canvas only mounts once the section enters the viewport (lazy).
//   * dpr clamped to [1, 1.6]; geometry is one curved plane + two sparkle
//     systems — well under any GPU budget.
//   * prefers-reduced-motion freezes the camera and disables sparkles.

type Grade = 'navy' | 'bottom' | 'none';

const GRADE_BG: Record<Grade, string> = {
  navy:
    'linear-gradient(180deg, hsl(var(--watt-navy) / 0.12) 0%, hsl(var(--watt-navy) / 0.50) 60%, hsl(var(--watt-navy) / 0.90) 100%)',
  bottom:
    'linear-gradient(to top, hsl(var(--background) / 0.85) 0%, transparent 55%)',
  none: 'transparent',
};

// Pointer position normalized to [-1, 1], shared between React and the frame
// loop so we don't re-render every mousemove.
const usePointer = () => {
  const p = useRef({ x: 0, y: 0, has: false });
  return p;
};

// ── 3D scene ────────────────────────────────────────────────────────────────

function CurvedPhotoPlane({ src, accent }: { src: string; accent: string }) {
  const tex = useTexture(src);
  const { viewport } = useThree();

  // Size the plane to over-fill the camera frustum at z=0 so neither parallax
  // nor the curvature ever exposes an edge. 2.4× covers the much larger camera
  // drift the rig now produces.
  const W = viewport.width * 2.4;
  const H = viewport.height * 2.4;

  // Object-cover the texture into the plane's aspect by adjusting UV repeat
  // / offset (keeps the photograph undistorted regardless of container shape).
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const img = tex.image as { width: number; height: number } | undefined;
    if (img?.width && img.height) {
      const imgAspect = img.width / img.height;
      const planeAspect = W / H;
      if (imgAspect > planeAspect) {
        // photo wider than plane → crop sides
        const r = planeAspect / imgAspect;
        tex.repeat.set(r, 1);
        tex.offset.set((1 - r) / 2, 0);
      } else {
        const r = imgAspect / planeAspect;
        tex.repeat.set(1, r);
        tex.offset.set(0, (1 - r) / 2);
      }
      tex.needsUpdate = true;
    }
  }, [tex, W, H]);

  // Curve the plane along x by displacing vertex z. The curvature is what
  // makes camera tilt read as real 3D — flat planes don't.
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  useEffect(() => {
    const g = geomRef.current;
    if (!g) return;
    const pos = g.attributes.position as THREE.BufferAttribute;
    const halfW = W / 2;
    const halfH = H / 2;
    // Pronounced spherical bowl so camera moves produce real parallax across
    // the surface in both axes — not just a flat slide.
    const depthX = W * 0.14;
    const depthY = H * 0.10;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = -depthX * Math.pow(x / halfW, 2) - depthY * Math.pow(y / halfH, 2);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
  }, [W, H]);

  return (
    <group>
      <mesh>
        <planeGeometry ref={geomRef} args={[W, H, 40, 24]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* additive brand glow plane just in front — gives the photo a
          lit, "hyper-real" radiance without crushing the source colors */}
      <mesh position={[0, 0, 0.4]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function CameraRig({
  reduced,
  pointer,
}: {
  reduced: boolean;
  pointer: ReturnType<typeof usePointer>;
}) {
  const { camera } = useThree();
  const damped = useRef({ x: 0, y: 0, z: 5 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const px = pointer.current.has ? pointer.current.x : 0;
    const py = pointer.current.has ? pointer.current.y : 0;

    if (reduced) {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      return;
    }

    // Idle cinematic drift — clearly visible, slow, organic. Amplitudes are
    // bounded so the 2.4× over-sized plane edges never enter the frustum.
    const idleX = Math.sin(t * 0.32) * 0.9 + Math.sin(t * 0.11) * 0.35;
    const idleY = Math.cos(t * 0.26) * 0.55 + Math.cos(t * 0.09) * 0.20;
    const idleZ = Math.sin(t * 0.20) * 0.7;

    const targetX = idleX + px * 1.1;
    const targetY = idleY + py * 0.8;
    const targetZ = 5 + idleZ - Math.abs(px) * 0.4;

    // Spring-damped follow in the loop (avoids per-frame React state).
    const k = Math.min(1, dt * 2.2);
    damped.current.x += (targetX - damped.current.x) * k;
    damped.current.y += (targetY - damped.current.y) * k;
    damped.current.z += (targetZ - damped.current.z) * k;

    camera.position.set(damped.current.x, damped.current.y, damped.current.z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({
  src,
  accent,
  reduced,
  pointer,
}: {
  src: string;
  accent: string;
  reduced: boolean;
  pointer: ReturnType<typeof usePointer>;
}) {
  return (
    <>
      <CameraRig reduced={reduced} pointer={pointer} />
      <CurvedPhotoPlane src={src} accent={accent} />
      {!reduced && (
        <>
          {/* Behind the plane — slow, large, dim: atmospheric haze */}
          <Sparkles
            count={40}
            scale={[14, 14, 3]}
            size={4}
            speed={0.4}
            opacity={0.5}
            color="#9ec7ff"
            position={[0, 0, -1.5]}
          />
          {/* In front of the plane — quick, bright: foreground sparks that
              streak across the camera and unmistakably read as 3D depth */}
          <Sparkles
            count={60}
            scale={[12, 12, 3]}
            size={6}
            speed={1.1}
            opacity={0.95}
            color={accent}
            position={[0, 0, 2.6]}
          />
        </>
      )}
    </>
  );
}

// ── Public component ────────────────────────────────────────────────────────

export function CinematicScene3D({
  src,
  alt,
  className,
  grade = 'none',
  accent = '#10a5c7',
  eager = false,
  children,
}: {
  src: string;
  /** Used on the visually-hidden img used for a11y + crawler discoverability. */
  alt: string;
  className?: string;
  grade?: Grade;
  /** Hex for the additive glow plane + foreground sparkle color. */
  accent?: string;
  eager?: boolean;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const pointer = usePointer();
  const [mounted, setMounted] = useState(false);

  // Lazy-mount the Canvas only when the frame enters the viewport. Off-screen
  // sections cost nothing.
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

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointer.current.has = true;
  };
  const onPointerLeave = () => {
    pointer.current.has = false;
  };

  return (
    <div
      ref={frameRef}
      className={cn('relative overflow-hidden', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Accessible / SEO-friendly img element — invisible but present. */}
      <img src={src} alt={alt} className="sr-only" loading={eager ? 'eager' : 'lazy'} />

      {/* Static fallback shown until the Canvas mounts, and the only thing
          rendered when WebGL is unavailable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
      />

      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.6]}
            camera={{ fov: 45, position: [0, 0, 5], near: 0.1, far: 50 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ display: 'block' }}
          >
            <Suspense fallback={null}>
              <Scene src={src} accent={accent} reduced={reduced} pointer={pointer} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Color grade */}
      {grade !== 'none' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: GRADE_BG[grade] }}
        />
      )}

      {/* Inner vignette — pure cinematic finish */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)',
        }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
