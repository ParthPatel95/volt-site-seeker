import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Wrench, Fan, Plug, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

const prepSteps = [
  {
    step: 1,
    title: 'Remove All Fans',
    icon: Fan,
    description: 'Fans are not needed in immersion and can cause turbulence or failure',
    details: [
      'Disconnect fan power cables',
      'Remove fan shrouds/housings',
      'Cap or remove fan headers on control board',
      'Some firmware may need fan simulation resistors'
    ],
    warning: 'Never run fans in fluid - they will fail and can cause contamination',
    image: '🔧'
  },
  {
    step: 2,
    title: 'Seal Connectors',
    icon: Plug,
    description: 'Prevent fluid ingress into sensitive areas',
    details: [
      'Apply dielectric grease to ethernet ports',
      'Seal unused USB/debug ports with silicone',
      'Protect PSU input connectors if submerged',
      'Use waterproof cable glands for power cables'
    ],
    warning: 'Fluid entering control board connectors causes shorts',
    image: '🔌'
  },
  {
    step: 3,
    title: 'Verify Compatibility',
    icon: Shield,
    description: 'Not all ASICs are designed for immersion',
    details: [
      'Check manufacturer immersion certification',
      'Verify thermal paste compatibility with fluid',
      'Confirm no plastic parts that dissolve in oil',
      'Review warranty implications'
    ],
    warning: 'Some plastics and thermal interface materials degrade in certain fluids',
    image: '✅'
  },
  {
    step: 4,
    title: 'Firmware Configuration',
    icon: Wrench,
    description: 'Adjust settings for immersion operation',
    details: [
      'Disable fan error shutdowns',
      'Adjust thermal throttle thresholds',
      'Enable immersion mode if available',
      'Consider custom firmware (BraiinsOS, etc.)'
    ],
    warning: 'Stock firmware may shut down without fan signals',
    image: '⚙️'
  }
];

const compatibleASICs = [
  { model: 'Antminer S21', manufacturer: 'Bitmain', immersionReady: 'Yes*', notes: 'Remove fans, seal connectors' },
  { model: 'Antminer S19 Pro', manufacturer: 'Bitmain', immersionReady: 'Yes*', notes: 'Well-documented process' },
  { model: 'Antminer S19j Pro', manufacturer: 'Bitmain', immersionReady: 'Yes*', notes: 'Similar to S19 Pro' },
  { model: 'Whatsminer M50S', manufacturer: 'MicroBT', immersionReady: 'Yes*', notes: 'Requires modification' },
  { model: 'Antminer S21 Hydro', manufacturer: 'Bitmain', immersionReady: 'Native', notes: 'Factory hydro-cooling ready' },
  { model: 'Antminer S19 Hydro', manufacturer: 'Bitmain', immersionReady: 'Native', notes: 'Factory hydro-cooling ready' }
];

export default function HardwarePrepSection() {
  return (
    <section id="hardware-prep" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hardware Preparation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proper preparation is critical for successful immersion deployment. 
              Follow these steps to prepare standard air-cooled ASICs for immersion.
            </p>
          </div>
        </ScrollReveal>

        {/* Warning Banner */}
        <ScrollReveal delay={50}>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-12 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Warranty Notice</h4>
              <p className="text-sm text-muted-foreground">
                Converting air-cooled ASICs to immersion typically voids manufacturer warranties. 
                Consider purchasing factory immersion-ready units (Hydro series) for warranty protection.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Preparation Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {prepSteps.map((step, index) => (
            <ScrollReveal key={step.step} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{step.image}</span>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-500 font-medium">Step {step.step}</div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                
                <ul className="space-y-2 mb-4">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{step.warning}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Compatible ASICs Table */}
        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-foreground">ASIC Immersion Compatibility</h3>
              <p className="text-sm text-muted-foreground">Common miners and their immersion readiness</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Model</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Manufacturer</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Immersion Ready</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {compatibleASICs.map((asic, i) => (
                    <tr key={asic.model} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <td className="p-4 font-medium text-foreground">{asic.model}</td>
                      <td className="p-4 text-muted-foreground">{asic.manufacturer}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          asic.immersionReady === 'Native' 
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {asic.immersionReady}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{asic.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/30 text-xs text-muted-foreground">
              * Requires modification - fans removed, connectors sealed, firmware configured
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
