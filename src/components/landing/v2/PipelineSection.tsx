import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal, CountUp } from './motion';
import {
  PIPELINE_PROJECTS, TOTAL_MW, UNDER_DEV_MW, COUNTRIES, ENERGY_TYPE_COLORS,
  type PipelineProject,
} from '@/data/advisory-pipeline';

// Interactive pipeline browser. Single source of truth: every card and every
// number renders src/data/advisory-pipeline.ts — the module behind the hero
// globe and the Advisory map — so the page can never disagree with itself.

const STATUS_FILTERS = ['All', 'Under Development', 'Diligence'] as const;

const STATUS_STYLE: Record<PipelineProject['status'], string> = {
  'Operating': 'bg-watt-success/10 text-watt-success border-watt-success/30',
  'Under Development': 'bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/30',
  'Diligence': 'bg-watt-trust/10 text-watt-trust border-watt-trust/30',
};

export function PipelineSection() {
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');
  const sites = [...PIPELINE_PROJECTS]
    .filter((p) => filter === 'All' || p.status === filter)
    .sort((a, b) => b.capacityMw - a.capacityMw);

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">Pipeline</p>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                The portfolio, <span className="text-gradient-watt">site by site</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Same data as the globe above and our Advisory pipeline map — nothing here
                is marketing-only.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/advisory">
                Full pipeline detail <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* KPI band */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border/60 mb-10">
            {[
              { v: TOTAL_MW, suffix: ' MW', label: 'Total pipeline', color: 'text-primary' },
              { v: UNDER_DEV_MW, suffix: ' MW', label: 'Under development', color: 'text-watt-success' },
              { v: COUNTRIES, suffix: '', label: 'Countries', color: 'text-watt-trust' },
              { v: PIPELINE_PROJECTS.length, suffix: '', label: 'Sites in motion', color: 'text-watt-bitcoin' },
            ].map((k) => (
              <div key={k.label} className="bg-card/80 backdrop-blur-sm p-6">
                <div className={`text-3xl sm:text-4xl font-bold ${k.color}`}>
                  <CountUp value={k.v} />{k.suffix}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1.5">{k.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Status filter */}
        <Reveal delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Site cards */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {sites.map((p) => {
              const energy = ENERGY_TYPE_COLORS[p.energyType];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col h-full p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-shadow duration-300"
                  style={{ boxShadow: '0 0 0 0 transparent' }}
                  onPointerEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 34px -14px ${energy?.hex ?? 'transparent'}`;
                  }}
                  onPointerLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl leading-none">{p.flagEmoji}</span>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-0.5">{p.location}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {p.country}
                  </p>
                  <p className="text-sm text-muted-foreground leading-snug flex-1">{p.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: energy?.hex }}>
                      {p.capacityMw}<span className="text-sm font-medium text-muted-foreground ml-1">MW</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px]" style={{ color: energy?.hex }}>
                      {p.energyType}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
