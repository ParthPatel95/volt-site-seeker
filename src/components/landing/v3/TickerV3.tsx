import { motion, useReducedMotion } from 'framer-motion';
import { PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

// Thin marquee band of live pipeline sites — sits just under the hero as a
// continuous, weighted scroll of where WattByte operates.
export function TickerV3() {
  const reduced = useReducedMotion();
  const items = PIPELINE_PROJECTS;
  const row = [...items, ...items]; // duplicate for a seamless loop

  return (
    <div className="relative z-10 overflow-hidden border-y border-slate-200 bg-slate-50 py-3.5">
      <motion.div
        className="flex w-max items-center gap-8 whitespace-nowrap pl-8"
        animate={reduced ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
      >
        {row.map((p, i) => (
          <span key={`${p.id}-${i}`} className="inline-flex items-center gap-2.5 text-sm text-slate-500">
            <span className="text-base leading-none">{p.flagEmoji}</span>
            <span className="font-medium text-slate-800">{p.location.replace(/\s\d+$/, '')}</span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums text-watt-bitcoin">{p.capacityMw} MW</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{p.energyType}</span>
            <span aria-hidden className="ml-6 inline-block h-1 w-1 rounded-full bg-slate-300" />
          </span>
        ))}
      </motion.div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent" />
    </div>
  );
}
