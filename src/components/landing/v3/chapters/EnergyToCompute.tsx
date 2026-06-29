import { type ReactNode } from 'react';
import { Search, Wrench, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal, SplitWords } from '../scroll';
import DiscoveryScene from '../DiscoveryScene';
import { GridFlowScene } from '../GridFlowScene';
import DatacenterScene from '../DatacenterScene';
import { TOTAL_MW, UNDER_DEV_MW } from '@/data/advisory-pipeline';

// EnergyToCompute — "Our model" stated as one continuous pipeline: source the
// hidden megawatts, develop them to energization, operate them as compute. Three
// stage cards, each with a topical live scene (a discovery radar, an energized
// single-line diagram, a running datacenter), connected by a flow line — then a
// plain-spoken payoff with the CTAs.

interface Stage {
  n: string;
  key: string;
  icon: typeof Search;
  accent: string;
  title: string;
  blurb: string;
  metric: string;
  metricUnit: string;
  scene: ReactNode;
}

const STAGES: Stage[] = [
  {
    n: '01',
    key: 'Source',
    icon: Search,
    accent: '#10a5c7',
    title: 'The best megawatts are never listed for sale.',
    blurb:
      'Idle interconnections, curtailed generation, distressed plants — hidden power nobody is marketing. VoltScout and its Hidden Gems engine surface it first.',
    metric: TOTAL_MW.toLocaleString(),
    metricUnit: 'MW sourced',
    scene: <DiscoveryScene className="absolute inset-0 h-full w-full" />,
  },
  {
    n: '02',
    key: 'Develop',
    icon: Wrench,
    accent: '#F7931A',
    title: 'From diligence to energization.',
    blurb:
      'Interconnection studies, energy procurement, permits and EPC — like our 135 MW Alberta flagship, transmission-connected at 144 kV.',
    metric: UNDER_DEV_MW.toLocaleString(),
    metricUnit: 'MW in development',
    scene: <GridFlowScene dark accent="#F7931A" className="absolute inset-0 h-full w-full" />,
  },
  {
    n: '03',
    key: 'Operate',
    icon: Cpu,
    accent: '#10a5c7',
    title: 'Online as AI · HPC · BTC.',
    blurb:
      'ASIC and HPC capacity with live telemetry and curtailment-aware economics. Wasted power, turned into the compute behind modern AI.',
    metric: '95%',
    metricUnit: 'hosting uptime target',
    scene: <DatacenterScene variant="dark" accent="teal" className="absolute inset-0 h-full w-full" />,
  },
];

function StageCard({ stage, i }: { stage: Stage; i: number }) {
  const Icon = stage.icon;
  return (
    <Reveal y={28} delay={i * 0.12} className="h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-500 hover:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.3)]">
        {/* live scene */}
        <div className="relative aspect-[16/11] overflow-hidden border-b border-slate-200 bg-[#070b13]">
          {stage.scene}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b13]/40 to-transparent" />
          <span className="absolute right-4 top-4 font-mono text-[11px] tracking-widest text-white/45">
            {stage.n} / 03
          </span>
          <span
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/15 backdrop-blur-md"
            style={{ color: '#fff' }}
          >
            <Icon className="h-3 w-3" style={{ color: stage.accent }} />
            {stage.key}
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-xl">
            {stage.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{stage.blurb}</p>
          <div className="mt-5 flex items-baseline gap-2.5 border-t border-slate-200 pt-5">
            <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: stage.accent }}>
              {stage.metric}
            </span>
            <span className="text-xs uppercase tracking-[0.12em] text-slate-500">{stage.metricUnit}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function EnergyToCompute(): ReactNode {
  return (
    <section id="energy-to-compute" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <Reveal y={24}>
          <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            Our model
          </div>
          <h2 className="max-w-4xl text-3xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            <SplitWords text="From stranded megawatts to the" />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="compute behind AI." delay={0.2} />
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
            Power is the scarce input of the compute economy. We source it, develop it, and
            operate it — three steps, one continuous pipeline from a stranded megawatt to
            productive compute.
          </p>
        </Reveal>

        {/* Journey legend */}
        <Reveal y={16} delay={0.1}>
          <div className="mt-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
            <span className="text-slate-600">Stranded MW</span>
            <span className="h-px flex-1 bg-gradient-to-r from-watt-trust via-watt-bitcoin to-watt-trust opacity-60" />
            <span className="text-slate-600">AI · HPC · BTC</span>
          </div>
        </Reveal>

        {/* Three stages */}
        <div className="relative mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {STAGES.map((stage, i) => (
            <StageCard key={stage.key} stage={stage} i={i} />
          ))}
        </div>

        {/* Payoff */}
        <Reveal y={24} delay={0.05}>
          <div className="mt-20 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-9 text-center shadow-sm sm:p-14 lg:mt-24">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Hidden energy in.{' '}
              <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                Productive compute out.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
              We built proprietary software and methods to find the best megawatts first, then
              develop and operate them as the datacenters behind modern AI. That is the whole
              model — source, develop, operate.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/advisory"
                className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
              >
                Work with us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex h-12 items-center rounded-full border border-slate-300 px-6 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                See VoltScout
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
