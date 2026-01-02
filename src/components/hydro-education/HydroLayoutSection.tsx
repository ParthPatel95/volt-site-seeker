import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Box, 
  Zap,
  Ruler,
  Info,
  ChevronRight
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';

const layoutSchemes = [
  {
    id: 'hk3-classic',
    name: 'Classic HK3 Layout',
    description: 'Standard hydro-cooling container arrangement optimized for 100 MW capacity',
    landArea: '20,000 m²',
    capacity: '100 MW',
    containers: 40,
    transformers: 20,
    color: 'from-blue-500 to-cyan-500',
    specs: {
      containerDimensions: '12.2m × 2.4m × 2.9m',
      transformerRating: '2,500 kVA each',
      roadWidth: '6m main, 4m secondary',
      coolingArea: '5,000 m²'
    }
  },
  {
    id: 'hw5-classic',
    name: 'Classic HW5 Layout',
    description: 'Expanded layout for larger operations with enhanced airflow',
    landArea: '32,000 m²',
    capacity: '150 MW',
    containers: 60,
    transformers: 30,
    color: 'from-green-500 to-emerald-500',
    specs: {
      containerDimensions: '12.2m × 2.4m × 2.9m',
      transformerRating: '2,500 kVA each',
      roadWidth: '8m main, 5m secondary',
      coolingArea: '8,000 m²'
    }
  },
  {
    id: 'hk3-pv',
    name: 'HK3 with PV Rooftop',
    description: 'Enclosed facility with solar panel roof for supplemental power',
    landArea: '36,500 m²',
    capacity: '100 MW + 5 MW Solar',
    containers: 40,
    transformers: 20,
    color: 'from-yellow-500 to-orange-500',
    specs: {
      containerDimensions: '12.2m × 2.4m × 2.9m',
      transformerRating: '2,500 kVA each',
      roofArea: '15,000 m² (solar)',
      solarCapacity: '5 MW peak'
    }
  },
  {
    id: 'hd5',
    name: 'HD5 High-Density Layout',
    description: 'Maximum density configuration for space-constrained sites',
    landArea: '18,000 m²',
    capacity: '100 MW',
    containers: 40,
    transformers: 20,
    color: 'from-purple-500 to-violet-500',
    specs: {
      containerDimensions: '12.2m × 2.4m × 2.9m',
      transformerRating: '2,500 kVA each',
      spacing: 'Minimum 2m between units',
      verticalClearance: '4m'
    }
  }
];

const HydroLayoutSection = () => {
  const [selectedLayout, setSelectedLayout] = useState(layoutSchemes[0]);

  return (
    <section id="layout" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              <LayoutGrid className="w-4 h-4" />
              Modular Design
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Facility Layout Options
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore different modular layout configurations optimized for various capacity 
              requirements and site constraints.
            </p>
          </div>
        </ScrollReveal>

        <LearningObjectives
          objectives={[
            "Compare 4 different facility layout configurations",
            "Calculate land area requirements for various capacities",
            "Understand the modular 'basic unit' concept for scalable deployment"
          ]}
          estimatedTime="5 min"
        />

        {/* Layout Selector */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {layoutSchemes.map((layout) => (
              <Button
                key={layout.id}
                variant={selectedLayout.id === layout.id ? "default" : "outline"}
                className={`h-auto py-4 px-4 flex flex-col items-center gap-2 ${
                  selectedLayout.id === layout.id 
                    ? 'bg-gradient-to-br ' + layout.color + ' text-white border-0' 
                    : 'border-border text-foreground hover:border-blue-300'
                }`}
                onClick={() => setSelectedLayout(layout)}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{layout.name}</span>
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Selected Layout Details */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Layout Visualization */}
            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground">{selectedLayout.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLayout.description}</p>
                </div>
                
                {/* Layout Diagram */}
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-8 min-h-[400px]">
                  {/* Grid overlay */}
                  <div className="absolute inset-4 grid grid-cols-8 grid-rows-6 gap-1 opacity-20">
                    {[...Array(48)].map((_, i) => (
                      <div key={i} className="border border-slate-400 rounded-sm" />
                    ))}
                  </div>

                  {/* Container rows */}
                  <div className="relative z-10 space-y-4">
                    {/* Row 1 - Transformers */}
                    <div className="flex justify-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center"
                          title="2500 kVA Transformer"
                        >
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                      ))}
                    </div>

                    {/* Row 2-4 - Containers */}
                    {[...Array(3)].map((_, row) => (
                      <div key={row} className="flex justify-center gap-2">
                        {[...Array(8)].map((_, col) => (
                          <div 
                            key={col}
                            className={`w-10 h-16 rounded flex items-center justify-center bg-gradient-to-b ${selectedLayout.color} shadow-sm hover:scale-105 transition-transform cursor-pointer`}
                            title="Mining Container (40 ft)"
                          >
                            <Box className="w-4 h-4 text-white" />
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Cooling Area */}
                    <div className="flex justify-center gap-4 mt-8">
                      <div className="px-6 py-3 bg-blue-300 rounded-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-sm font-medium text-blue-800">Cooling Tower Area</span>
                      </div>
                      <div className="px-6 py-3 bg-gray-300 rounded-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        <span className="text-sm font-medium text-gray-800">Control Building</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-500 rounded" />
                      <span className="text-muted-foreground">Transformer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-4 h-6 rounded bg-gradient-to-b ${selectedLayout.color}`} />
                      <span className="text-muted-foreground">Container</span>
                    </div>
                  </div>

                  {/* Dimensions indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-foreground">
                    <Ruler className="w-3 h-3" />
                    {selectedLayout.landArea}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications Panel */}
            <div className="space-y-6">
              {/* Key Metrics */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <span className="text-xs text-muted-foreground">Land Area</span>
                      <div className="text-2xl font-bold text-blue-600">{selectedLayout.landArea}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <span className="text-xs text-muted-foreground">Power Capacity</span>
                      <div className="text-2xl font-bold text-green-600">{selectedLayout.capacity}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50">
                      <span className="text-xs text-muted-foreground">Containers</span>
                      <div className="text-2xl font-bold text-purple-600">{selectedLayout.containers}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <span className="text-xs text-muted-foreground">Transformers</span>
                      <div className="text-2xl font-bold text-yellow-600">{selectedLayout.transformers}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specs */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Technical Specifications</h4>
                  <ul className="space-y-3">
                    {Object.entries(selectedLayout.specs).map(([key, value]) => (
                      <li key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-foreground font-mono">{value}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Basic Unit Info */}
              <Card className="border-border bg-gradient-to-br from-watt-navy to-blue-900 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Modular "Basic Unit"</h4>
                      <p className="text-sm text-white/70 mb-3">
                        Each basic unit consists of 1 transformer (2,500 kVA) + 2 mining containers 
                        (40 ft each). This modular approach allows for scalable deployment.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <ChevronRight className="w-4 h-4 text-blue-300" />
                          2.5 MW per unit
                        </span>
                        <span className="flex items-center gap-1">
                          <ChevronRight className="w-4 h-4 text-blue-300" />
                          ~100 miners per container
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "100 MW Classic HK3 layout requires ~20,000 m² land area",
            "PV rooftop option adds 5 MW solar capacity to facilities",
            "HD5 high-density layout minimizes land requirements",
            "Modular basic unit enables phased deployment and scaling"
          ]}
          nextSectionId="water-systems"
          nextSectionLabel="Learn Water Systems"
        />
      </div>
    </section>
  );
};

export default HydroLayoutSection;