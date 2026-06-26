import { motion, useReducedMotion } from 'framer-motion';
import { PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

// Thin marquee band of live pipeline sites — sits just under the hero as a
// continuous, weighted scroll of where WattByte operates.
export function TickerV3() {
  const reduced = useReducedMotion();
  const items = PIPELINE_PROJECTS;
  const row = [...items, ...items]; // duplicate for a seamless loop

  return (
    <div className="relative z-10 overflow-hidden border-y border-white/10 bg-[#080f1d] py-3.5">
      <motion.div
        className="flex w-max items-center gap-8 whitespace-nowrap pl-8"
        animate={reduced ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
      >
        {row.map((p, i) => (
          <span key={`${p.id}-${i}`} className="inline-flex items-center gap-2.5 text-sm text-white/55">
            <span className="text-base leading-none">{p.flagEmoji}</span>
            <span className="font-medium text-white/85">{p.location.replace(/\s\d+$/, '')}</span>
            <span className="text-white/30">·</span>
            <span className="tabular-nums text-watt-bitcoin">{p.capacityMw} MW</span>
            <span className="text-white/30">·</span>
            <span className="text-white/45">{p.energyType}</span>
            <span aria-hidden className="ml-6 inline-block h-1 w-1 rounded-full bg-white/20" />
          </span>
        ))}
      </motion.div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080f1d] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080f1d] to-transparent" />
    </div>
  );
}
