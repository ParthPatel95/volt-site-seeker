import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, PlugZap, Cpu } from 'lucide-react';
import {
  CinematicBand,
  Reveal,
  CountUp,
  staggerContainer,
  staggerItem,
} from '../scroll';
import facilityImg from '@/assets/alberta-facility-aerial.jpg';

// Chapter: "Flagship." The one site that is real steel today — Alberta
// Heartland 135. Presented as a full-bleed film still: a parallaxed aerial of
// the facility behind a heavy dark gradient, with a huge animated 135 MW as
// the showpiece. Copy + specs adapted from v2/FlagshipSection: same figures
// (135 MW under development, 144 kV transmission-connected, ASIC + HPC,
// Hybrid energy, Under Development), re-presented cinematically.

type Spec = {
  icon: typeof Zap;
  label: string;
  value: string;
};

const SPECS: Spec[] = [
  { icon: PlugZap, label: 'Interconnection', value: '144 kV transmission' },
  { icon: Cpu, label: 'Workloads', value: 'ASIC + HPC ready' },
  { icon: Zap, label: 'Energy', value: 'Hybrid' },
];

export function Flagship() {
  return (
    <CinematicBand
      className="min-h-[90vh]"
      background={
        <img
          src={facilityImg}
          alt="Aerial photograph of the WattByte Alberta Heartland facility — buildings, substation and transmission feed at dusk"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      }
      overlayClassName="bg-[radial-gradient(120%_120%_at_15%_85%,rgba(6,11,22,0.55)_0%,rgba(6,11,22,0.82)_45%,rgba(6,11,22,0.97)_100%)]"
    >
      {/* A second, directional scrim so the lower-left text column always pops
          against whatever lands in the frame. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#060b16] via-[#060b16]/35 to-transparent" />

      <section
        id="flagship"
        className="relative z-10 flex min-h-[90vh] items-end py-24 lg:py-32"
      >
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <Reveal y={20}>
              <div className="mb-6 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                <span className="inline-block h-px w-7 bg-watt-bitcoin" />
                Flagship · Alberta, Canada
              </div>
            </Reveal>

            {/* The showpiece number. */}
            <Reveal y={28} delay={0.05}>
              <div className="flex items-end gap-3 sm:gap-5">
                <span className="text-[5.5rem] font-bold leading-[0.85] tracking-tight tabular-nums text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] sm:text-[8rem] lg:text-[11rem]">
                  <CountUp value={135} />
                </span>
                <span className="pb-3 text-3xl font-semibold text-watt-bitcoin sm:pb-5 sm:text-5xl lg:pb-8 lg:text-6xl">
                  MW
                </span>
              </div>
            </Reveal>

            <Reveal y={20} delay={0.12}>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Alberta Heartland 135 —{' '}
                <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                  steel in the ground.
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 lg:text-lg">
                Transmission-connected and dual-workload by design, sited in one
                of North America's most favorable power markets. The Heartland
                facility anchors both our hosting business and our development
                track record — not a pitch deck, real interconnected capacity.
              </p>
            </Reveal>

            {/* Inline spec row. */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="mt-9 flex flex-col gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md sm:flex-row sm:divide-x sm:divide-white/10 sm:bg-white/[0.05]"
            >
              {SPECS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={staggerItem}
                  className="flex items-center gap-3 px-5 py-4 sm:flex-1 sm:flex-col sm:items-start sm:gap-2"
                >
                  <s.icon className="h-5 w-5 shrink-0 text-watt-bitcoin" />
                  <div>
                    <div className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/45">
                      {s.label}
                    </div>
                    <div className="text-sm font-semibold text-white sm:text-base">
                      {s.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <Reveal y={18} delay={0.18}>
              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Link
                  to="/advisory"
                  className="inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-[#060b16] transition-colors hover:bg-watt-bitcoin"
                >
                  Work with us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-watt-bitcoin/30 bg-watt-bitcoin/10 px-4 py-2 text-sm font-medium text-watt-bitcoin backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-watt-bitcoin/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-watt-bitcoin" />
                  </span>
                  Under Development · grid-connected
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </CinematicBand>
  );
}
