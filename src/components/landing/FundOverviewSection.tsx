import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export const FundOverviewSection = () => {
  return (
    <section className="relative z-10 py-12 md:py-16 px-3 sm:px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/30 mb-4">
              <span className="text-sm font-medium text-watt-trust">Fund I Details</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-watt-navy">
              Fund Overview
            </h2>
            <p className="text-base md:text-lg text-watt-navy/70 max-w-2xl mx-auto px-2">
              Strategic infrastructure investments with institutional-grade returns
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Target Returns Card */}
          <ScrollReveal delay={0.1} direction="up">
            <Card className="bg-white border-gray-200 overflow-hidden shadow-institutional hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                <div className="flex items-center justify-between">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-watt-trust" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-watt-navy">Target Returns</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-watt-navy/60">Fund I performance targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">MOIC</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-trust">
                    2.0-2.5x
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">Net IRR</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-success">
                    30-40%
                  </span>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Current Pipeline Card */}
          <ScrollReveal delay={0.2} direction="up">
            <Card className="bg-white border-gray-200 overflow-hidden shadow-institutional hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                <div className="flex items-center justify-between">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-watt-bitcoin" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-watt-navy">Current Pipeline</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-watt-navy/60">Active deal flow and capacity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">Power Capacity</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={700} suffix="+ MW" />
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">Acres</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-trust">
                    <AnimatedCounter end={150} suffix="+" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Exit Strategy Card */}
          <ScrollReveal delay={0.3} direction="up">
            <Card className="bg-white border-gray-200 overflow-hidden shadow-institutional hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-watt-success" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-watt-navy">Exit Strategy</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-watt-navy/60">Value realization approach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">Hold Period</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={2} suffix=" Years" />
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-watt-light to-white border border-gray-100">
                  <span className="text-xs sm:text-sm text-watt-navy/70">Exit Value</span>
                  <span className="text-base sm:text-lg md:text-xl font-bold text-watt-success">$10-15M/MW</span>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
