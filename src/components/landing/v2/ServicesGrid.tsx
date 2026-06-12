import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Server, Radar, GraduationCap, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { Reveal, TiltCard, staggerContainer, staggerItem } from './motion';

// Five live offerings, each card links to a real destination; copy mirrors
// what those pages actually claim. Interactive: spring 3D tilt + cursor glare.

const SERVICES = [
  {
    icon: Briefcase, title: 'Infrastructure Advisory', to: '/advisory', color: 'hsl(var(--watt-trust))',
    description: 'Comprehensive mandates to find power assets others can\'t see: off-market site sourcing with our proprietary discovery methods, interconnection diligence, energy procurement, and datacenter EPC guidance — backed by our own development pipeline.',
    span: 'lg:col-span-2',
  },
  {
    icon: Server, title: 'Mining Hosting', to: '/hosting', color: 'hsl(var(--watt-bitcoin))',
    description: 'Fully-owned Alberta capacity with transparent rates, live telemetry, and an ROI calculator before you commit.',
    span: '',
  },
  {
    icon: Radar, title: 'VoltScout Platform', to: '/app', color: 'hsl(var(--primary))',
    description: 'AI-powered site intelligence: grid mapping, AESO/ERCOT analytics, and industrial site discovery for power-dense compute.',
    span: '',
  },
  {
    icon: GraduationCap, title: 'WattByte Academy', to: '/academy', color: 'hsl(var(--watt-purple))',
    description: 'Free operator-grade courses — Bitcoin mining, datacenter engineering, AESO markets, immersion cooling.',
    span: '',
  },
  {
    icon: TrendingUp, title: 'WattFund', to: '/wattfund', color: 'hsl(var(--watt-success))',
    description: 'Institutional access to the infrastructure we build — staged funds deploying into power-first digital assets.',
    span: '',
  },
] as const;

export function ServicesGrid() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            <span className="font-mono mr-2 opacity-60">02 /</span> What we offer
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mb-4">
            One platform, <span className="text-gradient-watt">five ways in</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-14">
            From advisory mandates to hosted megawatts — everything we offer runs on
            infrastructure we source, diligence, and operate ourselves.
          </p>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {SERVICES.map((s) => (
            <motion.div key={s.title} variants={staggerItem} className={s.span}>
              <TiltCard className="group relative h-full rounded-2xl">
                <Link
                  to={s.to}
                  className="flex flex-col h-full p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-colors duration-300"
                  style={{ ['--svc' as string]: s.color }}
                  onPointerEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${s.color} 55%, transparent)`; }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `color-mix(in srgb, ${s.color} 14%, transparent)`, color: s.color }}
                  >
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2.5 flex items-center gap-2">
                    {s.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
