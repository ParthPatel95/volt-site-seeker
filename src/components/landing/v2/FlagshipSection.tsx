import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, PlugZap, Cpu, Gauge } from 'lucide-react';
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
          {/* Image */}
          <Reveal>
            <motion.div
              className="relative rounded-3xl overflow-hidden border border-border group"
              whileHover={reduced ? undefined : 'hover'}
            >
              <motion.img
                src={facilityImage}
                alt="Aerial view of the WattByte Alberta Heartland facility"
                className="w-full h-[26rem] object-cover"
                loading="lazy"
                variants={{ hover: { scale: 1.04 } }}
                transition={{ duration: 0.8, ease: [0.21, 0.65, 0.36, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="text-xs font-mono text-watt-bitcoin mb-1">🇨🇦 53.63°N, 113.10°W</div>
                  <div className="text-xl font-semibold text-foreground">Alberta Heartland 135</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-watt-bitcoin/15 border border-watt-bitcoin/30 text-watt-bitcoin text-xs font-medium backdrop-blur-sm">
                  Under development
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Copy + specs */}
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">Flagship</p>
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
