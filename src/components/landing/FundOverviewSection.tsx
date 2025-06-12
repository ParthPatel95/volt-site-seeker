
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MapPin, Shield } from 'lucide-react';

export const FundOverviewSection = () => {
  return (
    <section className="relative z-10 py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-white">
            Fund I Overview
          </h2>
          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Strategic acquisition and development of undervalued power assets for premium digital infrastructure
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-electric-blue to-electric-yellow rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <CardTitle className="text-white text-sm sm:text-base md:text-lg">Target Returns</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-electric-blue">2.0-2.5x</div>
                <div className="text-slate-300 text-xs sm:text-sm">MOIC</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-electric-yellow">30-40%</div>
                <div className="text-slate-300 text-xs sm:text-sm">Net IRR</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <CardTitle className="text-white text-sm sm:text-base md:text-lg">Current Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-neon-green">700MW+</div>
                <div className="text-slate-300 text-xs sm:text-sm">Power Capacity</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-electric-blue">1,000+</div>
                <div className="text-slate-300 text-xs sm:text-sm">Acres</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <CardTitle className="text-white text-sm sm:text-base md:text-lg">Exit Strategy</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-electric-yellow">~2 Year</div>
                <div className="text-slate-300 text-xs sm:text-sm">Hold Period</div>
                <div className="text-sm sm:text-base md:text-lg font-semibold text-warm-orange">Data Center Premium</div>
                <div className="text-slate-300 text-xs sm:text-sm">Exit Value</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
