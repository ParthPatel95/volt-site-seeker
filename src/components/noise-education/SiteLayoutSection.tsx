import { Layout, Building, Compass, TreePine, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const layoutPrinciples = [
  {
    title: 'Equipment Clustering',
    description: 'Group noisy equipment in central location to maximize distance to all boundaries',
    icon: Building,
  },
  {
    title: 'Building Shields',
    description: 'Use office buildings, warehouses, or utility structures as natural barriers',
    icon: Layout,
  },
  {
    title: 'Exhaust Orientation',
    description: 'Direct fan exhausts and air intakes away from sensitive receptors',
    icon: Wind,
  },
  {
    title: 'Buffer Zones',
    description: 'Establish vegetation buffers and setback areas on perimeter',
    icon: TreePine,
  },
];

export const SiteLayoutSection = () => {
  return (
    <section id="site-layout" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <LearningObjectives
            objectives={[
              'Apply equipment clustering principles to maximize buffer distances',
              'Use existing structures as natural sound barriers',
              'Orient noise sources away from sensitive receptors',
              'Design effective vegetation buffer zones'
            ]}
            estimatedTime="6 min"
            prerequisites={[
              { title: 'Mitigation Techniques', href: '#mitigation' }
            ]}
          />

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-bitcoin/10 rounded-full mb-4">
              <Layout className="h-4 w-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Site Planning</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Site Layout Optimization
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Strategic placement of equipment and structures can significantly reduce noise impact
              on neighboring properties without additional capital investment.
            </p>
          </div>
        </ScrollReveal>

        {/* Layout Principles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {layoutPrinciples.map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <ScrollReveal key={idx} delay={idx * 100}>
                <Card className="bg-white border-none shadow-institutional h-full">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 bg-watt-bitcoin/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-watt-bitcoin" />
                    </div>
                    <h3 className="font-bold text-watt-navy mb-2">{principle.title}</h3>
                    <p className="text-sm text-watt-navy/70">{principle.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Alberta Heartland Layout Diagram */}
        <ScrollReveal delay={400}>
          <Card className="bg-white border-none shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6">Alberta Heartland 45MW Site Layout</h3>
              
              <div className="relative bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-8 min-h-[400px]">
                {/* Compass */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <Compass className="h-5 w-5 text-watt-navy/50" />
                  <span className="text-xs text-watt-navy/50">N ↑</span>
                </div>

                {/* Scale */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="w-20 h-1 bg-watt-navy/30" />
                  <span className="text-xs text-watt-navy/50">500m</span>
                </div>

                {/* Container Grid (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-10 bg-watt-coinbase/60 rounded-sm border border-watt-coinbase"
                        title={`Container ${i + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-watt-navy/70 mt-2">30 Hydro Containers</p>
                </div>

                {/* Substation */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-12 bg-yellow-400/60 rounded border border-yellow-500 flex items-center justify-center">
                    <span className="text-xs">⚡</span>
                  </div>
                  <p className="text-center text-xs text-watt-navy/70 mt-1">Substation</p>
                </div>

                {/* Cooling Towers (North) */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 bg-blue-400/60 rounded-full border border-blue-500" />
                    ))}
                  </div>
                  <p className="text-center text-xs text-watt-navy/70 mt-1">Cooling Towers</p>
                </div>

                {/* Buffer Zone (South) */}
                <div className="absolute bottom-4 left-1/4 right-1/4 h-8 bg-green-600/30 rounded flex items-center justify-center">
                  <span className="text-xs text-green-800">🌲 Buffer Zone 🌲</span>
                </div>

                {/* Nearest Residence */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-center">
                  <div className="text-3xl mb-1">🏠</div>
                  <p className="text-xs text-watt-navy/70">Nearest</p>
                  <p className="text-xs text-watt-navy/70">Residence</p>
                  <p className="text-xs font-bold text-watt-success">1.7km →</p>
                </div>

                {/* Noise Direction Arrows */}
                <div className="absolute top-1/3 left-[60%] text-watt-bitcoin/50 text-sm">
                  ↗ Low noise
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-watt-light rounded-lg text-center">
                  <p className="text-2xl font-bold text-watt-navy">30</p>
                  <p className="text-sm text-watt-navy/70">Hydro Containers</p>
                </div>
                <div className="p-4 bg-watt-light rounded-lg text-center">
                  <p className="text-2xl font-bold text-watt-coinbase">North</p>
                  <p className="text-sm text-watt-navy/70">Cooling Orientation</p>
                </div>
                <div className="p-4 bg-watt-light rounded-lg text-center">
                  <p className="text-2xl font-bold text-watt-success">1.7km</p>
                  <p className="text-sm text-watt-navy/70">Receptor Distance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <SectionSummary
            title="Site Layout Optimization"
            takeaways={[
              'Equipment clustering maximizes distance to all property boundaries',
              'Existing structures provide free noise barriers',
              'Orienting exhaust away from receptors can reduce perceived noise by 3-6 dB',
              'Vegetation buffers add psychological and modest acoustic benefits'
            ]}
            nextSteps={[{ title: 'Monitoring & Measurement', href: '#monitoring' }]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
