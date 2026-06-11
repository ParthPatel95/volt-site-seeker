import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, Activity, Thermometer, ShieldCheck, Bitcoin } from 'lucide-react';
import { Reveal, CountUp } from './motion';

// Heavy 3D mining rig — lazy-loaded chunk; section gracefully renders the
// stats and copy if WebGL is unavailable.
const MiningRigScene = lazy(() => import('./MiningRigScene'));

const SPECS = [
  { icon: Activity, label: 'Hosting uptime target', value: 95, suffix: '%' },
  { icon: Cpu, label: 'Workloads', text: 'ASIC + HPC' },
  { icon: Thermometer, label: 'Cooling options', text: 'Air + immersion' },
  { icon: ShieldCheck, label: 'Curtailment-aware', text: 'Live AESO/ERCOT' },
];

export function CryptoHpcSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20 relative overflow-hidden">
      {/* warm glow for the crypto angle */}
      <div
        className="absolute -top-24 right-0 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--watt-bitcoin) / 0.6), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3 flex items-center gap-2">
                <Bitcoin className="w-4 h-4" /> Crypto + HPC
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                ASIC and AI workloads on the <span className="text-gradient-watt">same megawatts.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-9">
                Our hosting capacity runs both — Bitcoin miners during low-price windows, HPC and
                AI tenants when the math flips. Curtailment-aware operations means power that
                would otherwise be wasted becomes paying compute.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {SPECS.map((s, i) => (
                <Reveal key={s.label} delay={0.07 * i}>
                  <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm h-full">
                    <s.icon className="w-5 h-5 text-watt-bitcoin mb-2.5" />
                    <div className="text-xl font-semibold">
                      {'value' in s && s.value !== undefined
                        ? <><CountUp value={s.value} />{s.suffix}</>
                        : s.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/hosting">
                    Host with us <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app">Open mining economics</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* 3D rig — soft branded panel so the canvas reads as a window onto
              the rack rather than a dark hole on a light page. */}
          <Reveal className="lg:col-span-7" delay={0.15}>
            <div
              className="relative rounded-3xl overflow-hidden border border-watt-bitcoin/20 shadow-watt-glow h-[28rem] sm:h-[32rem]"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--watt-bitcoin) / 0.06) 0%, hsl(var(--card) / 0.85) 45%, hsl(var(--watt-trust) / 0.06) 100%)',
              }}
            >
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Loading scene…
                </div>
              }>
                <MiningRigScene />
              </Suspense>
              {/* overlay caption */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-card/80 border border-border backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-watt-bitcoin animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-watt-bitcoin">
                  Illustrative rig telemetry
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
