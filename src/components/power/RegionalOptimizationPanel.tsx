
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Map,
  Zap,
  Target,
  TrendingUp,
  MapPin,
  Search
} from 'lucide-react';

interface TransmissionCorridor {
  id: string;
  name: string;
  start_point: { lat: number; lng: number };
  end_point: { lat: number; lng: number };
  voltage_level: string;
  estimated_substations: number;
  search_priority: 'high' | 'medium' | 'low';
  completion_status: number;
}

interface RegionalStrategy {
  region: string;
  search_strategies: string[];
  data_sources: string[];
  voltage_priorities: string[];
  completion_rate: number;
  total_substations_found: number;
  estimated_missing: number;
}

export function RegionalOptimizationPanel() {
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [corridors, setCorridors] = useState<TransmissionCorridor[]>([]);
  const [strategies, setStrategies] = useState<RegionalStrategy[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<'alberta' | 'texas'>('texas');
  const { toast } = useToast();

  const optimizeRegionalSearch = async () => {
    setOptimizing(true);
    setProgress(0);

    try {
      console.log('Starting regional optimization for', selectedRegion);
      
      // Phase 1: Analyze transmission corridors
      setProgress(20);
      const mockCorridors: TransmissionCorridor[] = selectedRegion === 'texas' ? [
        {
          id: 'tx_corridor_1',
          name: 'Houston-Dallas 345kV Corridor',
          start_point: { lat: 29.7604, lng: -95.3698 },
          end_point: { lat: 32.7767, lng: -96.7970 },
          voltage_level: '345kV',
          estimated_substations: 12,
          search_priority: 'high',
          completion_status: 75
        },
        {
          id: 'tx_corridor_2',
          name: 'Austin-San Antonio 138kV Corridor',
          start_point: { lat: 30.2672, lng: -97.7431 },
          end_point: { lat: 29.4241, lng: -98.4936 },
          voltage_level: '138kV',
          estimated_substations: 8,
          search_priority: 'medium',
          completion_status: 60
        }
      ] : [
        {
          id: 'ab_corridor_1',
          name: 'Calgary-Edmonton 240kV Corridor',
          start_point: { lat: 51.0447, lng: -114.0719 },
          end_point: { lat: 53.4808, lng: -113.5024 },
          voltage_level: '240kV',
          estimated_substations: 10,
          search_priority: 'high',
          completion_status: 80
        },
        {
          id: 'ab_corridor_2',
          name: 'Red Deer-Fort McMurray 138kV Corridor',
          start_point: { lat: 52.2681, lng: -113.8112 },
          end_point: { lat: 56.7267, lng: -111.3790 },
          voltage_level: '138kV',
          estimated_substations: 6,
          search_priority: 'medium',
          completion_status: 45
        }
      ];

      setCorridors(mockCorridors);
      setProgress(50);

      // Phase 2: Generate regional strategies
      const mockStrategies: RegionalStrategy[] = [{
        region: selectedRegion === 'texas' ? 'Texas (ERCOT)' : 'Alberta (AESO)',
        search_strategies: [
          'Transmission corridor mapping',
          'Voltage-level prioritization',
          'Utility service territory analysis',
          'Population density correlation'
        ],
        data_sources: selectedRegion === 'texas' ? [
          'ERCOT Transmission Planning',
          'Texas PUC Filings',
          'Google Maps API',
          'USGS Infrastructure Data'
        ] : [
          'AESO Transmission System',
          'AltaLink Management Data',
          'Google Maps API',
          'Natural Resources Canada'
        ],
        voltage_priorities: ['345kV', '240kV', '138kV', '69kV'],
        completion_rate: 72,
        total_substations_found: selectedRegion === 'texas' ? 156 : 89,
        estimated_missing: selectedRegion === 'texas' ? 61 : 34
      }];

      setStrategies(mockStrategies);
      setProgress(100);

      toast({
        title: "Regional Optimization Complete",
        description: `Analyzed ${mockCorridors.length} transmission corridors and generated optimization strategies`,
      });

    } catch (error: any) {
      console.error('Regional optimization error:', error);
      toast({
        title: "Optimization Error",
        description: error.message || "Failed to perform regional optimization",
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const searchCorridor = async (corridor: TransmissionCorridor) => {
    try {
      console.log('Searching corridor:', corridor.name);
      
      // Simulate corridor search
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCorridors(prev => 
        prev.map(c => 
          c.id === corridor.id 
            ? { ...c, completion_status: Math.min(100, c.completion_status + 15) }
            : c
        )
      );

      toast({
        title: "Corridor Search Complete",
        description: `Completed search along ${corridor.name}`,
      });

    } catch (error: any) {
      console.error('Corridor search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search transmission corridor",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Regional Optimization System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Target Region</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as 'alberta' | 'texas')}
              >
                <option value="texas">Texas (ERCOT)</option>
                <option value="alberta">Alberta (AESO)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={optimizeRegionalSearch}
                disabled={optimizing}
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Optimize Search Strategy
              </Button>
            </div>
          </div>

          {optimizing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Optimization Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {strategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Strategy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {strategies.map((strategy, idx) => (
              <div key={idx} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{strategy.completion_rate}%</div>
                    <div className="text-sm text-blue-800">Completion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{strategy.total_substations_found}</div>
                    <div className="text-sm text-green-800">Substations Found</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{strategy.estimated_missing}</div>
                    <div className="text-sm text-orange-800">Estimated Missing</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Search Strategies</h4>
                    <div className="space-y-1">
                      {strategy.search_strategies.map((strat, sidx) => (
                        <div key={sidx} className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          {strat}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    <div className="space-y-1">
                      {strategy.data_sources.map((source, sidx) => (
                        <div key={sidx} className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-green-500" />
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {corridors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transmission Corridors ({corridors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {corridors.map((corridor) => (
                <div key={corridor.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{corridor.name}</span>
                      <Badge className={getPriorityColor(corridor.search_priority)}>
                        {corridor.search_priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {corridor.voltage_level}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => searchCorridor(corridor)}
                      disabled={corridor.completion_status >= 100}
                    >
                      <Search className="w-4 h-4 mr-1" />
                      {corridor.completion_status >= 100 ? 'Complete' : 'Search'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Progress</h4>
                      <div className="space-y-2">
                        <Progress value={corridor.completion_status} className="w-full" />
                        <div className="text-sm text-muted-foreground">
                          {corridor.completion_status}% complete
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Estimated Substations</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {corridor.estimated_substations}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Coordinates</h4>
                      <div className="text-sm space-y-1">
                        <div>Start: {corridor.start_point.lat.toFixed(3)}, {corridor.start_point.lng.toFixed(3)}</div>
                        <div>End: {corridor.end_point.lat.toFixed(3)}, {corridor.end_point.lng.toFixed(3)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
