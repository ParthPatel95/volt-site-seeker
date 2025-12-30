import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, Zap, Building2, Shield } from 'lucide-react';
import facilityImage from '@/assets/alberta-facility-aerial.jpg';

export const FlagshipFacilitySection = () => {
  const specs = [
    { icon: Zap, label: 'Power Capacity', value: '135MW' },
    { icon: Building2, label: 'Facility Size', value: '26 Acres' },
    { icon: Shield, label: 'Uptime SLA', value: '99.99%' },
    { icon: MapPin, label: 'Grid', value: 'Direct AESO' }
  ];

  return (
    <section className="py-12 md:py-16 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(var(--watt-navy))] mb-4">
              Our Flagship Facility
            </h2>
            <p className="text-lg text-[hsl(var(--watt-navy)/0.7)] max-w-2xl mx-auto">
              Alberta Heartland 135 - A fully owned, world-class mining infrastructure site
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <ScrollReveal delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={facilityImage} 
                alt="Alberta Heartland 135 Facility"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-[hsl(var(--watt-navy)/0.9)] backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold">
                  Alberta Heartland 135
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-[hsl(var(--watt-bitcoin)/0.9)] backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  Under Development
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div>
              <h3 className="text-2xl font-bold text-[hsl(var(--watt-navy))] mb-4">
                Strategic Location, Premium Infrastructure
              </h3>
              <p className="text-[hsl(var(--watt-navy)/0.7)] mb-6">
                Located in Alberta's industrial heartland, our flagship facility combines direct grid access, 
                cold climate efficiency, and world-class infrastructure to provide the optimal environment 
                for large-scale Bitcoin mining operations.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {specs.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <div key={index} className="bg-muted/50 rounded-lg p-4">
                      <Icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))] mb-2" />
                      <div className="text-sm text-[hsl(var(--watt-navy)/0.6)] mb-1">{spec.label}</div>
                      <div className="text-xl font-bold text-[hsl(var(--watt-navy))]">{spec.value}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.2)] rounded-lg">
                <p className="text-sm text-[hsl(var(--watt-navy))]">
                  <strong className="text-[hsl(var(--watt-success))]">100% Owned:</strong> Complete control over operations, 
                  maintenance, and client service delivery ensures the highest quality hosting experience.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
