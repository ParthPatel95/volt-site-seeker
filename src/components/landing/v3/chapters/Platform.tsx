import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Map as MapIcon, BarChart3, Activity } from 'lucide-react';
import { Reveal, SplitWords, staggerContainer, staggerItem } from '../scroll';
import { JourneyScene } from '../JourneyScene';
import { GridFlowScene } from '../GridFlowScene';

// Platform — VoltScout, the proprietary software edge. Three alternating
// feature rows (copy ↔ media) re-present the real v2 PlatformSection capability
// list in a weighted, editorial dark style: a parallaxed NOC photo, a built-
// from-divs "Site Intelligence" dashboard with a live-ish sparkline, and a
// second parallaxed substation plate. One accent family (teal, the platform's
// colour) with restrained orange punctuation. Ends on /app.

interface Feature {
  icon: typeof Gem;
  index: string;
  title: string;
  text: string;
  /** Pills that summarise the underlying signals — drawn from v2 copy. */
  tags: string[];
}

const FEATURES: Feature[] = [
  {
    icon: Gem,
    index: '01',
    title: 'Hidden Gems discovery engine',
    text:
      'Deterministic identification of idle, distressed, and underutilized power-intensive industrial sites across Alberta and Texas — registry parsing, listing-signal scraping, and geocode-verified grid checks. Every site in our portfolio was found here first.',
    tags: ['Industrial registries', 'Listing signals', 'Grid-verified'],
  },
  {
    icon: MapIcon,
    index: '02',
    title: 'Site Intelligence',
    text:
      'Fiber, transmission, gas, water, climate, and hazard layers for any Alberta location — fused and scored into a single 100-point suitability report you can act on.',
    tags: ['Fiber', 'Transmission', 'Hazard layers', '100-pt score'],
  },
  {
    icon: BarChart3,
    index: '03',
    title: 'AESO / ERCOT market hub',
    text:
      'Live pricing, curtailment analytics, and a 12CP-aware, invoice-grade power cost model — so a megawatt is priced before you ever build it.',
    tags: ['Live pricing', 'Curtailment', 'Invoice-grade model'],
  },
];

// ── Faux-UI: a stylized Site Intelligence panel built entirely from divs/SVG ──
// Clearly illustrative — references real factors (fiber, transmission, a 100-pt
// suitability score) without faking a screenshot or inventing portfolio numbers.

const SCORE_ROWS = [
  { label: 'Fiber proximity', value: 78 },
  { label: 'Transmission (240 kV · 2.1 km)', value: 84 },
  { label: 'Water & climate', value: 66 },
];

function Sparkline() {
  // A deterministic 12-point series rendered as a smooth area — purely decorative.
  const points = [22, 26, 24, 31, 29, 38, 34, 44, 41, 52, 49, 58];
  const w = 220;
  const h = 56;
  const max = 64;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - (p / max) * h] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="vs-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10a5c7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10a5c7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#vs-spark)" />
      <motion.path
        d={line}
        fill="none"
        stroke="#10a5c7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.6 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.4, ease: [0.21, 0.65, 0.36, 1] }}
      />
      <motion.circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2.5"
        fill="#F7931A"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.4 }}
      />
    </svg>
  );
}

function DashboardPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-32px_rgba(15,23,42,0.18)]">
      {/* ambient teal wash */}
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-watt-trust/15 blur-3xl"
        aria-hidden="true"
      />

      {/* window chrome */}
      <div className="relative flex items-center gap-1.5 border-b border-slate-200 px-5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-3 font-mono text-[11px] tracking-wide text-slate-500">
          voltscout · site-intel — illustrative
        </span>
      </div>

      <div className="relative space-y-6 p-6 sm:p-7">
        {/* coordinate header + headline score */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-slate-500">53.63°N, −113.10°W</div>
            <div className="mt-1 text-sm font-medium text-slate-700">Suitability report</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold leading-none tracking-tight text-slate-900 tabular-nums">
              81<span className="text-lg text-slate-400">/100</span>
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-watt-trust">
              Strong fit
            </div>
          </div>
        </div>

        {/* per-factor score bars */}
        <div className="space-y-3.5">
          {SCORE_ROWS.map((row, i) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">{row.label}</span>
                <span className="font-mono tabular-nums text-slate-700">{row.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-watt-trust"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${row.value}%` }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 1, delay: 0.15 * i, ease: [0.21, 0.65, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* sparkline footer — AESO pool price, illustrative */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
              AESO pool price · 24h
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-watt-trust">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-watt-trust" />
              live
            </span>
          </div>
          <Sparkline />
        </div>
      </div>
    </div>
  );
}

// ── Alternating row scaffolding ──────────────────────────────────────────────

function FeatureRow({
  feature,
  media,
  reverse,
}: {
  feature: Feature;
  media: ReactNode;
  reverse?: boolean;
}) {
  const Icon = feature.icon;

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Copy */}
      <Reveal y={28} className={reverse ? 'lg:order-2' : 'lg:order-1'}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm tabular-nums text-watt-bitcoin">{feature.index}</span>
          <span className="h-px flex-1 max-w-[3rem] bg-slate-200" />
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-watt-trust/10 ring-1 ring-watt-trust/25">
            <Icon className="h-4.5 w-4.5 text-watt-trust" />
          </span>
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          {feature.text}
        </p>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-6 flex flex-wrap gap-2.5"
        >
          {feature.tags.map((tag) => (
            <motion.li
              key={tag}
              variants={staggerItem}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
            >
              {tag}
            </motion.li>
          ))}
        </motion.ul>
      </Reveal>

      {/* Media */}
      <Reveal y={28} delay={0.08} className={reverse ? 'lg:order-1' : 'lg:order-2'}>
        {media}
      </Reveal>
    </div>
  );
}

// A framed 4:3 plate that hosts an animated scene instead of a static photo.
function ScenePlate({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.25)]">
      <div className="relative aspect-[4/3] w-full bg-white">
        {children}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-900/5" />
      </div>
    </div>
  );
}

export function Platform(): ReactNode {
  return (
    <section id="platform" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <Reveal y={24}>
          <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            VoltScout Platform
          </div>

          <h2 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            <SplitWords text="The software that" />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="finds hidden sites" delay={0.21} />
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
            Built in-house, VoltScout fuses grid topology, industrial registries, market
            data, and listing signals to surface power assets nobody is marketing. Every
            site in our portfolio was found, scored, and modelled on it — and the same
            platform is available to partners.
          </p>
        </Reveal>

        {/* Alternating feature rows */}
        <div className="mt-20 space-y-24 lg:mt-28 lg:space-y-32">
          <FeatureRow
            feature={FEATURES[0]}
            media={
              <ScenePlate>
                <JourneyScene accent="#10a5c7" intensity={1} className="absolute inset-0 h-full w-full" />
              </ScenePlate>
            }
          />
          <FeatureRow
            feature={FEATURES[1]}
            media={<DashboardPanel />}
            reverse
          />
          <FeatureRow
            feature={FEATURES[2]}
            media={
              <ScenePlate>
                <GridFlowScene accent="#10a5c7" className="absolute inset-0 h-full w-full" />
              </ScenePlate>
            }
          />
        </div>

        {/* Live telemetry strip + CTA */}
        <Reveal y={20} delay={0.05}>
          <div className="mt-24 flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-10 lg:mt-32">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-watt-trust/10 ring-1 ring-watt-trust/25">
                <Activity className="h-5 w-5 text-watt-trust" />
              </span>
              <div>
                <div className="text-lg font-semibold text-slate-900">From discovery to live telemetry</div>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
                  Facility dashboards, alerts, and automation rules carry the same site from
                  candidate to operating asset — all in one platform.
                </p>
              </div>
            </div>

            <Link
              to="/app"
              className="inline-flex h-12 shrink-0 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
            >
              Enter the platform <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
