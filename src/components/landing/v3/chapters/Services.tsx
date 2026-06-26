import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, Server, Radar, GraduationCap, TrendingUp, ArrowUpRight, ArrowRight,
} from 'lucide-react';
import { Reveal, SplitWords, TiltCard, staggerContainer, staggerItem } from '../scroll';

// Services — "What we do." The five live offerings re-presented as a cinematic
// stagger grid of 3D tilt cards. Copy, routes and structure carry over verbatim
// from the v2 ServicesGrid; here they sit on dark glass with restrained brand
// tints (orange/teal only — one family, no rainbow) and a weighted hover lift.

type Accent = 'bitcoin' | 'trust';

interface Service {
  icon: typeof Briefcase;
  title: string;
  to: string;
  accent: Accent;
  description: string;
  /** First card spans two columns on the widest grid for editorial rhythm. */
  feature?: boolean;
}

const ACCENT: Record<Accent, { hex: string; chip: string; iconWrap: string; iconText: string; ring: string }> = {
  bitcoin: {
    hex: '#F7931A',
    chip: 'bg-watt-bitcoin/10 text-watt-bitcoin ring-watt-bitcoin/20',
    iconWrap: 'bg-watt-bitcoin/12 ring-watt-bitcoin/25',
    iconText: 'text-watt-bitcoin',
    ring: 'group-hover:border-watt-bitcoin/40',
  },
  trust: {
    hex: '#10a5c7',
    chip: 'bg-watt-trust/10 text-watt-trust ring-watt-trust/20',
    iconWrap: 'bg-watt-trust/12 ring-watt-trust/25',
    iconText: 'text-watt-trust',
    ring: 'group-hover:border-watt-trust/40',
  },
};

const SERVICES: Service[] = [
  {
    icon: Briefcase,
    title: 'Infrastructure Advisory',
    to: '/advisory',
    accent: 'trust',
    feature: true,
    description:
      "Comprehensive mandates to find power assets others can't see: off-market site sourcing with our proprietary discovery methods, interconnection diligence, energy procurement, and datacenter EPC guidance — backed by our own development pipeline.",
  },
  {
    icon: Server,
    title: 'Mining Hosting',
    to: '/hosting',
    accent: 'bitcoin',
    description:
      'Fully-owned Alberta capacity with transparent rates, live telemetry, and an ROI calculator before you commit.',
  },
  {
    icon: Radar,
    title: 'VoltScout Platform',
    to: '/app',
    accent: 'trust',
    description:
      'AI-powered site intelligence: grid mapping, AESO/ERCOT analytics, and industrial site discovery for power-dense compute.',
  },
  {
    icon: GraduationCap,
    title: 'WattByte Academy',
    to: '/academy',
    accent: 'bitcoin',
    description:
      'Free operator-grade courses — Bitcoin mining, datacenter engineering, AESO markets, immersion cooling.',
  },
  {
    icon: TrendingUp,
    title: 'WattFund',
    to: '/wattfund',
    accent: 'trust',
    description:
      'Institutional access to the infrastructure we build — staged funds deploying into power-first digital assets.',
  },
];

function ServiceCard({ service }: { service: Service }) {
  const a = ACCENT[service.accent];
  const Icon = service.icon;

  return (
    <motion.div
      variants={staggerItem}
      className={service.feature ? 'lg:col-span-2' : ''}
    >
      <Link to={service.to} className="block h-full focus:outline-none">
        <TiltCard
          className={[
            'group relative flex h-full flex-col overflow-hidden rounded-2xl',
            'border border-white/10 bg-white/[0.04] p-6 sm:p-8',
            'transition-colors duration-300 hover:bg-white/[0.06]',
            a.ring,
          ].join(' ')}
        >
          {/* faint accent wash that warms the card on hover */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.16]"
            style={{ backgroundColor: a.hex }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full flex-col">
            <div
              className={[
                'mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1',
                a.iconWrap,
              ].join(' ')}
            >
              <Icon className={['h-6 w-6', a.iconText].join(' ')} />
            </div>

            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              {service.title}
              <ArrowUpRight
                className="h-4 w-4 -translate-x-1 translate-y-1 text-white/70 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
              />
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {service.description}
            </p>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}

export function Services(): ReactNode {
  return (
    <section id="services" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal y={24}>
          <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            What we offer
          </div>

          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <SplitWords text="One platform," />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="five ways in" delay={0.18} />
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg">
            From advisory mandates to hosted megawatts — everything we offer runs on
            infrastructure we source, diligence, and operate ourselves.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </motion.div>

        <Reveal y={20} delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/advisory"
              className="inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-[#060b16] transition-colors hover:bg-watt-bitcoin"
            >
              Work with us <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <span className="text-sm text-white/45">
              One team across sourcing, development, and operations.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
