import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal, CountUp, staggerContainer, staggerItem } from '../scroll';
import {
  PIPELINE_PROJECTS,
  TOTAL_MW,
  UNDER_DEV_MW,
  COUNTRIES,
  ENERGY_TYPE_COLORS,
} from '@/data/advisory-pipeline';
import { PIPELINE_IMAGES } from '@/data/pipeline-images';

// Chapter: "Global pipeline." The same data that powers the hero globe and the
// Advisory map (src/data/advisory-pipeline.ts) re-presented as a cinematic
// editorial grid — every figure sourced, nothing marketing-only. Summary stats
// count up on entry; project cards photograph each site under a dark gradient
// and stagger in. Copy/figures adapted from v2/PipelineSection.

// Largest sites first so the grid reads as a portfolio, not a list.
const SITES = [...PIPELINE_PROJECTS].sort((a, b) => b.capacityMw - a.capacityMw);

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

const STATS: Stat[] = [
  { value: TOTAL_MW, suffix: ' MW', label: 'Total pipeline' },
  { value: COUNTRIES, suffix: '', label: 'Countries' },
  { value: PIPELINE_PROJECTS.length, suffix: '', label: 'Sites in motion' },
  { value: UNDER_DEV_MW, suffix: ' MW', label: 'Under development' },
];

export function GlobalPipeline() {
  return (
    <section id="pipeline" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal y={18}>
              <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                <span className="inline-block h-px w-7 bg-watt-bitcoin" />
                The global pipeline
              </div>
            </Reveal>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              <Reveal y={22}>
                A pipeline that{' '}
                <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                  spans continents
                </span>
              </Reveal>
            </h2>

            <Reveal y={20} delay={0.08}>
              <p className="mt-5 text-base leading-relaxed text-white/65 lg:text-lg">
                The same data behind our Advisory pipeline map — every figure is
                sourced, site by site. Nothing here is marketing-only.
              </p>
            </Reveal>
          </div>

          <Reveal y={18} delay={0.12} className="shrink-0">
            <Link
              to="/advisory"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white/90 transition-colors hover:bg-white/5"
            >
              Full pipeline detail
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        {/* Summary stats */}
        <Reveal y={20} delay={0.05}>
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="border-t border-white/10 px-6 py-7 first:border-t-0 [&:nth-child(2)]:border-t-0 lg:border-t-0"
              >
                <div className="text-3xl font-bold tabular-nums text-white sm:text-4xl lg:text-5xl">
                  <CountUp value={s.value} />
                  <span className="text-watt-bitcoin">{s.suffix}</span>
                </div>
                <div className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Project cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {SITES.map((p) => {
            const energy = ENERGY_TYPE_COLORS[p.energyType];
            return (
              <motion.article
                key={p.id}
                variants={staggerItem}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-white/20"
              >
                {/* Cover image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={PIPELINE_IMAGES[p.imageKey]}
                    alt={`${p.location}, ${p.country} — ${p.energyType} energy site`}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Dark gradient for legibility + cinematic weight */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060b16] via-[#060b16]/45 to-[#060b16]/10" />

                  {/* Energy-type chip, colored from the shared palette */}
                  <div className="absolute left-4 top-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border bg-[#060b16]/50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] backdrop-blur-md"
                      style={{
                        color: energy?.hex,
                        borderColor: `${energy?.hex}55`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: energy?.hex }}
                      />
                      {p.energyType}
                    </span>
                  </div>

                  {/* Capacity, anchored to the image base */}
                  <div className="absolute bottom-4 left-4 flex items-end gap-1.5">
                    <span className="text-4xl font-bold leading-none tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-5xl">
                      {p.capacityMw}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-white/70">
                      MW
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <span className="text-xl leading-none" aria-hidden="true">
                          {p.flagEmoji}
                        </span>
                        {p.location}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/45">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.country}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/55">
                      {p.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    {p.description}
                  </p>
                </div>

                {/* Bottom accent line on hover, in the site's energy color */}
                <span
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                  style={{ backgroundColor: energy?.hex }}
                />
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
