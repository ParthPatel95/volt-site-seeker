import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Server, Radar, GraduationCap, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';

// Every card links to a live offering — no aspirational vapor. Copy mirrors
// what each destination page actually claims.
const SERVICES = [
  {
    icon: Briefcase,
    title: 'Infrastructure Advisory',
    to: '/advisory',
    accent: 'watt-trust',
    description:
      'Site sourcing, interconnection diligence, energy procurement, and datacenter EPC guidance — backed by our own development pipeline.',
  },
  {
    icon: Server,
    title: 'Mining Hosting',
    to: '/hosting',
    accent: 'watt-bitcoin',
    description:
      'Fully-owned Alberta capacity with transparent power rates, live facility telemetry, and an ROI calculator before you commit.',
  },
  {
    icon: Radar,
    title: 'VoltScout Platform',
    to: '/app',
    accent: 'primary',
    description:
      'AI-powered site intelligence: grid mapping, AESO/ERCOT price analytics, and industrial site discovery for power-dense compute.',
  },
  {
    icon: GraduationCap,
    title: 'WattByte Academy',
    to: '/academy',
    accent: 'watt-purple',
    description:
      'Free operator-grade courses — Bitcoin mining, datacenter engineering, AESO markets, immersion cooling, and more.',
  },
  {
    icon: TrendingUp,
    title: 'WattFund',
    to: '/wattfund',
    accent: 'watt-success',
    description:
      'Institutional access to the infrastructure we build — staged funds deploying into power-first digital assets.',
  },
] as const;

const ACCENT_CLASSES: Record<string, { icon: string; ring: string }> = {
  'watt-trust': { icon: 'text-watt-trust bg-watt-trust/10', ring: 'hover:border-watt-trust/50' },
  'watt-bitcoin': { icon: 'text-watt-bitcoin bg-watt-bitcoin/10', ring: 'hover:border-watt-bitcoin/50' },
  primary: { icon: 'text-primary bg-primary/10', ring: 'hover:border-primary/50' },
  'watt-purple': { icon: 'text-watt-purple bg-watt-purple/10', ring: 'hover:border-watt-purple/50' },
  'watt-success': { icon: 'text-watt-success bg-watt-success/10', ring: 'hover:border-watt-success/50' },
};

export const ServicesSection = () => {
  return (
    <section className="py-20 sm:py-24 px-6 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              One platform, <span className="text-gradient-watt">five ways in</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From advisory mandates to hosted megawatts — everything we offer runs on
              infrastructure we source, diligence, and operate ourselves.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((s, i) => {
            const accent = ACCENT_CLASSES[s.accent];
            return (
              <ScrollReveal key={s.title} delay={0.05 * i}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                  <Link
                    to={s.to}
                    className={`group flex flex-col h-full p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-colors ${accent.ring}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent.icon}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                      {s.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </Link>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
