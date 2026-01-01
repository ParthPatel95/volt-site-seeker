import { useState } from 'react';
import { Calculator, Plus, Equal, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const learningObjectives = [
  "Apply the logarithmic addition formula for combining noise sources",
  "Calculate cumulative noise for facilities with multiple containers",
  "Understand why 30 containers at 67 dB each total only 81.8 dB",
  "Compare cumulative noise between hydro-cooled and air-cooled facilities",
];

export const CumulativeNoiseSection = () => {
  const [containerCount, setContainerCount] = useState(30);
  const [containerDb, setContainerDb] = useState(67);

  // Calculate cumulative noise: L_total = L_single + 10 × log₁₀(n)
  const cumulativeDb = containerDb + 10 * Math.log10(containerCount);
  
  // Comparison with air-cooled (95 dB per container)
  const airCooledDb = 95 + 10 * Math.log10(containerCount);
  const advantage = airCooledDb - cumulativeDb;
  const energyReduction = Math.pow(10, advantage / 10);

  return (
    <section id="cumulative" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="5 min read"
          />
        </ScrollReveal>

        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-market-positive/10 rounded-full mb-4">
              <Calculator className="h-4 w-4 text-market-positive" />
              <span className="text-sm font-medium text-market-positive">Sound Mathematics</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cumulative Noise Calculations
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              When combining multiple noise sources, sound doesn't simply add up linearly. 
              Understanding logarithmic addition is crucial for accurate facility planning.
            </p>
          </div>
        </ScrollReveal>

        {/* Formula Explanation */}
        <ScrollReveal delay={100}>
          <Card className="bg-card border-border shadow-lg mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">The Logarithmic Addition Formula</h3>
                  <div className="bg-card-dark text-white rounded-xl p-6 font-mono mb-4">
                    <p className="text-lg mb-2">L<sub>total</sub> = 10 × log₁₀(∑10<sup>(Li/10)</sup>)</p>
                    <p className="text-sm text-white/70 mt-4">For n identical sources at level L:</p>
                    <p className="text-lg">L<sub>total</sub> = L + 10 × log₁₀(n)</p>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <p><strong>2 identical sources:</strong> +3 dB (2× energy)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <p><strong>10 identical sources:</strong> +10 dB (10× energy)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <p><strong>100 identical sources:</strong> +20 dB (100× energy)</p>
                    </div>
                  </div>
                </div>

                {/* Visual Example */}
                <div className="bg-muted rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-4">Visual Example: Adding Sources</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <span className="font-mono font-bold text-secondary">67 dB</span>
                      </div>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <span className="font-mono font-bold text-secondary">67 dB</span>
                      </div>
                      <Equal className="h-5 w-5 text-muted-foreground" />
                      <div className="w-16 h-16 bg-market-positive/20 rounded-lg flex items-center justify-center border-2 border-market-positive">
                        <span className="font-mono font-bold text-market-positive">70 dB</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Two 67 dB sources = 70 dB total (not 134 dB!)
                    </p>
                    
                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">With 30 containers at 67 dB each:</p>
                      <div className="bg-card rounded-lg p-4">
                        <p className="font-mono text-lg text-foreground">
                          67 + 10 × log₁₀(30) = 67 + 14.77 = <strong className="text-primary">81.8 dB</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Interactive Calculator */}
        <ScrollReveal delay={200}>
          <Card className="bg-gradient-to-br from-card-dark to-card-dark/90 text-white border-none shadow-xl mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Interactive Cumulative Noise Calculator
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/80 mb-2 block">Number of Containers</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[containerCount]}
                        onValueChange={(value) => setContainerCount(value[0])}
                        min={1}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={containerCount}
                        onChange={(e) => setContainerCount(Number(e.target.value))}
                        className="w-20 bg-white/10 border-white/20 text-white text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block">Noise per Container (dB)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[containerDb]}
                        onValueChange={(value) => setContainerDb(value[0])}
                        min={50}
                        max={105}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={containerDb}
                        onChange={(e) => setContainerDb(Number(e.target.value))}
                        className="w-20 bg-white/10 border-white/20 text-white text-center"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-2">
                      <span>Immersion (55)</span>
                      <span>Hydro (67)</span>
                      <span>Air (95)</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-6">
                    <p className="text-sm text-white/70 mb-2">Total Cumulative Noise at Source</p>
                    <p className="text-4xl font-bold text-primary font-mono">
                      {cumulativeDb.toFixed(1)} dB
                    </p>
                    <p className="text-xs text-white/50 mt-2">
                      Formula: {containerDb} + 10 × log₁₀({containerCount}) = {cumulativeDb.toFixed(1)}
                    </p>
                  </div>

                  <div className="bg-market-positive/20 rounded-xl p-4">
                    <p className="text-sm font-semibold mb-2">Comparison vs Air-Cooled ({airCooledDb.toFixed(1)} dB)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-market-positive font-mono">-{advantage.toFixed(1)} dB</p>
                        <p className="text-xs text-white/60">Noise reduction</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-market-positive font-mono">{energyReduction.toFixed(0)}×</p>
                        <p className="text-xs text-white/60">Less sound energy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Alberta Heartland Case Study Preview */}
        <ScrollReveal delay={300}>
          <Card className="bg-card border-2 border-primary/20 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏭</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Alberta Heartland 45MW Case Study</h3>
                  <p className="text-sm text-muted-foreground">30 Bitmain Hydro Containers</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-foreground font-mono">30</p>
                  <p className="text-sm text-muted-foreground">Hydro Containers</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-secondary font-mono">67 dB</p>
                  <p className="text-sm text-muted-foreground">Per Container</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-primary font-mono">81.8 dB</p>
                  <p className="text-sm text-muted-foreground">Total at Source</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                If this facility used air-cooled containers instead: <strong>109.8 dB</strong> — that's 
                <strong className="text-market-positive"> 630× more sound energy</strong> at the source!
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <SectionSummary
            takeaways={[
              "Sound adds logarithmically: 67 + 67 dB = 70 dB, not 134 dB",
              "Formula: L_total = L_single + 10 × log₁₀(n) for n identical sources",
              "30 hydro containers at 67 dB = 81.8 dB total at source",
              "Same 30 containers air-cooled (95 dB) would be 109.8 dB - 630× more energy!",
            ]}
            proTip="Use the interactive calculator above to model your own facility. Try different container counts and cooling technologies."
            nextSteps={[
              { title: 'Regulations', href: '#standards', description: 'Learn about noise compliance standards' },
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
