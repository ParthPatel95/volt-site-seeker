import React, { useState } from 'react';
import { 
  DollarSign, 
  Calculator,
  Clock,
  TrendingDown,
  Building,
  Zap,
  Droplets,
  Users
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const costBreakdown = [
  { category: 'Construction & Civil', percentage: 25, color: 'bg-blue-500', items: ['Site preparation', 'Foundations', 'Roads', 'Drainage'] },
  { category: 'Electrical Infrastructure', percentage: 35, color: 'bg-yellow-500', items: ['Transformers', 'Switchgear', 'Cabling', 'Protection'] },
  { category: 'Cooling System', percentage: 20, color: 'bg-cyan-500', items: ['Cooling towers', 'Pipework', 'Pumps', 'Heat exchangers'] },
  { category: 'Containers & Setup', percentage: 15, color: 'bg-green-500', items: ['Mining containers', 'Installation', 'Commissioning'] },
  { category: 'Other', percentage: 5, color: 'bg-gray-500', items: ['Permits', 'Design', 'Contingency'] }
];

const laborRates = [
  { region: 'United States', rate: '$45-65/hour', multiplier: 1.5 },
  { region: 'Europe (West)', rate: '$35-55/hour', multiplier: 1.3 },
  { region: 'Russia/CIS', rate: '$15-25/hour', multiplier: 0.7 },
  { region: 'Middle East', rate: '$20-35/hour', multiplier: 0.9 },
  { region: 'Southeast Asia', rate: '$10-20/hour', multiplier: 0.5 }
];

const timeline = [
  { phase: 'Site Selection & Due Diligence', weeks: 4, color: 'bg-purple-500' },
  { phase: 'Design & Engineering', weeks: 6, color: 'bg-blue-500' },
  { phase: 'Permitting', weeks: 8, color: 'bg-red-500' },
  { phase: 'Civil Construction', weeks: 10, color: 'bg-orange-500' },
  { phase: 'Electrical Installation', weeks: 8, color: 'bg-yellow-500' },
  { phase: 'Cooling System', weeks: 6, color: 'bg-cyan-500' },
  { phase: 'Container Deployment', weeks: 4, color: 'bg-green-500' },
  { phase: 'Testing & Commissioning', weeks: 2, color: 'bg-emerald-500' }
];

const HydroEconomicsSection = () => {
  const [capacity, setCapacity] = useState(100);
  const baseCostPerMW = 250000; // $250k per MW base cost
  
  const estimatedCost = capacity * baseCostPerMW;
  const constructionCost = estimatedCost * 0.25;
  const electricalCost = estimatedCost * 0.35;
  const coolingCost = estimatedCost * 0.20;
  const containerCost = estimatedCost * 0.15;
  const otherCost = estimatedCost * 0.05;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
              <DollarSign className="w-4 h-4" />
              Economics
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Construction Economics
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Understand the capital requirements and cost structure for building 
              a hydro-cooled mining facility.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cost Calculator */}
          <ScrollReveal>
            <Card className="border-watt-navy/10 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-watt-navy">Cost Estimator</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-watt-navy/70">Facility Capacity (MW)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[capacity]}
                        onValueChange={([value]) => setCapacity(value)}
                        min={10}
                        max={500}
                        step={10}
                        className="flex-1"
                      />
                      <div className="w-20">
                        <Input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <span className="text-sm opacity-80">Estimated Total Cost</span>
                    <div className="text-4xl font-bold mt-1">{formatCurrency(estimatedCost)}</div>
                    <span className="text-sm opacity-80">${(baseCostPerMW / 1000).toFixed(0)}K per MW</span>
                  </div>

                  {/* Cost breakdown */}
                  <div className="space-y-3">
                    {[
                      { name: 'Construction', cost: constructionCost, icon: Building },
                      { name: 'Electrical', cost: electricalCost, icon: Zap },
                      { name: 'Cooling', cost: coolingCost, icon: Droplets },
                      { name: 'Containers', cost: containerCost, icon: Building },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-watt-navy/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-watt-navy/50" />
                          <span className="text-sm text-watt-navy/70">{item.name}</span>
                        </div>
                        <span className="font-semibold text-watt-navy">{formatCurrency(item.cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Cost Breakdown Pie */}
          <ScrollReveal delay={100}>
            <Card className="border-watt-navy/10 h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-watt-navy mb-6">Cost Distribution</h3>
                
                {/* Visual breakdown */}
                <div className="flex h-8 rounded-full overflow-hidden mb-6">
                  {costBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className={`${item.color} transition-all duration-300 hover:opacity-80`}
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.category}: ${item.percentage}%`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded ${item.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-watt-navy">{item.category}</span>
                          <span className="text-sm font-bold text-watt-navy">{item.percentage}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.items.map((subItem, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-watt-navy/5 text-watt-navy/60">
                              {subItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Construction Timeline */}
        <ScrollReveal>
          <Card className="border-watt-navy/10 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">Construction Timeline</h3>
                  <p className="text-sm text-watt-navy/60">Typical 100 MW facility: ~12 months total</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Week scale */}
                  <div className="flex mb-2 ml-48">
                    {[...Array(13)].map((_, i) => (
                      <div key={i} className="flex-1 text-xs text-watt-navy/50 text-center">
                        {i * 4}w
                      </div>
                    ))}
                  </div>

                  {/* Gantt bars */}
                  <div className="space-y-2">
                    {timeline.map((phase, index) => {
                      const startWeek = timeline.slice(0, index).reduce((sum, p) => sum + p.weeks, 0);
                      const totalWeeks = 48;
                      const leftPercent = (startWeek / totalWeeks) * 100;
                      const widthPercent = (phase.weeks / totalWeeks) * 100;

                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-44 text-sm text-watt-navy/70 truncate flex-shrink-0">
                            {phase.phase}
                          </div>
                          <div className="flex-1 h-8 bg-watt-navy/5 rounded relative">
                            <div
                              className={`absolute h-full ${phase.color} rounded flex items-center justify-center text-white text-xs font-medium transition-all duration-500`}
                              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                            >
                              {phase.weeks}w
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Labor Rates by Region */}
        <ScrollReveal>
          <Card className="border-watt-navy/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">Regional Labor Costs</h3>
                  <p className="text-sm text-watt-navy/60">Construction labor rate comparison</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {laborRates.map((region, index) => (
                  <div key={index} className="p-4 rounded-lg bg-watt-navy/5 text-center hover:bg-watt-navy/10 transition-colors">
                    <span className="text-sm text-watt-navy/70 block mb-2">{region.region}</span>
                    <span className="text-lg font-bold text-watt-navy block">{region.rate}</span>
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                      region.multiplier < 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {region.multiplier < 1 ? '↓' : '↑'} {Math.abs((1 - region.multiplier) * 100).toFixed(0)}% vs avg
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Cost Optimization Tip</h4>
                    <p className="text-sm text-amber-700">
                      Prefabricating components in low-cost regions and shipping to site can reduce 
                      overall construction costs by 20-30% while maintaining quality standards.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroEconomicsSection;
