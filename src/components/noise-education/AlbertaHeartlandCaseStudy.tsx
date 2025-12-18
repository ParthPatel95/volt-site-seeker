import { Building2, Droplets, MapPin, Shield, CheckCircle, Calculator, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const facilitySpecs = [
  { label: 'Total Capacity', value: '45 MW', icon: '⚡' },
  { label: 'Container Count', value: '30 Units', icon: '📦' },
  { label: 'Container Type', value: 'Bitmain Hydro', icon: '💧' },
  { label: 'Power per Unit', value: '1.5 MW avg', icon: '🔌' },
  { label: 'Cooling Method', value: 'Hydro-Cooled', icon: '❄️' },
  { label: 'Nearest Residence', value: '1.7 km', icon: '🏠' },
];

const noiseCalculation = [
  { step: 'Single Container', value: '67 dB', note: 'Bitmain Hydro spec' },
  { step: 'Cumulative (30 units)', value: '+14.8 dB', note: '10 × log₁₀(30)' },
  { step: 'Total at Source', value: '81.8 dB', note: '67 + 14.8' },
  { step: 'Distance Attenuation', value: '-64.6 dB', note: '20 × log₁₀(1700)' },
  { step: 'At Residence', value: '~17 dB', note: 'Final result' },
];

const complianceData = [
  { standard: 'WHO Night Residential', limit: '45 dBA', actual: '17 dBA', margin: '-28 dB', status: 'excellent' },
  { standard: 'Alberta AUC Rule 012', limit: '40 dBA', actual: '17 dBA', margin: '-23 dB', status: 'excellent' },
  { standard: 'OSHA Workplace', limit: '90 dBA', actual: '81.8 dBA', margin: '-8 dB', status: 'compliant' },
];

const mitigationReserve = [
  { technique: 'Earth Berm (Southern)', potential: '-7 dB' },
  { technique: 'Acoustic Barriers (Transformers)', potential: '-12 dB' },
  { technique: 'VFD on Cooling Systems', potential: '-6 dB' },
  { technique: 'Total Reserve Capacity', potential: '-25 dB' },
];

export const AlbertaHeartlandCaseStudy = () => {
  return (
    <section id="case-study" className="py-16 md:py-24 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-navy/95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge className="bg-watt-bitcoin text-white mb-4">Real-World Case Study</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Alberta Heartland 45MW
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Complete noise analysis of our flagship facility demonstrating how hydro-cooling 
              and strategic site selection achieve exceptional noise compliance.
            </p>
          </div>
        </ScrollReveal>

        {/* Facility Specifications */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {facilitySpecs.map((spec, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur">
                <span className="text-2xl mb-2 block">{spec.icon}</span>
                <p className="text-xl font-bold text-watt-bitcoin">{spec.value}</p>
                <p className="text-xs text-white/60">{spec.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Noise Calculation Breakdown */}
        <ScrollReveal delay={200}>
          <Card className="bg-white/5 backdrop-blur border-white/10 mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-watt-bitcoin" />
                Step-by-Step Noise Calculation
              </h3>
              
              <div className="space-y-4">
                {noiseCalculation.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-watt-bitcoin/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-watt-bitcoin">{idx + 1}</span>
                    </div>
                    <div className="flex-1 grid md:grid-cols-3 gap-2 items-center">
                      <span className="text-white/80">{item.step}</span>
                      <span className={`font-mono font-bold text-lg ${idx === noiseCalculation.length - 1 ? 'text-watt-success' : 'text-watt-bitcoin'}`}>
                        {item.value}
                      </span>
                      <span className="text-xs text-white/50">{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-watt-success/20 rounded-lg">
                <p className="text-sm">
                  <strong className="text-watt-success">Key Finding:</strong> At 1.7km distance, our facility produces 
                  approximately <strong>17 dBA</strong> at the nearest residence — essentially <strong>inaudible</strong> and 
                  far below all regulatory limits.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Compliance Dashboard */}
        <ScrollReveal delay={300}>
          <Card className="bg-white/5 backdrop-blur border-white/10 mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-watt-success" />
                Compliance Dashboard
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-sm font-semibold text-white/70">Standard</th>
                      <th className="text-center py-3 text-sm font-semibold text-white/70">Limit</th>
                      <th className="text-center py-3 text-sm font-semibold text-white/70">Our Level</th>
                      <th className="text-center py-3 text-sm font-semibold text-white/70">Margin</th>
                      <th className="text-center py-3 text-sm font-semibold text-white/70">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceData.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-4 text-sm">{row.standard}</td>
                        <td className="py-4 text-center font-mono">{row.limit}</td>
                        <td className="py-4 text-center font-mono text-watt-coinbase font-bold">{row.actual}</td>
                        <td className="py-4 text-center font-mono text-watt-success">{row.margin}</td>
                        <td className="py-4 text-center">
                          <Badge className={row.status === 'excellent' ? 'bg-watt-success' : 'bg-watt-coinbase'}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {row.status === 'excellent' ? 'Excellent' : 'Compliant'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Hydro vs Air-Cooled Comparison */}
        <ScrollReveal delay={400}>
          <Card className="bg-gradient-to-r from-watt-bitcoin/20 to-watt-success/20 backdrop-blur border-white/10 mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Hydro-Cooling Advantage
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-sm text-white/60 mb-2">If Air-Cooled (95 dB/unit)</p>
                  <p className="text-4xl font-bold text-red-400 font-mono">109.8 dB</p>
                  <p className="text-sm text-white/50 mt-2">At source</p>
                  <p className="text-xl font-bold text-red-400 font-mono mt-4">~45 dB</p>
                  <p className="text-sm text-white/50">At 1.7km residence</p>
                  <Badge variant="outline" className="mt-4 border-red-400 text-red-400">
                    At regulatory limit
                  </Badge>
                </div>
                
                <div className="text-center p-6 bg-watt-success/10 rounded-xl border border-watt-success/20">
                  <p className="text-sm text-white/60 mb-2">With Hydro-Cooling (67 dB/unit)</p>
                  <p className="text-4xl font-bold text-watt-success font-mono">81.8 dB</p>
                  <p className="text-sm text-white/50 mt-2">At source</p>
                  <p className="text-xl font-bold text-watt-success font-mono mt-4">~17 dB</p>
                  <p className="text-sm text-white/50">At 1.7km residence</p>
                  <Badge className="mt-4 bg-watt-success">
                    28 dB below limit ✓
                  </Badge>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-3xl font-bold text-watt-bitcoin">630×</p>
                <p className="text-sm text-white/60">Less sound energy with hydro-cooling</p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Mitigation Reserve */}
        <ScrollReveal delay={500}>
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Available Mitigation Reserve (If Needed)</h3>
              <p className="text-white/60 mb-6">
                While current noise levels require no mitigation, we have identified additional measures 
                available for future expansion or changed conditions.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mitigationReserve.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg ${idx === mitigationReserve.length - 1 ? 'bg-watt-success/20 border border-watt-success/30' : 'bg-white/5'}`}
                  >
                    <p className="text-sm text-white/70">{item.technique}</p>
                    <p className={`text-2xl font-bold font-mono ${idx === mitigationReserve.length - 1 ? 'text-watt-success' : 'text-watt-coinbase'}`}>
                      {item.potential}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
