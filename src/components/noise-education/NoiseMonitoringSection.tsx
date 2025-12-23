import { Activity, Gauge, Radio, FileText, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import ComplianceChecker from './ComplianceChecker';

const monitoringMethods = [
  {
    title: 'Sound Level Meters',
    description: 'Handheld instruments for spot measurements',
    specs: ['Class 1 (precision) or Class 2 (general)', 'A-weighting filter', 'Range: 30-130 dB'],
    icon: Gauge,
  },
  {
    title: 'Continuous Monitors',
    description: 'Permanent stations for long-term trending',
    specs: ['24/7 automated recording', 'Weather correlation', 'Remote data access'],
    icon: Radio,
  },
  {
    title: 'Octave Band Analysis',
    description: 'Frequency-specific noise characterization',
    specs: ['1/1 or 1/3 octave bands', '31.5 Hz to 8 kHz', 'Identifies tonal components'],
    icon: Activity,
  },
];

const measurementPositions = [
  { position: 'Property Boundary', purpose: 'Regulatory compliance verification' },
  { position: 'Nearest Receptor', purpose: 'Impact assessment at dwelling' },
  { position: 'Source (1m)', purpose: 'Equipment characterization' },
  { position: 'Background', purpose: 'Ambient noise baseline' },
];

export const NoiseMonitoringSection = () => {
  return (
    <section id="monitoring" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <LearningObjectives
            objectives={[
              'Understand different noise monitoring equipment types',
              'Know the four standard measurement positions',
              'Interpret noise monitoring reports',
              'Use the compliance checker to verify regulatory conformance'
            ]}
            estimatedTime="7 min"
            prerequisites={[
              { title: 'Site Layout', href: '#site-layout' }
            ]}
          />

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-coinbase/10 rounded-full mb-4">
              <Activity className="h-4 w-4 text-watt-coinbase" />
              <span className="text-sm font-medium text-watt-coinbase">Monitoring</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Monitoring & Measurement
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Proper noise measurement is essential for demonstrating compliance and tracking
              performance over time.
            </p>
          </div>
        </ScrollReveal>

        {/* Monitoring Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {monitoringMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <ScrollReveal key={idx} delay={idx * 100}>
                <Card className="bg-white border-none shadow-institutional h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-watt-coinbase/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-watt-coinbase" />
                    </div>
                    <h3 className="text-xl font-bold text-watt-navy mb-2">{method.title}</h3>
                    <p className="text-watt-navy/70 text-sm mb-4">{method.description}</p>
                    <ul className="space-y-1">
                      {method.specs.map((spec, sidx) => (
                        <li key={sidx} className="text-xs text-watt-navy/60 flex items-start gap-2">
                          <span className="text-watt-coinbase">•</span>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Measurement Positions */}
        <ScrollReveal delay={400}>
          <Card className="bg-watt-navy text-white border-none shadow-xl mb-12">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Standard Measurement Positions
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {measurementPositions.map((pos, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-4">
                    <p className="font-semibold text-watt-bitcoin">{pos.position}</p>
                    <p className="text-sm text-white/70 mt-1">{pos.purpose}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Compliance Checker Tool */}
        <ScrollReveal delay={450}>
          <div className="mb-12">
            <ComplianceChecker />
          </div>
        </ScrollReveal>

        {/* Sample Report */}
        <ScrollReveal delay={500}>
          <Card className="bg-white border-none shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Noise Monitoring Report
              </h3>
              
              <div className="bg-watt-light rounded-xl p-6 font-mono text-sm">
                <div className="border-b border-watt-navy/10 pb-4 mb-4">
                  <p className="font-bold text-watt-navy">Alberta Heartland 45MW Mining Facility</p>
                  <p className="text-watt-navy/60">Noise Compliance Report - Q4 2024</p>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="text-left text-watt-navy/60">
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Leq (dBA)</th>
                      <th className="pb-2">Limit</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-watt-navy">
                    <tr className="border-t border-watt-navy/5">
                      <td className="py-2">Property Boundary (N)</td>
                      <td>32.4</td>
                      <td>50</td>
                      <td className="text-watt-success">✓ Pass</td>
                    </tr>
                    <tr className="border-t border-watt-navy/5">
                      <td className="py-2">Property Boundary (S)</td>
                      <td>28.7</td>
                      <td>50</td>
                      <td className="text-watt-success">✓ Pass</td>
                    </tr>
                    <tr className="border-t border-watt-navy/5">
                      <td className="py-2">Nearest Residence (1.7km)</td>
                      <td>17.2</td>
                      <td>40</td>
                      <td className="text-watt-success">✓ Pass</td>
                    </tr>
                    <tr className="border-t border-watt-navy/5">
                      <td className="py-2">Ambient Background</td>
                      <td>28.5</td>
                      <td>-</td>
                      <td className="text-watt-navy/50">Reference</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 pt-4 border-t border-watt-navy/10">
                  <p className="text-watt-navy/60">
                    <strong>Conclusion:</strong> Facility operates well within all applicable noise limits.
                    Sound levels at nearest residence are below ambient background.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <SectionSummary
            title="Monitoring & Measurement"
            takeaways={[
              'Class 1 meters provide precision measurements for compliance',
              'Four measurement positions cover all regulatory requirements',
              'Continuous monitoring enables trend analysis and early warning',
              'Professional reports document compliance for regulators'
            ]}
            nextSteps={[{ title: 'Environmental Assessment', href: '#environmental' }]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
