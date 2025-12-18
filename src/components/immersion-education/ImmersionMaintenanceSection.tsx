import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Wrench, Calendar, AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';

const maintenanceTasks = [
  {
    frequency: 'Daily',
    tasks: [
      'Check fluid temperatures (inlet/outlet)',
      'Monitor ASIC chip temperatures',
      'Verify pump operation and flow rates',
      'Review system alerts and logs'
    ],
    icon: '📊'
  },
  {
    frequency: 'Weekly',
    tasks: [
      'Inspect fluid level and top up if needed',
      'Check for leaks at fittings and seals',
      'Clean air filters on dry coolers',
      'Verify temperature differential across heat exchanger'
    ],
    icon: '🔍'
  },
  {
    frequency: 'Monthly',
    tasks: [
      'Test backup systems and alarms',
      'Inspect electrical connections',
      'Check fluid clarity (visual inspection)',
      'Review performance trends and efficiency'
    ],
    icon: '📅'
  },
  {
    frequency: 'Quarterly',
    tasks: [
      'Sample fluid for laboratory analysis',
      'Clean/replace filtration elements',
      'Inspect pump seals and bearings',
      'Calibrate temperature sensors'
    ],
    icon: '🧪'
  },
  {
    frequency: 'Annually',
    tasks: [
      'Full fluid quality analysis',
      'Heat exchanger cleaning/inspection',
      'Pump rebuild or replacement',
      'Comprehensive system audit'
    ],
    icon: '📋'
  }
];

const fluidAnalysisParams = [
  { parameter: 'Total Acid Number (TAN)', acceptable: '< 0.3 mg KOH/g', warning: '> 0.5', critical: '> 1.0' },
  { parameter: 'Water Content', acceptable: '< 200 ppm', warning: '> 500 ppm', critical: '> 1000 ppm' },
  { parameter: 'Particle Count', acceptable: 'ISO 18/16/13', warning: 'ISO 20/18/15', critical: 'ISO 22/20/17' },
  { parameter: 'Viscosity Change', acceptable: '< ±10%', warning: '±10-20%', critical: '> ±20%' },
  { parameter: 'Flash Point', acceptable: 'Within 10°C of new', warning: '10-20°C drop', critical: '> 20°C drop' },
  { parameter: 'Dielectric Strength', acceptable: '> 30 kV', warning: '25-30 kV', critical: '< 25 kV' }
];

const extractionProcedure = [
  { step: 1, title: 'Power Down', description: 'Shut down ASIC and wait for temperatures to stabilize', time: '5-10 min' },
  { step: 2, title: 'Disconnect Cables', description: 'Remove power and network cables from the unit', time: '2 min' },
  { step: 3, title: 'Lift from Tank', description: 'Use extraction tool or lift to remove ASIC from fluid', time: '1 min' },
  { step: 4, title: 'Initial Draining', description: 'Hold at angle to drain bulk fluid back into tank', time: '2-5 min' },
  { step: 5, title: 'Transfer to Drain Station', description: 'Place on drip tray or extraction station', time: '1 min' },
  { step: 6, title: 'Extended Draining', description: 'Allow remaining fluid to drain (can take hours for full drain)', time: '1-24 hrs' },
  { step: 7, title: 'Cleaning (if needed)', description: 'Use isopropyl alcohol for final cleaning if required', time: '10-15 min' }
];

export default function ImmersionMaintenanceSection() {
  return (
    <section id="maintenance" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Operations & Maintenance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proper maintenance ensures optimal performance and fluid longevity. 
              Follow these schedules to maximize system efficiency and uptime.
            </p>
          </div>
        </ScrollReveal>

        {/* Maintenance Schedule */}
        <ScrollReveal delay={100}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Maintenance Schedule</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            {maintenanceTasks.map((schedule) => (
              <div key={schedule.frequency} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{schedule.icon}</span>
                  <h4 className="font-semibold text-foreground">{schedule.frequency}</h4>
                </div>
                <ul className="space-y-2">
                  {schedule.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Fluid Analysis */}
        <ScrollReveal delay={150}>
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-16">
            <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-3">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <div>
                <h3 className="font-semibold text-foreground">Fluid Analysis Parameters</h3>
                <p className="text-sm text-muted-foreground">Monitor these parameters to assess fluid health</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Parameter</th>
                    <th className="text-left p-4 text-sm font-semibold text-green-500">Acceptable</th>
                    <th className="text-left p-4 text-sm font-semibold text-amber-500">Warning</th>
                    <th className="text-left p-4 text-sm font-semibold text-red-500">Critical</th>
                  </tr>
                </thead>
                <tbody>
                  {fluidAnalysisParams.map((param, i) => (
                    <tr key={param.parameter} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <td className="p-4 font-medium text-foreground">{param.parameter}</td>
                      <td className="p-4 text-green-500 font-mono text-sm">{param.acceptable}</td>
                      <td className="p-4 text-amber-500 font-mono text-sm">{param.warning}</td>
                      <td className="p-4 text-red-500 font-mono text-sm">{param.critical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-blue-500/5 border-t border-border">
              <p className="text-sm text-muted-foreground">
                💡 <span className="text-foreground">Tip:</span> Work with a fluid analysis laboratory to establish baseline values for your specific fluid type
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ASIC Extraction Procedure */}
        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
            <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-semibold text-foreground">ASIC Extraction Procedure</h3>
                <p className="text-sm text-muted-foreground">Safe removal for maintenance or replacement</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {extractionProcedure.map((step, i) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-500 font-bold text-sm">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          ~{step.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Warning Box */}
        <ScrollReveal delay={250}>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Important Safety Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Always allow hot ASICs to cool before extraction to prevent burns</li>
                <li>• Wear appropriate PPE (gloves, eye protection) when handling fluids</li>
                <li>• Keep fluid away from ignition sources (especially mineral/synthetic oils)</li>
                <li>• Properly dispose of or recycle used fluid per local regulations</li>
                <li>• Document all maintenance activities for warranty and insurance purposes</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
