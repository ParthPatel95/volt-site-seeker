import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollAnimations';
import {
  PIPELINE_PROJECTS, TOTAL_MW, ENERGY_TYPE_COLORS, type PipelineProject,
} from '@/data/advisory-pipeline';

// Single source of truth: this section renders src/data/advisory-pipeline.ts
// verbatim — the same rows behind the hero globe and the Advisory page map —
// so the public site can never show a portfolio that disagrees with itself.

const STATUS_STYLE: Record<PipelineProject['status'], string> = {
  'Operating': 'bg-watt-success/10 text-watt-success border-watt-success/30',
  'Under Development': 'bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/30',
  'Diligence': 'bg-watt-trust/10 text-watt-trust border-watt-trust/30',
};

export const GlobalSitesSection = () => {
  const sites = [...PIPELINE_PROJECTS].sort((a, b) => b.capacityMw - a.capacityMw);

  return (
    <section className="py-20 sm:py-24 px-6 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                The pipeline, <span className="text-gradient-watt">site by site</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {TOTAL_MW.toLocaleString()} MW under our lens today — every site below is
                the same data behind the globe above and our Advisory pipeline map.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/advisory">
                Full pipeline detail <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sites.map((p, i) => {
            const energy = ENERGY_TYPE_COLORS[p.energyType];
            return (
              <ScrollReveal key={p.id} delay={0.04 * i}>
                <div className="flex flex-col h-full p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
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
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
