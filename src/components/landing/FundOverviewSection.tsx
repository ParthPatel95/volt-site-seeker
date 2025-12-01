
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MapPin, Shield } from 'lucide-react';

export const FundOverviewSection = () => {
  return (
    <section className="relative z-10 py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-watt-navy">
            Fund I Overview
          </h2>
          <p className="text-watt-navy/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Strategic acquisition and development of undervalued power assets for premium digital infrastructure
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border-gray-200 hover:border-watt-trust/50 transition-all group shadow-institutional">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-watt-trust/10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-watt-trust" />
              </div>
              <CardTitle className="text-watt-navy text-sm sm:text-base md:text-lg">Target Returns</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-watt-trust">2.0-2.5x</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">MOIC</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-watt-bitcoin">30-40%</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">Net IRR</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 hover:border-watt-success/50 transition-all group shadow-institutional">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-watt-success/10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-watt-success" />
              </div>
              <CardTitle className="text-watt-navy text-sm sm:text-base md:text-lg">Current Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-watt-success">700MW+</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">Power Capacity</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-watt-trust">1,000+</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">Acres</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 hover:border-watt-bitcoin/50 transition-all group sm:col-span-2 lg:col-span-1 shadow-institutional">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-watt-bitcoin/10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-watt-bitcoin" />
              </div>
              <CardTitle className="text-watt-navy text-sm sm:text-base md:text-lg">Exit Strategy</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-watt-bitcoin">~2 Year</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">Hold Period</div>
                <div className="text-sm sm:text-base md:text-lg font-semibold text-watt-trust">Data Center Premium</div>
                <div className="text-watt-navy/60 text-xs sm:text-sm">Exit Value</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
