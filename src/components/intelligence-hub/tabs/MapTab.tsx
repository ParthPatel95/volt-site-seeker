
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, Factory, TrendingDown, Zap, Layers, X } from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { IntelOpportunity, OpportunityType } from '../types/intelligence-hub.types';
import { IntelligenceMap } from '../components/IntelligenceMap';
import { IntelDetailsModal } from '../components/IntelDetailsModal';

const typeFilters: { value: OpportunityType | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'All', icon: Layers, color: 'bg-muted text-foreground' },
  { value: 'idle_facility', label: 'Idle', icon: Factory, color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'distressed_company', label: 'Distressed', icon: TrendingDown, color: 'bg-red-500/20 text-red-600' },
  { value: 'power_asset', label: 'Power', icon: Zap, color: 'bg-blue-500/20 text-blue-600' },
];

export function MapTab() {
  const { state } = useIntelligenceHub();
  const [activeFilter, setActiveFilter] = useState<OpportunityType | 'all'>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<IntelOpportunity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredOpportunities = activeFilter === 'all' 
    ? state.opportunities 
    : state.opportunities.filter(o => o.type === activeFilter);

  const handleSelectOpportunity = (opportunity: IntelOpportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleViewDetails = () => {
    if (selectedOpportunity) {
      setDetailsOpen(true);
    }
  };

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
                {filteredOpportunities.filter(o => o.location.coordinates).length} mapped
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
            {filteredOpportunities.length > 0 ? (
              <IntelligenceMap 
                opportunities={filteredOpportunities}
                onSelectOpportunity={handleSelectOpportunity}
                selectedOpportunity={selectedOpportunity}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-muted/50">
                <MapPin className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Opportunities to Map</h3>
                <p className="text-sm text-muted-foreground">
                  Run an intelligence scan in the Discover tab to populate the map.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Marker Details */}
      {selectedOpportunity && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedOpportunity.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOpportunity(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{selectedOpportunity.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{selectedOpportunity.location.city}, {selectedOpportunity.location.state}</p>
              </div>
              {selectedOpportunity.metrics.powerCapacityMW && (
                <div>
                  <p className="text-xs text-muted-foreground">Power</p>
                  <p className="font-medium">{selectedOpportunity.metrics.powerCapacityMW.toFixed(0)} MW</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-medium">{Math.round(selectedOpportunity.metrics.confidenceLevel * 100)}%</p>
              </div>
            </div>
            <Button onClick={handleViewDetails} className="w-full">
              View Full Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      <IntelDetailsModal 
        opportunity={selectedOpportunity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
