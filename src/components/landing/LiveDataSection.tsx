
import { InteractiveInvestmentCalculator } from './InteractiveInvestmentCalculator';
import { LiveDataPreview } from './LiveDataPreview';
import { LiveERCOTData } from './LiveERCOTData';
import { LiveAESOData } from './LiveAESOData';
import { ScrollReveal } from './ScrollAnimations';

export const LiveDataSection = () => {
  return (
    <section className="relative z-10 py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100}>
          <div className="text-center mb-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Live Market Intelligence
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Real-time data and analytics powering our investment decisions
            </p>
          </div>
        </ScrollReveal>

        {/* Live Data Grid */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveInvestmentCalculator />
            <LiveDataPreview />
            <LiveERCOTData />
            <LiveAESOData />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
