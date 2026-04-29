import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { PIPELINE_PROJECTS, ENERGY_TYPE_COLORS } from '@/data/advisory-pipeline';
import { Badge } from '@/components/ui/badge';

const featured = ['alberta-heartland', 'uganda-jinja', 'usa-texas'];

export const AdvisoryCaseStudies: React.FC = () => {
  const items = PIPELINE_PROJECTS.filter(p => featured.includes(p.id));
  return (
    <section className="py-16 md:py-24 bg-secondary/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-watt-bitcoin font-semibold mb-3">Featured engagements</div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Real sites. Real megawatts.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A snapshot of three engagements we are actively advising on, building, or operating today — anchored by our own 135 MW Alberta Heartland build.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 0.1}>
              <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elegant transition-all h-full flex flex-col">
                <div className="aspect-video relative overflow-hidden">
                  <img src={p.image} alt={p.location} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-2xl">{p.flagEmoji}</span>
                    <Badge className="border-0" style={{ backgroundColor: ENERGY_TYPE_COLORS[p.energyType].hex, color: '#fff' }}>{p.energyType}</Badge>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{p.location}</h3>
                    <span className="font-mono text-watt-bitcoin font-bold">{p.capacityMw} MW</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                    <span>{p.country}</span>
                    <span className="text-watt-bitcoin font-medium">{p.status}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
