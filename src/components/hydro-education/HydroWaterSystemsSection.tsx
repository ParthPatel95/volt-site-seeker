import React, { useState } from 'react';
import { 
  Waves, 
  Droplets, 
  Thermometer,
  ArrowRight,
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  Beaker
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';

const waterSystems = [
  {
    id: 'plate-exchanger',
    name: 'Plate Heat Exchanger System',
    description: 'Uses natural water bodies for heat exchange with minimal environmental impact',
    steps: [
      { name: 'Intake', description: 'Water drawn from river/lake/sea through screened intake', icon: Waves },
      { name: 'Pre-Filter', description: 'Remove debris, sediment, and organic matter', icon: Filter },
      { name: 'Heat Exchange', description: 'Plate exchanger transfers heat from coolant to water', icon: Thermometer },
      { name: 'Discharge', description: 'Warm water returned to source (max +3°C rise)', icon: ArrowRight }
    ],
    metrics: {
      'Water Temperature Rise': '≤ 3°C',
      'Flow Rate (100 MW)': '~8,000 m³/hour',
      'Intake Distance': '< 500m recommended',
      'Environmental Permit': 'Required'
    }
  },
  {
    id: 'makeup-water',
    name: 'Cooling Tower Makeup System',
    description: 'Supplies water to compensate for evaporative losses in wet cooling towers',
    steps: [
      { name: 'Source', description: 'Water from municipal supply, well, or reservoir', icon: Waves },
      { name: 'Treatment', description: 'Softening, anti-scaling, biocide treatment', icon: Filter },
      { name: 'Storage', description: 'Buffer tank for consistent supply (2-4 hour capacity)', icon: Droplets },
      { name: 'Distribution', description: 'Pumped to cooling tower basins on demand', icon: ArrowRight }
    ],
    metrics: {
      'Evaporation Rate': '~1.5% of circulation',
      'Blowdown Rate': '~0.5% of circulation',
      'Makeup Volume (100 MW)': '~150 m³/hour peak',
      'Treatment Cost': '$0.10-0.15/m³'
    }
  }
];

// Flow rate table based on inlet water temperature (from Bitmain docs Table 3)
const flowRateTable = [
  { inletTemp: 5, flowRate: 31, efficiency: 'Excellent' },
  { inletTemp: 10, flowRate: 38, efficiency: 'Excellent' },
  { inletTemp: 15, flowRate: 48, efficiency: 'Very Good' },
  { inletTemp: 20, flowRate: 62, efficiency: 'Good' },
  { inletTemp: 25, flowRate: 82, efficiency: 'Good' },
  { inletTemp: 30, flowRate: 110, efficiency: 'Fair' },
  { inletTemp: 35, flowRate: 160, efficiency: 'Fair' }
];

// Water quality requirements (from Bitmain docs Table 1)
const waterQualityRequirements = [
  { parameter: 'pH Value', requirement: '6.5 - 8.5', priority: 'Critical', note: 'Prevents corrosion/scaling' },
  { parameter: 'Conductivity', requirement: '< 1000 μS/cm', priority: 'Critical', note: 'Indicates dissolved solids' },
  { parameter: 'Chloride Content', requirement: '< 200 mg/L', priority: 'Critical', note: 'Prevents pitting corrosion' },
  { parameter: 'Sulfate Content', requirement: '< 200 mg/L', priority: 'High', note: 'Reduces scaling risk' },
  { parameter: 'Total Hardness', requirement: '< 450 mg/L CaCO₃', priority: 'High', note: 'Softening may be required' },
  { parameter: 'Acid Consumption', requirement: '< 200 mg/L', priority: 'Medium', note: 'Alkalinity indicator' },
  { parameter: 'Iron Content', requirement: '< 0.3 mg/L', priority: 'Medium', note: 'Prevents staining/fouling' },
  { parameter: 'Sulfur Content', requirement: '< 0.5 mg/L', priority: 'High', note: 'Prevents bacterial growth' },
  { parameter: 'Ammonium Content', requirement: '< 1.0 mg/L', priority: 'Medium', note: 'Biological indicator' },
  { parameter: 'Silica Content', requirement: '< 50 mg/L', priority: 'Medium', note: 'Reduces scaling' }
];

const temperatureWaterCurve = [
  { temp: 20, water: 50 },
  { temp: 25, water: 80 },
  { temp: 30, water: 120 },
  { temp: 35, water: 180 },
  { temp: 40, water: 280 },
  { temp: 45, water: 400 }
];

// Reservoir sizing guide
const reservoirSizing = [
  { capacity: '50 MW', volume: '200 m³', backupHours: 5, tanks: '2 × 100 m³' },
  { capacity: '100 MW', volume: '400 m³', backupHours: 5, tanks: '2 × 200 m³' },
  { capacity: '200 MW', volume: '800 m³', backupHours: 5, tanks: '4 × 200 m³' },
  { capacity: '500 MW', volume: '2000 m³', backupHours: 5, tanks: '4 × 500 m³' }
];

const HydroWaterSystemsSection = () => {
  const [activeSystem, setActiveSystem] = useState('plate-exchanger');
  const currentSystem = waterSystems.find(s => s.id === activeSystem) || waterSystems[0];

  return (
    <section id="water-systems" className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4">
              <Waves className="w-4 h-4" />
              Water Systems
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Water Management Systems
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the water infrastructure required for different hydro-cooling approaches.
            </p>
          </div>
        </ScrollReveal>

        <LearningObjectives
          objectives={[
            "Compare plate heat exchanger vs cooling tower makeup systems",
            "Calculate water flow rates based on inlet temperature",
            "Understand water quality requirements and reservoir sizing"
          ]}
          estimatedTime="8 min"
        />

        <ScrollReveal>
          <Tabs value={activeSystem} onValueChange={setActiveSystem} className="w-full">
            <TabsList className="grid grid-cols-2 gap-4 h-auto bg-transparent mb-8">
              {waterSystems.map((system) => (
                <TabsTrigger
                  key={system.id}
                  value={system.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-cyan-500 data-[state=active]:bg-primary/5 border-border bg-card hover:border-cyan-300"
                >
                  <Waves className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-foreground">{system.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {waterSystems.map((system) => (
              <TabsContent key={system.id} value={system.id} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Water Flow Diagram */}
                  <div className="lg:col-span-2">
                    <Card className="border-border h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{system.name}</h3>
                        <p className="text-sm text-muted-foreground mb-6">{system.description}</p>
                        
                        {/* Flow Steps */}
                        <div className="relative">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {system.steps.map((step, index) => (
                              <div key={index} className="relative">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-3 relative z-10">
                                    <step.icon className="w-7 h-7 text-white" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-foreground text-sm mb-1">{step.name}</h4>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                                
                                {/* Connector Arrow */}
                                {index < system.steps.length - 1 && (
                                  <div className="hidden md:block absolute top-8 left-[calc(100%-8px)] w-[calc(100%-32px)]">
                                    <div className="flex items-center">
                                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400" />
                                      <ArrowRight className="w-4 h-4 text-blue-400 -ml-1" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Animated water flow indicator */}
                          <div className="mt-8 p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-cyan-700">Continuous water circulation in progress</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Metrics */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">System Metrics</h4>
                      <ul className="space-y-4">
                        {Object.entries(system.metrics).map(([key, value], index) => (
                          <li key={index} className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{key}</span>
                            <span className="text-lg font-semibold text-cyan-600">{value}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>

        {/* Flow Rate vs Temperature Table */}
        <ScrollReveal delay={100}>
          <Card className="border-border mt-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Flow Rate vs Inlet Temperature</h3>
                  <p className="text-sm text-muted-foreground">Water flow requirements per container based on inlet temperature</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Inlet Water Temp</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Flow Rate (m³/h per container)</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Efficiency Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flowRateTable.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-4 font-medium text-foreground">{row.inletTemp}°C</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-lg font-bold text-cyan-600">{row.flowRate}</span>
                          <span className="text-muted-foreground ml-1">m³/h</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.efficiency === 'Excellent' ? 'bg-green-100 text-green-700' :
                            row.efficiency === 'Very Good' ? 'bg-blue-100 text-blue-700' :
                            row.efficiency === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {row.efficiency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <strong>For 100 MW facility (80 containers):</strong> Multiply per-container flow rate by 80.
                    At 20°C inlet water, total flow = 62 × 80 = <strong>4,960 m³/h</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Water Quality Requirements */}
        <ScrollReveal delay={200}>
          <Card className="border-border mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Water Quality Requirements</h3>
                  <p className="text-sm text-muted-foreground">Testing parameters before site selection</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Parameter</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Requirement</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterQualityRequirements.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-4 font-medium text-foreground">{row.parameter}</td>
                        <td className="py-3 px-4 text-center font-mono text-cyan-600">{row.requirement}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            row.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Pre-Site Water Testing Recommended</h4>
                    <p className="text-sm text-amber-700">
                      Collect samples from proposed water source and send to certified laboratory. 
                      Treatment systems can address most issues but significantly impact CAPEX and OPEX.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Reservoir Sizing Guide */}
        <ScrollReveal delay={300}>
          <Card className="border-border mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Reservoir Sizing Guide</h3>
                  <p className="text-sm text-muted-foreground">Buffer capacity for 5-hour operational backup</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {reservoirSizing.map((size, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 text-center">
                    <span className="text-sm text-muted-foreground block">{size.capacity}</span>
                    <span className="text-2xl font-bold text-blue-600 block mt-1">{size.volume}</span>
                    <span className="text-xs text-muted-foreground block mt-2">{size.tanks}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 inline-block mt-2">
                      {size.backupHours}h backup
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Water Consumption vs Temperature Chart */}
        <ScrollReveal delay={400}>
          <Card className="border-border mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Water Consumption vs Ambient Temperature</h3>
                  <p className="text-sm text-muted-foreground">m³/hour consumption at different temperatures</p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={temperatureWaterCurve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="temp"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `${value}°C`}
                      label={{ value: 'Ambient Temperature', position: 'bottom', offset: 0, style: { fontSize: 12, fill: '#6b7280' } }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: 'm³/hour', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                      domain={[0, 450]}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} m³/hour`, 'Water Consumption']}
                      labelFormatter={(label) => `${label}°C Ambient`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar dataKey="water" radius={[4, 4, 0, 0]}>
                      {temperatureWaterCurve.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.temp <= 25 ? '#10B981' : entry.temp <= 35 ? '#F59E0B' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-muted-foreground">≤25°C (Optimal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-muted-foreground">26-35°C (Moderate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-muted-foreground">&gt;35°C (High)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "Plate heat exchanger: zero water consumption, needs natural water source",
            "Cooling tower makeup: ~150 m³/hour peak for 100 MW facility",
            "Flow rate increases exponentially with inlet water temperature",
            "400 m³ reservoir provides 5-hour backup for 100 MW facility"
          ]}
          nextSectionId="electrical"
          nextSectionLabel="Learn Electrical Systems"
        />
      </div>
    </section>
  );
};

export default HydroWaterSystemsSection;