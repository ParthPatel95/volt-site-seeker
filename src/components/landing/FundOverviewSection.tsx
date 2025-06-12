
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MapPin, Shield } from 'lucide-react';

export const FundOverviewSection = () => {
  return (
    <section className="relative z-10 py-12 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Fund I Overview
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            Strategic acquisition and development of undervalued power assets for premium digital infrastructure
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-electric-yellow rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Target Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-electric-blue">2.0-2.5x</div>
                <div className="text-slate-300 text-sm">MOIC</div>
                <div className="text-xl font-bold text-electric-yellow">30-40%</div>
                <div className="text-slate-300 text-sm">Net IRR</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Current Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-neon-green">700MW+</div>
                <div className="text-slate-300 text-sm">Power Capacity</div>
                <div className="text-xl font-bold text-electric-blue">1,000+</div>
                <div className="text-slate-300 text-sm">Acres</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Exit Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-electric-yellow">~2 Year</div>
                <div className="text-slate-300 text-sm">Hold Period</div>
                <div className="text-lg font-semibold text-warm-orange">Data Center Premium</div>
                <div className="text-slate-300 text-sm">Exit Value</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
