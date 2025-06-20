
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedSubstationFinder } from './UnifiedSubstationFinder';
import { EnhancedSatelliteAnalysisPanel } from './EnhancedSatelliteAnalysisPanel';
import { MultiSourceValidationPanel } from './MultiSourceValidationPanel';
import { RegionalOptimizationPanel } from './RegionalOptimizationPanel';
import { QualityAssurancePanel } from './QualityAssurancePanel';
import { 
  Search, 
  Satellite, 
  Database, 
  Map, 
  BarChart3,
  CheckCircle
} from 'lucide-react';

export function ComprehensiveSubstationFinder() {
  const [activePhase, setActivePhase] = useState('unified-search');

  const phases = [
    {
      id: 'unified-search',
      name: 'Unified Search',
      icon: Search,
      description: 'Google Maps + Map-based search',
      status: 'active'
    },
    {
      id: 'satellite-analysis',
      name: 'Satellite Analysis',
      icon: Satellite,
      description: 'ML-powered satellite detection',
      status: 'active'
    },
    {
      id: 'validation',
      name: 'Multi-Source Validation',
      icon: Database,
      description: 'Cross-reference & validate data',
      status: 'active'
    },
    {
      id: 'optimization',
      name: 'Regional Optimization',
      icon: Map,
      description: 'Transmission corridor mapping',
      status: 'active'
    },
    {
      id: 'analytics',
      name: 'Quality Analytics',
      icon: BarChart3,
      description: 'Predictive models & prioritization',
      status: 'active'
    }
  ];

  const getPhaseIcon = (IconComponent: any, status: string) => {
    return (
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4" />
        {status === 'active' && <CheckCircle className="w-3 h-3 text-green-500" />}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Comprehensive Substation Discovery System
            <Badge variant="outline" className="ml-2">All 5 Phases Active</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Complete end-to-end substation discovery, validation, and optimization platform
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {phases.map((phase, idx) => (
              <div
                key={phase.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activePhase === phase.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setActivePhase(phase.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  {getPhaseIcon(phase.icon, phase.status)}
                  <Badge 
                    variant={phase.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    Phase {idx + 1}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{phase.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {phase.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="unified-search" className="text-xs sm:text-sm">
            Unified Search
          </TabsTrigger>
          <TabsTrigger value="satellite-analysis" className="text-xs sm:text-sm">
            Satellite AI
          </TabsTrigger>
          <TabsTrigger value="validation" className="text-xs sm:text-sm">
            Validation
          </TabsTrigger>
          <TabsTrigger value="optimization" className="text-xs sm:text-sm">
            Optimization
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified-search" className="space-y-6">
          <UnifiedSubstationFinder />
        </TabsContent>

        <TabsContent value="satellite-analysis" className="space-y-6">
          <EnhancedSatelliteAnalysisPanel />
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <MultiSourceValidationPanel />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <RegionalOptimizationPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <QualityAssurancePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
