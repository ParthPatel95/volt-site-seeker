import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bitcoin, Cpu, Thermometer, Activity, ShieldCheck, Layers, Check,
} from 'lucide-react';
import { Reveal, SplitWords, CountUp } from '../scroll';
import MiningScene from '../MiningScene';
import ImmersionScene from '../ImmersionScene';

// CryptoHpc — "Two workloads on the same power." A balanced side-by-side of the
// two compute tenants our hosted megawatts serve: Bitcoin mining (ASIC) and
// AI / HPC. Copy and specs carry over from the v2 CryptoHpcSection — the 95%
// hosting uptime target, ASIC + HPC workloads, air + immersion cooling, and
// curtailment-aware AESO/ERCOT operations — re-presented as two image-headed
// cards on dark glass, each with its own restrained accent (orange for mining,
// teal for AI/HPC) so the page reads as one warm/cool pairing, never a rainbow.

type Accent = 'bitcoin' | 'trust';

interface Workload {
  id: string;
  accent: Accent;
  icon: typeof Bitcoin;
  kicker: string;
  title: string;
  pitch: string;
  bullets: { icon: typeof Activity; text: string }[];
}

const ACCENT: Record<Accent, { hex: string; text: string; chip: string; border: string }> = {
  bitcoin: {
    hex: '#F7931A',
    text: 'text-watt-bitcoin',
    chip: 'bg-watt-bitcoin/10 text-watt-bitcoin ring-watt-bitcoin/20',
    border: 'group-hover:border-watt-bitcoin/40',
  },
  trust: {
    hex: '#10a5c7',
    text: 'text-watt-trust',
    chip: 'bg-watt-trust/10 text-watt-trust ring-watt-trust/20',
    border: 'group-hover:border-watt-trust/40',
  },
};

const WORKLOADS: Workload[] = [
  {
    id: 'mining',
    accent: 'bitcoin',
    icon: Bitcoin,
    kicker: 'Bitcoin mining',
    title: 'ASIC',
    pitch:
      'Energy-flexible Bitcoin miners run our megawatts hard during low-price windows and curtail in seconds when the grid pays more — monetising power that would otherwise be stranded.',
    bullets: [
      { icon: Layers, text: 'Air-cooled and immersion-ready ASIC capacity, Alberta-owned' },
      { icon: ShieldCheck, text: 'Curtailment-aware dispatch on live AESO / ERCOT signals' },
      { icon: Activity, text: 'Transparent hosting rates with live telemetry and ROI modelling' },
    ],
  },
  {
    id: 'hpc',
    accent: 'trust',
    icon: Cpu,
    kicker: 'AI & HPC',
    title: 'Accelerated compute',
    pitch:
      'When the economics flip, the same sites host AI and HPC tenants — power-dense racks, immersion thermals, and an NOC built for sustained accelerated workloads rather than spot dispatch.',
    bullets: [
      { icon: Thermometer, text: 'Immersion and air cooling sized for high-TDP GPU and HPC racks' },
      { icon: Cpu, text: 'Power-first siting next to underutilised generation and interconnects' },
      { icon: Activity, text: '95% hosting uptime target with operator-grade monitoring' },
    ],
  },
];

function WorkloadCard({ workload }: { workload: Workload }) {
  const a = ACCENT[workload.accent];
  const Icon = workload.icon;

  return (
    <div
      className={[
        'group relative flex h-full flex-col overflow-hidden rounded-3xl',
        'border border-slate-200 bg-white shadow-sm',
        'transition-colors duration-500',
        a.border,
      ].join(' ')}
    >
      {/* Animated header — workload-specific: a mining farm (spinning ASIC fans)
          for Bitcoin, immersion-cooled tanks for AI/HPC */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-slate-200">
        {workload.accent === 'bitcoin' ? (
          <MiningScene className="absolute inset-0 h-full w-full" />
        ) : (
          <ImmersionScene className="absolute inset-0 h-full w-full" />
        )}
        {/* dark wash so the label strip reads over the atmospheric scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#070b13] via-[#070b13]/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-6 sm:p-8">
          <span
            className={[
              'inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 backdrop-blur-md',
              a.chip,
            ].join(' ')}
          >
            <Icon className={['h-5 w-5', a.text].join(' ')} />
          </span>
          <div>
            <div className={['text-[11px] font-medium uppercase tracking-[0.18em]', a.text].join(' ')}>
              {workload.kicker}
            </div>
            <div className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {workload.title}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-base leading-relaxed text-slate-600">{workload.pitch}</p>

        <ul className="mt-7 space-y-4 border-t border-slate-200 pt-7">
          {workload.bullets.map((b) => {
            const BIcon = b.icon;
            return (
              <li key={b.text} className="flex items-start gap-3.5">
                <span
                  className={[
                    'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1',
                    a.chip,
                  ].join(' ')}
                >
                  <BIcon className={['h-3.5 w-3.5', a.text].join(' ')} />
                </span>
                <span className="text-sm leading-relaxed text-slate-600">{b.text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function CryptoHpc(): ReactNode {
  return (
    <section id="crypto-hpc" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal y={24}>
          <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            Crypto + HPC hosting
          </div>

          <h2 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            <SplitWords text="Two workloads," />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="the same megawatts" delay={0.18} />
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
            Our hosting capacity runs both — Bitcoin miners during low-price windows, AI and HPC
            tenants when the economics flip. Curtailment-aware operations turn power that would
            otherwise be wasted into paying compute.
          </p>
        </Reveal>

        {/* Two-column comparison */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
          {WORKLOADS.map((workload, i) => (
            <Reveal key={workload.id} y={28} delay={i * 0.12} className="h-full">
              <WorkloadCard workload={workload} />
            </Reveal>
          ))}
        </div>

        {/* Tie-together: flexible, power-led deployment */}
        <Reveal y={20} delay={0.1}>
          <div className="mt-12 flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                <Thermometer className="h-3.5 w-3.5 text-watt-bitcoin" />
                Power-led, not workload-led
              </div>
              <p className="text-base leading-relaxed text-slate-600 lg:text-lg">
                We deploy whichever compute the power favours at any given hour — ASIC or accelerated
                AI — across air-cooled and immersion thermals, with a{' '}
                <span className="font-semibold text-slate-900">
                  <CountUp value={95} />% uptime target
                </span>{' '}
                and dispatch tied to live AESO and ERCOT pricing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/hosting"
                className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
              >
                Host with us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex h-12 items-center rounded-full border border-slate-300 px-6 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Check className="mr-2 h-4 w-4 text-watt-trust" />
                Open mining economics
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
