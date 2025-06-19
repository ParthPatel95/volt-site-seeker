
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, Brain } from 'lucide-react';

interface DiscoveredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id: string;
  address: string;
  capacity_estimate?: {
    min: number;
    max: number;
    confidence: number;
  };
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  stored_at?: string;
  details?: {
    utility_owner?: string;
    voltage_level?: string;
    interconnection_type?: string;
    commissioning_date?: string;
    load_factor?: number;
    status?: string;
    ownership_confidence?: number;
    ownership_source?: string;
  };
}

interface SubstationActionsProps {
  substation: DiscoveredSubstation;
  onViewDetails: (substation: DiscoveredSubstation) => void;
  onViewOnMap: (substation: DiscoveredSubstation) => void;
  onAnalyzeSubstation?: (substation: DiscoveredSubstation) => void;
  analyzing?: boolean;
}

export function SubstationActions({ 
  substation, 
  onViewDetails, 
  onViewOnMap, 
  onAnalyzeSubstation,
  analyzing = false
}: SubstationActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onAnalyzeSubstation && (substation.analysis_status === 'pending' || substation.analysis_status === 'completed' || substation.analysis_status === 'failed') && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAnalyzeSubstation(substation)}
          disabled={analyzing}
        >
          <Brain className="w-4 h-4 mr-1" />
          {substation.analysis_status === 'completed' ? 'Re-analyze' : 'Analyze'}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(substation)}
      >
        <Eye className="w-4 h-4 mr-1" />
        Details
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewOnMap(substation)}
      >
        <MapPin className="w-4 h-4 mr-1" />
        Map
      </Button>
    </div>
  );
}
