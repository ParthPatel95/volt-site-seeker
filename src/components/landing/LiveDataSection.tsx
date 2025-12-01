
import { LiveERCOTData } from './LiveERCOTData';
import { LiveAESOData } from './LiveAESOData';
import { ScrollReveal } from './ScrollAnimations';

export const LiveDataSection = () => {
  return (
    <section className="relative z-10 py-12 md:py-16 px-3 sm:px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100}>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-3 sm:mb-4 leading-tight">
              Live Market Intelligence
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-watt-navy/70 max-w-3xl mx-auto leading-relaxed px-2">
              Real-time data and analytics powering our investment decisions
            </p>
          </div>
        </ScrollReveal>

        {/* Live Data Grid */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <LiveERCOTData />
            <LiveAESOData />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
