import React, { useState } from 'react';
import { 
  HardHat, 
  CheckSquare, 
  Clock,
  Truck,
  Wrench,
  AlertTriangle,
  Shield,
  Flame,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';

const materialCategories = [
  {
    category: 'Large Equipment',
    icon: Truck,
    color: 'from-blue-500 to-indigo-500',
    items: [
      { name: 'Tower Crane', quantity: '1-2 units', notes: 'For container lifting' },
      { name: 'Excavator (20T)', quantity: '2+ units', notes: 'Earthwork & trenching' },
      { name: 'Forklift (5T)', quantity: '2-4 units', notes: 'Material handling' },
      { name: 'Dump Trucks', quantity: '4-6 units', notes: 'Soil/gravel transport' },
      { name: 'Concrete Mixer', quantity: '2+ units', notes: 'Foundation work' },
      { name: 'Compactor', quantity: '1-2 units', notes: 'Ground compaction' }
    ]
  },
  {
    category: 'Civil Materials',
    icon: Package,
    color: 'from-orange-500 to-amber-500',
    items: [
      { name: 'Crushed Gravel (5cm)', quantity: '~3,000 m³/100MW', notes: '15cm surface layer' },
      { name: 'Concrete', quantity: '~500 m³/100MW', notes: 'Foundations & pads' },
      { name: 'Rebar', quantity: '~50 tons/100MW', notes: 'Foundation reinforcement' },
      { name: 'Security Fence', quantity: '~1,200m/100MW', notes: '2.4m height' },
      { name: 'Drainage Pipes', quantity: '~800m/100MW', notes: 'Storm water management' },
      { name: 'Geotextile', quantity: '~25,000 m²/100MW', notes: 'Ground stabilization' }
    ]
  },
  {
    category: 'Electrical Materials',
    icon: Package,
    color: 'from-yellow-500 to-orange-500',
    items: [
      { name: 'Transformers (2.5 MVA)', quantity: '40 units/100MW', notes: '10/0.4 kV step-down' },
      { name: 'MV Switchgear', quantity: '1 set', notes: '10kV distribution' },
      { name: 'MV Cable', quantity: '~5,000m/100MW', notes: '3-core 300mm²' },
      { name: 'LV Cable', quantity: '~20,000m/100MW', notes: 'Container connections' },
      { name: 'Cable Tray', quantity: '~3,000m/100MW', notes: 'Hot-dip galvanized' },
      { name: 'Grounding Grid', quantity: '~15,000m/100MW', notes: 'Copper conductor' }
    ]
  },
  {
    category: 'Water System Materials',
    icon: Package,
    color: 'from-cyan-500 to-blue-500',
    items: [
      { name: 'Water Reservoir', quantity: '2× 200m³', notes: '5-hour backup capacity' },
      { name: 'Water Pumps', quantity: '4-6 units', notes: 'Redundant configuration' },
      { name: 'PVC/HDPE Pipe', quantity: '~2,000m/100MW', notes: 'Main & distribution' },
      { name: 'Heat Exchangers', quantity: 'Per cooling design', notes: 'Plate or shell-tube' },
      { name: 'Water Treatment', quantity: '1 system', notes: 'Softener + filtration' },
      { name: 'Flow Meters', quantity: '~20 units', notes: 'Monitoring points' }
    ]
  }
];

const constructionSteps = [
  {
    phase: 'Site Preparation',
    duration: '2-4 weeks',
    color: 'bg-blue-500',
    tasks: [
      'Site survey and geotechnical assessment',
      'Clear vegetation and debris',
      'Establish site boundaries and access roads',
      'Set up temporary facilities (office, storage)',
      'Install erosion control measures'
    ],
    requirements: ['Min 1.5 ton/m² load capacity', '1% minimum drainage slope']
  },
  {
    phase: 'Earthwork & Grading',
    duration: '3-6 weeks',
    color: 'bg-orange-500',
    tasks: [
      'Cut and fill to achieve level grade',
      'Compact soil to specification (95% Proctor)',
      'Install drainage infrastructure',
      'Lay geotextile fabric',
      'Spread and compact gravel base (15cm)'
    ],
    requirements: ['5cm crushed stone finish', 'Cross-slope for drainage']
  },
  {
    phase: 'Infrastructure',
    duration: '4-8 weeks',
    color: 'bg-yellow-500',
    tasks: [
      'Install perimeter fence and security systems',
      'Construct transformer pads (concrete)',
      'Build container foundation rails (sleeper wood + concrete)',
      'Install underground utilities (if applicable)',
      'Construct control/office building'
    ],
    requirements: ['Foundation: 15cm height, 12T capacity', 'Level tolerance: ±20mm']
  },
  {
    phase: 'Electrical Installation',
    duration: '4-6 weeks',
    color: 'bg-green-500',
    tasks: [
      'Install main switchgear building',
      'Position and connect transformers',
      'Run MV and LV cables',
      'Install grounding grid',
      'Connect to utility grid'
    ],
    requirements: ['Cable derating applied', 'Protection coordination verified']
  },
  {
    phase: 'Water Systems',
    duration: '3-5 weeks',
    color: 'bg-cyan-500',
    tasks: [
      'Install water reservoirs',
      'Lay main water pipelines',
      'Install pumping stations',
      'Connect cooling systems (towers/exchangers)',
      'Commission water treatment'
    ],
    requirements: ['Pressure test all lines', 'Flow rate verification']
  },
  {
    phase: 'Container Deployment',
    duration: '2-4 weeks',
    color: 'bg-purple-500',
    tasks: [
      'Position containers on foundations',
      'Connect electrical feeds',
      'Connect cooling water lines',
      'Install network cabling',
      'Load miners into containers'
    ],
    requirements: ['Level within ±10mm', 'All utilities verified']
  },
  {
    phase: 'Testing & Commissioning',
    duration: '2-3 weeks',
    color: 'bg-emerald-500',
    tasks: [
      'Individual container power-on tests',
      'Cooling system performance verification',
      'Network connectivity testing',
      'Full load testing (staged ramp-up)',
      'Final documentation and handover'
    ],
    requirements: ['72-hour stability test', 'All alarms configured']
  }
];

const acceptanceChecklist = [
  {
    category: 'Civil & Structural',
    items: [
      { item: 'Ground compaction test results', critical: true },
      { item: 'Foundation level survey', critical: true },
      { item: 'Drainage flow verification', critical: false },
      { item: 'Fence integrity inspection', critical: false },
      { item: 'Road load capacity test', critical: false }
    ]
  },
  {
    category: 'Electrical',
    items: [
      { item: 'Transformer ratio and polarity tests', critical: true },
      { item: 'Insulation resistance (Megger) tests', critical: true },
      { item: 'Protection relay settings verification', critical: true },
      { item: 'Grounding resistance measurement', critical: true },
      { item: 'Cable termination inspection', critical: false }
    ]
  },
  {
    category: 'Water Systems',
    items: [
      { item: 'Pressure test (all pipelines)', critical: true },
      { item: 'Flow rate measurement', critical: true },
      { item: 'Water quality analysis', critical: false },
      { item: 'Pump performance curves', critical: false },
      { item: 'Leak inspection', critical: true }
    ]
  },
  {
    category: 'Mining Equipment',
    items: [
      { item: 'Container power-on test', critical: true },
      { item: 'Cooling flow verification', critical: true },
      { item: 'Network connectivity test', critical: true },
      { item: 'Hashrate verification (per container)', critical: false },
      { item: 'Temperature monitoring functional', critical: true }
    ]
  }
];

const fireProtectionRequirements = [
  { item: 'CO₂ Fire Extinguishers', location: 'Each container entrance', quantity: '2 per container', note: 'NOT water-based!' },
  { item: 'Fire Blankets', location: 'Workbench areas', quantity: '1 per 2 containers', note: 'For small fires' },
  { item: 'Smoke Detectors', location: 'Inside containers', quantity: 'Per container', note: 'Integrated with alarm' },
  { item: 'Emergency Shutoff', location: 'Container exterior', quantity: '1 per container', note: 'Power + water cutoff' },
  { item: 'Fire-Resistant Materials', location: 'Workbenches, storage', quantity: 'All areas', note: 'Flame-retardant rated' },
  { item: 'Emergency Lighting', location: 'All pathways', quantity: 'Every 20m', note: 'Battery backup' }
];

const HydroConstructionSection = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Large Equipment');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  return (
    <section id="construction" className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              <HardHat className="w-4 h-4" />
              Construction & Acceptance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Site Construction Guide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive material requirements, construction phases, and acceptance 
              criteria for building a hydro-cooled mining facility.
            </p>
          </div>
        </ScrollReveal>

        <LearningObjectives
          objectives={[
            "Plan material requirements for 100 MW facility construction",
            "Understand 7-phase construction timeline (20-35 weeks total)",
            "Learn fire protection and acceptance criteria requirements"
          ]}
          estimatedTime="7 min"
        />

        {/* Material Preparation */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Material Preparation (100 MW Reference)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {materialCategories.map((cat) => (
              <Collapsible
                key={cat.category}
                open={expandedCategory === cat.category}
                onOpenChange={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
              >
                <Card className="border-border">
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                            <cat.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-foreground">{cat.category}</h4>
                            <span className="text-sm text-muted-foreground">{cat.items.length} items</span>
                          </div>
                        </div>
                        {expandedCategory === cat.category ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <div className="border-t border-border pt-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left pb-2">Item</th>
                              <th className="text-center pb-2">Quantity</th>
                              <th className="text-right pb-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.items.map((item, i) => (
                              <tr key={i} className="border-t border-border/50">
                                <td className="py-2 font-medium text-foreground">{item.name}</td>
                                <td className="py-2 text-center text-blue-600 font-mono text-xs">{item.quantity}</td>
                                <td className="py-2 text-right text-muted-foreground text-xs">{item.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </ScrollReveal>

        {/* Construction Timeline */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Construction Phases
          </h3>
          <div className="space-y-4 mb-12">
            {constructionSteps.map((step, index) => (
              <Collapsible
                key={index}
                open={expandedPhase === index}
                onOpenChange={() => setExpandedPhase(expandedPhase === index ? null : index)}
              >
                <Card className="border-border">
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-foreground">{step.phase}</h4>
                          <span className="text-sm text-muted-foreground">{step.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {step.tasks.length} tasks
                          </span>
                          {expandedPhase === index ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-foreground mb-2">Tasks</h5>
                          <ul className="space-y-1">
                            {step.tasks.map((task, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-foreground mb-2">Key Requirements</h5>
                          <ul className="space-y-1">
                            {step.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </ScrollReveal>

        {/* Fire Protection */}
        <ScrollReveal>
          <Card className="border-border mb-12 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Fire Protection Requirements</h3>
                  <p className="text-sm text-muted-foreground">Critical safety equipment for hydro-cooled facilities</p>
                </div>
              </div>

              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-red-800">CRITICAL: Do NOT use water-based extinguishers!</span>
                    <p className="text-sm text-red-700">Water contact with energized electrical equipment can cause electrocution and equipment damage. Use CO₂ extinguishers only.</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Equipment</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fireProtectionRequirements.map((req, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium text-foreground">{req.item}</td>
                        <td className="py-3 px-4 text-muted-foreground">{req.location}</td>
                        <td className="py-3 px-4 text-center text-orange-600 font-mono">{req.quantity}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{req.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Acceptance Checklist */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            Acceptance Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptanceChecklist.map((section, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">{section.category}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm text-muted-foreground">{item.item}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.critical ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.critical ? 'Critical' : 'Standard'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "7 construction phases spanning 20-35 weeks total",
            "CO₂ extinguishers only - never use water-based for electrical fires",
            "72-hour stability test required before handover",
            "Foundation: 15cm height, 12T capacity, level tolerance ±20mm"
          ]}
          nextSectionId="economics"
          nextSectionLabel="Learn Economics"
        />
      </div>
    </section>
  );
};

export default HydroConstructionSection;