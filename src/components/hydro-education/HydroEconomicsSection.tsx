import React, { useState } from 'react';
import { 
  DollarSign, 
  Calculator,
  Clock,
  TrendingDown,
  Building,
  Zap,
  Droplets,
  Users,
  MapPin,
  Info
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';
import TCOComparisonCalculator from './TCOComparisonCalculator';
import { Slider } from '@/components/ui/slider';

const costBreakdown = [
  { category: 'Construction & Civil', percentage: 25, color: 'bg-blue-500', items: ['Site preparation', 'Foundations', 'Roads', 'Drainage'] },
  { category: 'Electrical Infrastructure', percentage: 35, color: 'bg-yellow-500', items: ['Transformers', 'Switchgear', 'Cabling', 'Protection'] },
  { category: 'Cooling System', percentage: 20, color: 'bg-cyan-500', items: ['Cooling towers', 'Pipework', 'Pumps', 'Heat exchangers'] },
  { category: 'Containers & Setup', percentage: 15, color: 'bg-green-500', items: ['Mining containers', 'Installation', 'Commissioning'] },
  { category: 'Other', percentage: 5, color: 'bg-gray-500', items: ['Permits', 'Design', 'Contingency'] }
];

// Regional labor rates from Bitmain docs Table 15
const laborRates = [
  { region: 'United States', dailyRate: '$300-440/day', multiplier: 1.5, flag: '🇺🇸' },
  { region: 'Europe (West)', dailyRate: '$162-270/day', multiplier: 1.2, flag: '🇪🇺' },
  { region: 'Russia/CIS', dailyRate: '$43-74/day', multiplier: 0.5, flag: '🇷🇺' },
  { region: 'Middle East', dailyRate: '$81-135/day', multiplier: 0.7, flag: '🇦🇪' },
  { region: 'Southeast Asia', dailyRate: '$27-54/day', multiplier: 0.4, flag: '🌏' }
];

// Labor duration estimates from Bitmain docs Table 14
const laborDuration = [
  { role: 'General Workers', days: 286, description: 'Site preparation, material handling' },
  { role: 'Carpenters', days: 200, description: 'Foundation forms, structures' },
  { role: 'Steel Workers', days: 114, description: 'Rebar, metal structures' },
  { role: 'Electricians', days: 343, description: 'Wiring, connections, testing' },
  { role: 'Plumbers', days: 171, description: 'Water systems, piping' },
  { role: 'Equipment Operators', days: 143, description: 'Excavators, cranes, forklifts' }
];

// Water intake distance cost impact from Bitmain docs Table 12
const waterIntakeCosts = [
  { distance: '0-500m', additionalCost: '$0', notes: 'Base case, minimal piping' },
  { distance: '500-1000m', additionalCost: '$370,000', notes: 'Extended pipeline, pump station' },
  { distance: '1000-1500m', additionalCost: '$740,000', notes: 'Two pump stations may be needed' },
  { distance: '1500-2000m', additionalCost: '$1,110,000', notes: 'Significant infrastructure' },
  { distance: '>2000m', additionalCost: '$1,480,000+', notes: 'Consider alternative water source' }
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

// Detailed cost categories
const detailedCosts = [
  {
    category: 'Design & Engineering',
    items: [
      { name: 'Electrical drawings', cost: '$50,000-100,000' },
      { name: 'Civil/structural design', cost: '$30,000-60,000' },
      { name: 'Mechanical design', cost: '$20,000-40,000' },
      { name: 'Permits & approvals', cost: '$50,000-150,000' }
    ]
  },
  {
    category: 'Site Preparation',
    items: [
      { name: 'Geotechnical survey', cost: '$10,000-30,000' },
      { name: 'Earthwork & grading', cost: '$200,000-500,000' },
      { name: 'Drainage system', cost: '$50,000-100,000' },
      { name: 'Gravel surfacing', cost: '$100,000-200,000' }
    ]
  },
  {
    category: 'Electrical (100 MW)',
    items: [
      { name: 'Transformers (40 units)', cost: '$2,000,000-3,000,000' },
      { name: 'MV switchgear', cost: '$500,000-800,000' },
      { name: 'Cables & terminations', cost: '$800,000-1,200,000' },
      { name: 'Grounding system', cost: '$100,000-200,000' }
    ]
  },
  {
    category: 'Water Systems (100 MW)',
    items: [
      { name: 'Water reservoirs', cost: '$200,000-400,000' },
      { name: 'Pumping stations', cost: '$150,000-300,000' },
      { name: 'Piping network', cost: '$300,000-500,000' },
      { name: 'Water treatment', cost: '$100,000-200,000' }
    ]
  }
];

const HydroEconomicsSection = () => {
  const [capacity, setCapacity] = useState(100);
  const baseCostPerMW = 250000; // $250k per MW base cost
  
  const estimatedCost = capacity * baseCostPerMW;
  const constructionCost = estimatedCost * 0.25;
  const electricalCost = estimatedCost * 0.35;
  const coolingCost = estimatedCost * 0.20;
  const containerCost = estimatedCost * 0.15;

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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Construction Economics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understand the capital requirements and cost structure for building 
              a hydro-cooled mining facility.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cost Calculator */}
          <ScrollReveal>
            <Card className="border-border h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Cost Estimator</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-muted-foreground">Facility Capacity (MW)</Label>
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
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(item.cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Cost Breakdown Pie */}
          <ScrollReveal delay={100}>
            <Card className="border-border h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Cost Distribution</h3>
                
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
                          <span className="font-medium text-foreground">{item.category}</span>
                          <span className="text-sm font-bold text-foreground">{item.percentage}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.items.map((subItem, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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

        {/* Detailed Cost Categories */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-6">Detailed Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {detailedCosts.map((cat, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3">{cat.category}</h4>
                  <div className="space-y-2">
                    {cat.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-mono text-green-600 text-xs">{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        {/* Construction Timeline */}
        <ScrollReveal>
          <Card className="border-border mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Construction Timeline</h3>
                  <p className="text-sm text-muted-foreground">Typical 100 MW facility: ~12 months total</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Week scale */}
                  <div className="flex mb-2 ml-48">
                    {[...Array(13)].map((_, i) => (
                      <div key={i} className="flex-1 text-xs text-muted-foreground text-center">
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
                          <div className="w-44 text-sm text-muted-foreground truncate flex-shrink-0">
                            {phase.phase}
                          </div>
                          <div className="flex-1 h-8 bg-muted rounded relative">
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
          <Card className="border-border mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Regional Labor Costs</h3>
                  <p className="text-sm text-muted-foreground">Construction labor rate comparison</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {laborRates.map((region, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 text-center hover:bg-muted transition-colors">
                    <span className="text-2xl mb-2 block">{region.flag}</span>
                    <span className="text-sm text-muted-foreground block mb-2">{region.region}</span>
                    <span className="text-lg font-bold text-foreground block">{region.dailyRate}</span>
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                      region.multiplier < 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {region.multiplier < 1 ? '↓' : '↑'} {Math.abs((1 - region.multiplier) * 100).toFixed(0)}% vs avg
                    </span>
                  </div>
                ))}
              </div>

              {/* Labor Duration Table */}
              <h4 className="font-semibold text-foreground mb-4">Labor Duration (100 MW Project)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-foreground">Role</th>
                      <th className="text-center py-2 font-semibold text-foreground">Person-Days</th>
                      <th className="text-left py-2 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laborDuration.map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 font-medium text-foreground">{item.role}</td>
                        <td className="py-2 text-center font-mono text-blue-600">{item.days}</td>
                        <td className="py-2 text-muted-foreground">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Water Intake Distance Impact */}
        <ScrollReveal>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Water Intake Distance Impact</h3>
                  <p className="text-sm text-muted-foreground">Additional costs based on water source distance</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-semibold text-foreground">Distance</th>
                      <th className="text-center py-3 font-semibold text-foreground">Additional Cost</th>
                      <th className="text-left py-3 font-semibold text-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterIntakeCosts.map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 font-medium text-foreground">{item.distance}</td>
                        <td className="py-3 text-center font-mono text-cyan-600">{item.additionalCost}</td>
                        <td className="py-3 text-muted-foreground">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <strong>Site Selection Tip:</strong> Prioritize locations within 500m of a suitable water source 
                    to minimize infrastructure costs and permitting complexity.
                  </p>
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