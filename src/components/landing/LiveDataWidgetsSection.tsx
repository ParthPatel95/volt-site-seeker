
import { InteractiveInvestmentCalculator } from './InteractiveInvestmentCalculator';
import { LiveDataPreview } from './LiveDataPreview';
import { LiveERCOTData } from './LiveERCOTData';
import { ScrollReveal } from './ScrollAnimations';

export const LiveDataWidgetsSection = () => {
  return (
    <section className="relative z-10 py-8 md:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100}>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Live Market Intelligence
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Real-time data and interactive tools to analyze investment opportunities 
              and market conditions across North American power markets.
            </p>
          </div>
        </ScrollReveal>

        {/* Live Data Grid - Updated for 3 widgets */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <InteractiveInvestmentCalculator />
            <LiveDataPreview />
            <div className="lg:col-span-2 xl:col-span-1">
              <LiveERCOTData />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
