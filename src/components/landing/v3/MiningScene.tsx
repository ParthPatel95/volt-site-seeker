import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MiningScene — a realistic ASIC mining farm: a dense wall of miners facing the
 * viewer, their twin cooling fans spinning continuously. Dark industrial space
 * with a warm Bitcoin-orange wash and status LEDs. Built for the CryptoHpc
 * "Bitcoin mining / ASIC" card. react-three-fiber v8 + three r160, no drei.
 * Reduced-motion safe (still frame), pauses off-screen, dpr-capped.
 */

const COLS = 6;
const ROWS = 4;
const MW = 1.12; //  miner cell width
const MH = 0.66; //  miner cell height
const ORANGE = '#F7931A';

// Miner faceplate: brushed-metal panel with two fan shrouds, screws and a LED.
function makeFaceTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 150;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#23272e');
  g.addColorStop(1, '#15181d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // edge bevel
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  // two fan shrouds (recessed dark circles + rim)
  for (const cx of [W * 0.27, W * 0.73]) {
    ctx.fillStyle = '#070809';
    ctx.beginPath();
    ctx.arc(cx, H / 2, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3f47';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, H / 2, 58, 0, Math.PI * 2);
    ctx.stroke();
    // grille spokes
    ctx.strokeStyle = 'rgba(120,130,145,0.25)';
    ctx.lineWidth = 2;
    for (let a = 0; a < 8; a++) {
      ctx.beginPath();
      ctx.moveTo(cx, H / 2);
      ctx.lineTo(cx + Math.cos((a / 8) * Math.PI * 2) * 56, H / 2 + Math.sin((a / 8) * Math.PI * 2) * 56);
      ctx.stroke();
    }
  }
  // corner screws + status LED between fans
  ctx.fillStyle = '#454b54';
  for (const [sx, sy] of [[10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10]] as const) {
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#37d67a';
  ctx.shadowColor = '#37d67a';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 30, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Fan blades on a transparent quad — rotate this for the spin.
function makeBladeTexture(): THREE.CanvasTexture {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.translate(S / 2, S / 2);
  const blades = 12;
  for (let i = 0; i < blades; i++) {
    ctx.rotate((Math.PI * 2) / blades);
    ctx.fillStyle = 'rgba(74,80,90,0.5)'; // dark, near-blurred blades
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, S / 2 - 6, -0.04, 0.34);
    ctx.closePath();
    ctx.fill();
    // faint metallic highlight along the leading edge
    ctx.strokeStyle = 'rgba(170,180,195,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, S / 2 - 7, -0.04, 0.34);
    ctx.stroke();
  }
  ctx.fillStyle = '#15191f';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2f37';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Miners({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const faceRef = useRef<THREE.InstancedMesh>(null);
  const fanRef = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const faceTex = useMemo(() => makeFaceTexture(), []);
  const bladeTex = useMemo(() => makeBladeTexture(), []);
  useEffect(() => () => { faceTex.dispose(); bladeTex.dispose(); }, [faceTex, bladeTex]);

  const COUNT = COLS * ROWS;
  const FANS = COUNT * 2;
  // grid layout centred on origin; slight per-cell depth jitter for parallax.
  const cells = useMemo(() => {
    const out = [] as { x: number; y: number; z: number }[];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        out.push({
          x: (c - (COLS - 1) / 2) * MW,
          y: (r - (ROWS - 1) / 2) * MH,
          z: -Math.abs(((c * 7 + r * 13) % 5) - 2) * 0.05,
        });
      }
    return out;
  }, [COUNT]);
  const fanSpeed = useMemo(() => Array.from({ length: FANS }, (_, i) => 7 + ((i * 13) % 5)), [FANS]);

  // static placement of bodies + faces (only fans spin → done once)
  useEffect(() => {
    const body = bodyRef.current;
    const face = faceRef.current;
    if (!body || !face) return;
    cells.forEach((cell, i) => {
      dummy.position.set(cell.x, cell.y, cell.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(MW * 0.94, MH * 0.9, 0.5);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);
      dummy.position.set(cell.x, cell.y, cell.z + 0.26);
      dummy.scale.set(MW * 0.94, MH * 0.9, 1);
      dummy.updateMatrix();
      face.setMatrixAt(i, dummy.matrix);
    });
    body.instanceMatrix.needsUpdate = true;
    face.instanceMatrix.needsUpdate = true;
    place(0);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const place = (t: number) => {
    const fan = fanRef.current;
    if (!fan) return;
    let k = 0;
    cells.forEach((cell) => {
      for (const dx of [-0.295 * MW, 0.295 * MW]) {
        dummy.position.set(cell.x + dx, cell.y, cell.z + 0.28);
        dummy.rotation.set(0, 0, t * (fanSpeed[k] * (k % 2 ? -1 : 1)) * 0.12);
        dummy.scale.setScalar(MH * 0.62);
        dummy.updateMatrix();
        fan.setMatrixAt(k, dummy.matrix);
        k++;
      }
    });
    fan.instanceMatrix.needsUpdate = true;
  };

  useFrame((s) => {
    if (!animate || !runningRef.current) return;
    place(s.clock.elapsedTime);
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined as never, undefined as never, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={faceRef} args={[undefined as never, undefined as never, COUNT]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={faceTex} roughness={0.6} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={fanRef} args={[undefined as never, undefined as never, FANS]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={bladeTex} transparent depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function Rig({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const accent = useMemo(() => new THREE.Color(ORANGE), []);
  return (
    <>
      <color attach="background" args={[0.06, 0.042, 0.03]} />
      <fog attach="fog" args={['#1a1109', 6, 18]} />
      <ambientLight intensity={0.95} color="#d8bda0" />
      {/* frontal warm fill so the miner faces read */}
      <directionalLight position={[0, 0.5, 6]} intensity={1.4} color="#ffdfbf" />
      {/* warm Bitcoin-orange wash from both upper corners — mining-farm glow */}
      <pointLight position={[-3.5, 2, 4]} intensity={16} distance={16} color={accent} />
      <pointLight position={[3.5, 1.5, 3.5]} intensity={10} distance={14} color="#ffb24d" />
      <pointLight position={[0, -2.2, 3]} intensity={4} distance={11} color="#6f93c8" />
      <Miners animate={animate} runningRef={runningRef} />
    </>
  );
}

export default function MiningScene({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const runningRef = useRef(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { runningRef.current = e.isIntersecting; setVisible(e.isIntersecting); }, { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !reduced && visible;
  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.6], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
      >
        <Rig animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}
