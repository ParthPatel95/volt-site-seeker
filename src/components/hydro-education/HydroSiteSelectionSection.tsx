import React, { useState } from 'react';
import { 
  Building2, 
  Zap, 
  Thermometer, 
  Droplets,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';

const siteCategories = [
  {
    id: 'policies',
    icon: Building2,
    title: 'Policies & Regulations',
    color: 'from-purple-500 to-violet-500',
    items: [
      { name: 'Local government cryptocurrency policies', critical: true },
      { name: 'Mining facility permits and licenses', critical: true },
      { name: 'Land use and zoning compliance', critical: true },
      { name: 'Environmental impact assessments', critical: false },
      { name: 'Noise pollution regulations', critical: false },
      { name: 'Import/export regulations for equipment', critical: false }
    ]
  },
  {
    id: 'electricity',
    icon: Zap,
    title: 'Electricity Resources',
    color: 'from-yellow-500 to-orange-500',
    items: [
      { name: 'Available capacity (minimum 100 MW recommended)', critical: true },
      { name: 'Voltage level compatibility (10-110 kV)', critical: true },
      { name: 'Grid stability and reliability', critical: true },
      { name: 'Power purchase agreement terms', critical: true },
      { name: 'Distance to substation (<5 km ideal)', critical: false },
      { name: 'Renewable energy availability', critical: false }
    ]
  },
  {
    id: 'climate',
    icon: Thermometer,
    title: 'Climate Conditions',
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'Maximum ambient temperature', critical: true },
      { name: 'Minimum ambient temperature', critical: true },
      { name: 'Wet bulb temperature (for evaporative cooling)', critical: true },
      { name: 'Annual temperature variation', critical: false },
      { name: 'Humidity levels', critical: false },
      { name: 'Air quality (dust, sand, salt)', critical: false }
    ]
  },
  {
    id: 'water',
    icon: Droplets,
    title: 'Water Resources',
    color: 'from-teal-500 to-green-500',
    items: [
      { name: 'Water source availability', critical: true },
      { name: 'Water quality testing (pH, hardness, conductivity)', critical: true },
      { name: 'Water rights and permits', critical: true },
      { name: 'Wastewater discharge permits', critical: false },
      { name: 'Seasonal water availability', critical: false },
      { name: 'Water treatment requirements', critical: false }
    ]
  }
];

const waterQualityRequirements = [
  { parameter: 'pH Value', requirement: '6.5 - 8.5', critical: true },
  { parameter: 'Total Hardness', requirement: '< 200 mg/L CaCO3', critical: true },
  { parameter: 'Conductivity', requirement: '< 1000 μS/cm', critical: true },
  { parameter: 'Chloride', requirement: '< 250 mg/L', critical: false },
  { parameter: 'Sulfate', requirement: '< 250 mg/L', critical: false },
  { parameter: 'Total Dissolved Solids', requirement: '< 500 mg/L', critical: false },
  { parameter: 'Iron', requirement: '< 0.3 mg/L', critical: false },
  { parameter: 'Manganese', requirement: '< 0.1 mg/L', critical: false },
  { parameter: 'Turbidity', requirement: '< 5 NTU', critical: false }
];

const HydroSiteSelectionSection = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('policies');

  return (
    <section id="site-selection" className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Site Selection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Site Selection Criteria
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive checklist for evaluating potential hydro-cooling mining farm locations.
            </p>
          </div>
        </ScrollReveal>

        <LearningObjectives
          objectives={[
            "Evaluate sites across 4 critical categories: policies, electricity, climate, water",
            "Understand water quality requirements for hydro-cooling systems",
            "Identify critical vs recommended site requirements"
          ]}
          estimatedTime="6 min"
        />

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {siteCategories.map((category, index) => (
            <ScrollReveal key={category.id} delay={index * 100}>
              <Card className="border-border h-full">
                <Collapsible
                  open={expandedCategory === category.id}
                  onOpenChange={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {category.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {category.items.filter(i => i.critical).length} critical requirements
                          </p>
                        </div>
                      </div>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {item.critical ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${item.critical ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {item.name}
                              {item.critical && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  Critical
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Water Quality Requirements Table */}
        <ScrollReveal>
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Water Quality Requirements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Essential water quality parameters for hydro-cooling systems
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Parameter</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Requirement</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterQualityRequirements.map((req, index) => (
                      <tr key={index} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{req.parameter}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{req.requirement}</td>
                        <td className="py-3 px-4 text-center">
                          {req.critical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                              <Shield className="w-3 h-3" />
                              Critical
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              Recommended
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Water Testing Recommendation</h4>
                    <p className="text-sm text-blue-700">
                      Conduct comprehensive water quality testing at least 3 times during different seasons 
                      before finalizing site selection. Poor water quality can lead to scaling, corrosion, 
                      and reduced system efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "Critical requirements: permits, 100 MW+ capacity, water quality testing",
            "pH 6.5-8.5 and conductivity <1000 μS/cm are essential water parameters",
            "Test water quality 3+ times across seasons before site selection",
            "Distance to substation <5 km is ideal for cost optimization"
          ]}
          nextSectionId="layout"
          nextSectionLabel="Explore Layout Options"
        />
      </div>
    </section>
  );
};

export default HydroSiteSelectionSection;
