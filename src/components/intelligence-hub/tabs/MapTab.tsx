
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Satellite, Filter, Factory, TrendingDown, Zap, Layers } from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { IntelOpportunity, OpportunityType } from '../types/intelligence-hub.types';

const typeFilters: { value: OpportunityType | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'All', icon: Layers, color: 'bg-muted text-foreground' },
  { value: 'idle_facility', label: 'Idle', icon: Factory, color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'distressed_company', label: 'Distressed', icon: TrendingDown, color: 'bg-red-500/20 text-red-600' },
  { value: 'power_asset', label: 'Power', icon: Zap, color: 'bg-blue-500/20 text-blue-600' },
];

export function MapTab() {
  const { state } = useIntelligenceHub();
  const [activeFilter, setActiveFilter] = useState<OpportunityType | 'all'>('all');
  const [selectedMarker, setSelectedMarker] = useState<IntelOpportunity | null>(null);

  const filteredOpportunities = activeFilter === 'all' 
    ? state.opportunities 
    : state.opportunities.filter(o => o.type === activeFilter);

  const opportunitiesWithCoords = filteredOpportunities.filter(o => o.location.coordinates);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {typeFilters.map(filter => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.value;
              return (
                <Button
                  key={filter.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {filter.label}
                </Button>
              );
            })}
            <div className="ml-auto">
              <Badge variant="outline">
                {opportunitiesWithCoords.length} mapped
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-primary" />
            Intelligence Map
            <Badge variant="secondary" className="ml-auto text-xs">
              {filteredOpportunities.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] bg-muted">
            {/* Map Placeholder - Would integrate with Mapbox */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Satellite className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Interactive Map View</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Real-time plotting of {filteredOpportunities.length} opportunities across your selected jurisdiction
              </p>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Idle Facility</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Distressed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Power Asset</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>High Potential</span>
                </div>
              </div>
            </div>

            {/* Sample Markers Overlay */}
            {opportunitiesWithCoords.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4">
                <Card className="bg-background/95 backdrop-blur">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {opportunitiesWithCoords.length} opportunities with coordinates
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {opportunitiesWithCoords.slice(0, 5).map(o => (
                        <Badge 
                          key={o.id} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-primary/10"
                          onClick={() => setSelectedMarker(o)}
                        >
                          {o.name.slice(0, 20)}...
                        </Badge>
                      ))}
                      {opportunitiesWithCoords.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{opportunitiesWithCoords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{selectedMarker.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{selectedMarker.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{selectedMarker.location.city}, {selectedMarker.location.state}</p>
              </div>
              {selectedMarker.metrics.powerCapacityMW && (
                <div>
                  <p className="text-xs text-muted-foreground">Power</p>
                  <p className="font-medium">{selectedMarker.metrics.powerCapacityMW} MW</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-medium">{Math.round(selectedMarker.metrics.confidenceLevel * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Opportunities to Map</h3>
            <p className="text-sm text-muted-foreground">
              Run an intelligence scan in the Discover tab to populate the map.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
