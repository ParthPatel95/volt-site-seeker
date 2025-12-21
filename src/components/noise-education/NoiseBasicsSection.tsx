import { Volume2, Waves, Activity, Ear } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const soundLevels = [
  { level: 0, label: "Threshold of Hearing", icon: "👂", color: "bg-watt-success/20" },
  { level: 20, label: "Rustling Leaves", icon: "🍃", color: "bg-watt-success/30" },
  { level: 30, label: "Whisper", icon: "🤫", color: "bg-watt-success/40" },
  { level: 40, label: "Quiet Library", icon: "📚", color: "bg-watt-success/50" },
  { level: 50, label: "Moderate Rainfall", icon: "🌧️", color: "bg-yellow-200" },
  { level: 60, label: "Normal Conversation", icon: "💬", color: "bg-yellow-300" },
  { level: 70, label: "Busy Traffic", icon: "🚗", color: "bg-watt-bitcoin/30" },
  { level: 80, label: "Loud Restaurant", icon: "🍽️", color: "bg-watt-bitcoin/50" },
  { level: 90, label: "Lawn Mower", icon: "🌿", color: "bg-red-300" },
  { level: 100, label: "Motorcycle", icon: "🏍️", color: "bg-red-400" },
  { level: 110, label: "Rock Concert", icon: "🎸", color: "bg-red-500" },
  { level: 120, label: "Jet Engine (100m)", icon: "✈️", color: "bg-red-600" },
  { level: 130, label: "Threshold of Pain", icon: "⚠️", color: "bg-red-700" },
];

export const NoiseBasicsSection = () => {
  return (
    <section id="fundamentals" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-bitcoin/10 rounded-full mb-4">
              <Volume2 className="h-4 w-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Sound Fundamentals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Understanding Sound & Decibels
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sound is a pressure wave that travels through air. Understanding how we measure and perceive sound
              is essential for effective noise management in mining facilities.
            </p>
          </div>
        </ScrollReveal>

        {/* Core Concepts */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <ScrollReveal delay={100}>
            <Card className="bg-white border-none shadow-institutional h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/70 rounded-xl flex items-center justify-center mb-4">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Sound?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Sound is a mechanical wave of pressure that propagates through a medium (air, water, solids).
                  It's characterized by:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-watt-bitcoin font-bold">•</span>
                    <span><strong className="text-foreground">Frequency (Hz):</strong> Pitch - how many cycles per second</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-watt-bitcoin font-bold">•</span>
                    <span><strong className="text-foreground">Amplitude:</strong> Loudness - the strength of the pressure wave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-watt-bitcoin font-bold">•</span>
                    <span><strong className="text-foreground">Speed:</strong> ~343 m/s in air at 20°C</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Card className="bg-white border-none shadow-institutional h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-coinbase to-watt-coinbase/70 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">The Decibel Scale</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Decibels (dB) use a logarithmic scale because human hearing perceives loudness logarithmically.
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <p className="text-foreground mb-2">dB = 10 × log₁₀(P / P₀)</p>
                  <p className="text-muted-foreground text-xs">Where P₀ = 20 μPa (threshold of hearing)</p>
                </div>
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">+3 dB</strong> = 2× sound energy</p>
                  <p><strong className="text-foreground">+10 dB</strong> = 10× sound energy (perceived 2× louder)</p>
                  <p><strong className="text-foreground">+20 dB</strong> = 100× sound energy</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="bg-white border-none shadow-institutional h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-success to-watt-success/70 rounded-xl flex items-center justify-center mb-4">
                  <Ear className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">A-Weighting (dBA)</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Human ears don't hear all frequencies equally. A-weighting adjusts measurements to match human perception.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Low frequencies (bass)</span>
                    <span className="text-red-500 font-medium">-20 to -40 dB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">1-4 kHz (speech range)</span>
                    <span className="text-watt-success font-medium">0 to +1 dB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">High frequencies</span>
                    <span className="text-watt-bitcoin font-medium">-3 to -10 dB</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Most regulations use dBA for community noise limits
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Sound Level Comparison Chart */}
        <ScrollReveal delay={400}>
          <Card className="bg-white border-none shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                Sound Level Comparison Chart
              </h3>
              <div className="relative">
                {/* Scale */}
                <div className="flex items-end gap-1 h-64 md:h-80">
                  {soundLevels.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-watt-navy text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
                        <strong>{item.level} dB</strong>
                        <br />
                        {item.label}
                      </div>
                      <span className="text-lg mb-2 group-hover:scale-125 transition-transform">{item.icon}</span>
                      <div 
                        className={`w-full rounded-t-md ${item.color} transition-all group-hover:brightness-110`}
                        style={{ height: `${(item.level / 130) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2 font-mono">{item.level}</span>
                    </div>
                  ))}
                </div>
                
                {/* Reference Lines */}
                <div className="absolute left-0 right-0 top-[23%] border-t border-dashed border-red-400 z-0">
                  <span className="absolute -top-3 right-0 text-xs text-red-500 bg-white px-2">Pain threshold (120 dB)</span>
                </div>
                <div className="absolute left-0 right-0 top-[54%] border-t border-dashed border-watt-bitcoin z-0">
                  <span className="absolute -top-3 right-0 text-xs text-watt-bitcoin bg-white px-2">OSHA limit (90 dB)</span>
                </div>
                <div className="absolute left-0 right-0 top-[77%] border-t border-dashed border-watt-success z-0">
                  <span className="absolute -top-3 right-0 text-xs text-watt-success bg-white px-2">WHO residential night (45 dB)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
