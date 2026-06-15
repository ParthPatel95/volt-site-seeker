import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, Activity, Thermometer, ShieldCheck } from 'lucide-react';
import { Reveal, CountUp } from './motion';
import asicMiners from '@/assets/asic-miners-powered.jpg';
import miningFloor from '@/assets/datacenter-mining-floor-interior.jpg';

const SPECS = [
  { icon: Activity, label: 'Hosting uptime target', value: 95, suffix: '%' },
  { icon: Cpu, label: 'Workloads', text: 'ASIC + HPC' },
  { icon: Thermometer, label: 'Cooling options', text: 'Air + immersion' },
  { icon: ShieldCheck, label: 'Curtailment-aware', text: 'Live AESO / ERCOT' },
];

export function CryptoHpcSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagery — two real facility photos, layered editorially */}
          <Reveal>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-border shadow-xl">
                <img src={miningFloor} alt="WattByte mining floor interior" loading="lazy"
                  className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-2/5 aspect-square rounded-2xl overflow-hidden ring-4 ring-background shadow-2xl hidden sm:block">
                <img src={asicMiners} alt="Powered ASIC miners" loading="lazy"
                  className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <div className="lg:pl-4">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-watt-bitcoin mb-4">
                Crypto + HPC hosting
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
                ASIC and AI workloads on the <span className="text-gradient-watt">same megawatts.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-9 max-w-xl">
                Our hosting capacity runs both — Bitcoin miners during low-price windows, HPC and
                AI tenants when the economics flip. Curtailment-aware operations turn power that
                would otherwise be wasted into paying compute.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-x-8 gap-y-7 mb-10 max-w-md">
              {SPECS.map((s, i) => (
                <Reveal key={s.label} delay={0.05 * i}>
                  <div>
                    <s.icon className="w-5 h-5 text-watt-bitcoin mb-2.5" />
                    <div className="text-xl font-semibold text-foreground">
                      {'value' in s && s.value !== undefined
                        ? <><CountUp value={s.value} />{s.suffix}</>
                        : s.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/hosting">Host with us <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app">Open mining economics</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
