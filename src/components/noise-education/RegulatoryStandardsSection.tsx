import { Shield, Globe, Building, HardHat, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const learningObjectives = [
  "Understand WHO, OSHA, and Alberta AUC noise standards",
  "Compare daytime vs nighttime regulatory limits",
  "Learn the 6-step regulatory compliance pathway",
  "See how Alberta Heartland exceeds all requirements",
];
const standards = [
  {
    name: 'WHO Guidelines',
    icon: Globe,
    color: 'watt-coinbase',
    limits: [
      { context: 'Residential Day (7am-10pm)', limit: '55 dBA', severity: 'moderate' },
      { context: 'Residential Night (10pm-7am)', limit: '45 dBA', severity: 'strict' },
      { context: 'Industrial Areas', limit: '70 dBA', severity: 'lenient' },
    ],
    notes: 'World Health Organization guidelines for community noise. Referenced globally but not legally binding.',
  },
  {
    name: 'Alberta AUC Rule 012',
    icon: MapPin,
    color: 'watt-bitcoin',
    limits: [
      { context: 'Nighttime Basic (Rural)', limit: '40 dBA', severity: 'strict' },
      { context: 'Daytime Basic (Rural)', limit: '50 dBA', severity: 'moderate' },
      { context: 'With Ambient Adjustment', limit: 'Varies', severity: 'moderate' },
    ],
    notes: 'Alberta Utilities Commission Rule 012 governs noise from power generation facilities. Measured at nearest dwelling.',
  },
  {
    name: 'OSHA Workplace',
    icon: HardHat,
    color: 'watt-success',
    limits: [
      { context: '8-hour TWA', limit: '90 dBA', severity: 'lenient' },
      { context: 'Action Level', limit: '85 dBA', severity: 'moderate' },
      { context: 'Peak Exposure', limit: '140 dBC', severity: 'strict' },
    ],
    notes: 'US Occupational Safety and Health Administration. Hearing protection required above 85 dBA.',
  },
  {
    name: 'Municipal Bylaws',
    icon: Building,
    color: 'watt-navy',
    limits: [
      { context: 'Residential Zone Night', limit: '45-50 dBA', severity: 'strict' },
      { context: 'Commercial Zone', limit: '55-65 dBA', severity: 'moderate' },
      { context: 'Industrial Zone', limit: '65-75 dBA', severity: 'lenient' },
    ],
    notes: 'Varies by municipality. Always check local bylaws before project development.',
  },
];

const compliancePathway = [
  { step: 1, title: 'Site Assessment', description: 'Measure existing ambient noise levels' },
  { step: 2, title: 'Source Modeling', description: 'Calculate expected noise from all equipment' },
  { step: 3, title: 'Propagation Analysis', description: 'Model sound spread to nearest receptors' },
  { step: 4, title: 'Mitigation Design', description: 'Engineer barriers, enclosures, or equipment changes' },
  { step: 5, title: 'Compliance Report', description: 'Submit documentation to regulatory authority' },
  { step: 6, title: 'Post-Construction Verification', description: 'Measure actual noise and confirm compliance' },
];

export const RegulatoryStandardsSection = () => {
  return (
    <section id="standards" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="6 min read"
          />
        </ScrollReveal>

        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-bitcoin/10 rounded-full mb-4">
              <Shield className="h-4 w-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Regulations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Regulatory Standards & Compliance
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Mining facilities must comply with various noise regulations. Understanding applicable standards
              is essential for site selection and engineering design.
            </p>
          </div>
        </ScrollReveal>

        {/* Standards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {standards.map((standard, idx) => {
            const Icon = standard.icon;
            return (
              <ScrollReveal key={idx} delay={idx * 100}>
                <Card className="bg-white border-none shadow-institutional h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-${standard.color}/10 rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 text-${standard.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-watt-navy">{standard.name}</h3>
                    </div>

                    <div className="space-y-3 mb-4">
                      {standard.limits.map((limit, lidx) => (
                        <div key={lidx} className="flex justify-between items-center py-2 border-b border-watt-navy/5 last:border-0">
                          <span className="text-sm text-watt-navy/70">{limit.context}</span>
                          <Badge 
                            variant="outline"
                            className={`font-mono font-bold ${
                              limit.severity === 'strict' ? 'border-red-300 text-red-600 bg-red-50' :
                              limit.severity === 'moderate' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                              'border-watt-success/30 text-watt-success bg-watt-success/10'
                            }`}
                          >
                            {limit.limit}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-watt-navy/50">{standard.notes}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Alberta Heartland Compliance Check */}
        <ScrollReveal delay={500}>
          <Card className="bg-gradient-to-br from-watt-success/10 to-watt-success/5 border-2 border-watt-success/20 shadow-institutional mb-12">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-watt-success/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-watt-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">Alberta Heartland 45MW: Compliance Check</h3>
                  <p className="text-sm text-watt-navy/60">30 Hydro Containers • 1.7km to Nearest Residence</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-watt-navy/10">
                      <th className="text-left py-3 text-sm font-semibold text-watt-navy">Standard</th>
                      <th className="text-center py-3 text-sm font-semibold text-watt-navy">Limit</th>
                      <th className="text-center py-3 text-sm font-semibold text-watt-navy">Our Level</th>
                      <th className="text-center py-3 text-sm font-semibold text-watt-navy">Margin</th>
                      <th className="text-center py-3 text-sm font-semibold text-watt-navy">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-watt-navy/5">
                      <td className="py-4 text-sm text-watt-navy">WHO Night (Residential)</td>
                      <td className="py-4 text-center font-mono text-watt-navy">45 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-coinbase font-bold">~17 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-success">-28 dB</td>
                      <td className="py-4 text-center">
                        <Badge className="bg-watt-success text-white">✓ Excellent</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-watt-navy/5">
                      <td className="py-4 text-sm text-watt-navy">Alberta AUC Rule 012</td>
                      <td className="py-4 text-center font-mono text-watt-navy">40 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-coinbase font-bold">~17 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-success">-23 dB</td>
                      <td className="py-4 text-center">
                        <Badge className="bg-watt-success text-white">✓ Excellent</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-watt-navy/5">
                      <td className="py-4 text-sm text-watt-navy">OSHA Workplace (On-site)</td>
                      <td className="py-4 text-center font-mono text-watt-navy">90 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-coinbase font-bold">81.8 dBA</td>
                      <td className="py-4 text-center font-mono text-watt-success">-8 dB</td>
                      <td className="py-4 text-center">
                        <Badge className="bg-watt-success text-white">✓ Compliant</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-sm text-watt-navy/70">
                  <strong className="text-watt-success">Result:</strong> At 1.7km distance, our 45MW facility produces 
                  approximately <strong>17 dBA</strong> at the nearest residence — well below the threshold of perception 
                  (typically 25-30 dBA in rural areas) and far exceeding all regulatory requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Compliance Pathway */}
        <ScrollReveal delay={600}>
          <Card className="bg-white border-none shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6">Regulatory Compliance Pathway</h3>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-watt-navy/10 hidden md:block" />
                
                <div className="space-y-4 md:space-y-6">
                  {compliancePathway.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white">
                        <span className="font-bold text-watt-bitcoin">{item.step}</span>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-watt-navy">{item.title}</h4>
                        <p className="text-sm text-watt-navy/60">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
