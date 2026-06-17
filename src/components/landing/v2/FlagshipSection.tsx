import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, PlugZap, Cpu, Gauge } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, CountUp } from './motion';
import facilityImage from '@/assets/alberta-facility-aerial.jpg';

// Alberta Heartland flagship — the one site that's real steel today. Specs
// mirror the pipeline registry (135 MW, transmission-connected, ASIC + HPC).

const SPECS = [
  { icon: Zap, value: 135, suffix: ' MW', label: 'Capacity under development' },
  { icon: PlugZap, value: 144, suffix: ' kV', label: 'Transmission-connected' },
  { icon: Cpu, value: 2, suffix: '', label: 'Workloads: ASIC + HPC' },
  { icon: Gauge, value: 95, suffix: '%', label: 'Hosting uptime target' },
];

export function FlagshipSection() {
  const reduced = useReducedMotion();
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Real aerial photograph of the Alberta Heartland site */}
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden border border-border h-[26rem]">
              <motion.img
                src={facilityImage}
                alt="Aerial photograph of the WattByte Alberta Heartland facility — buildings, substation and transmission feed"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                initial={false}
                animate={reduced ? undefined : { scale: [1.0, 1.07, 1.0] }}
                transition={reduced ? undefined : { duration: 26, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* legibility scrim for the caption */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: 'linear-gradient(to top, rgba(8,16,28,0.78), transparent)' }}
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="text-xs font-mono text-watt-bitcoin mb-1">🇨🇦 53.63°N, 113.10°W</div>
                  <div className="text-xl font-semibold text-white drop-shadow">Alberta Heartland 135</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 text-watt-bitcoin text-xs font-medium backdrop-blur-sm">
                  Under development
                </div>
              </div>
            </div>
          </Reveal>

          {/* Copy + specs */}
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
                Flagship in steel
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                135 MW in Alberta's <span className="text-gradient-watt">industrial heartland</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                Transmission-connected, dual-workload by design, and sited in one of North
                America's most favorable power markets — the Heartland facility anchors both
                our hosting business and our development track record.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {SPECS.map((s, i) => (
                <Reveal key={s.label} delay={0.08 * i}>
                  <div className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
                    <s.icon className="w-5 h-5 text-watt-bitcoin mb-3" />
                    <div className="text-2xl font-bold">
                      {s.label.startsWith('Workloads') ? 'ASIC + HPC' : <><CountUp value={s.value} />{s.suffix}</>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Button asChild size="lg">
                <Link to="/hosting">
                  Host with us <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
