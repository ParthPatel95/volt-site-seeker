
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { supabase } from '@/integrations/supabase/client';

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

interface SubstationAnalyzerProps {
  substations: DiscoveredSubstation[];
  setSubstations: (substations: DiscoveredSubstation[]) => void;
  activeMethod: 'google' | 'map';
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function useSubstationAnalyzer({
  substations,
  setSubstations,
  activeMethod,
  onProgress,
  onComplete
}: SubstationAnalyzerProps) {
  const { estimateCapacity } = useCapacityEstimator();

  const analyzeAllSubstations = async (substationsToAnalyze: DiscoveredSubstation[]) => {
    const total = substationsToAnalyze.length;
    
    for (let i = 0; i < substationsToAnalyze.length; i++) {
      const substation = substationsToAnalyze[i];
      
      try {
        setSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'analyzing' } 
            : s
          )
        );

        // Import the ownership detection utility
        const { detectSubstationOwnership } = await import('@/utils/substationOwnership');
        
        // Detect ownership
        const ownershipResult = await detectSubstationOwnership(
          substation.name,
          substation.latitude,
          substation.longitude,
          substation.address
        );

        const capacityResult = await estimateCapacity({
          latitude: substation.latitude,
          longitude: substation.longitude,
          manualOverride: {
            utilityContext: {
              name: substation.name,
              notes: `Auto-discovered via ${activeMethod === 'google' ? 'Google API' : 'Map Search'}`
            }
          }
        });

        const capacityEstimate = {
          min: capacityResult.estimatedCapacity.min,
          max: capacityResult.estimatedCapacity.max,
          confidence: capacityResult.detectionResults.confidence
        };

        // Update substation with ownership and enhanced details
        setSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { 
                ...s, 
                analysis_status: 'completed',
                capacity_estimate: capacityEstimate,
                details: {
                  ...s.details,
                  utility_owner: ownershipResult.owner,
                  voltage_level: capacityResult.voltageLevel || 'Estimated',
                  interconnection_type: capacityResult.substationType || 'distribution',
                  ownership_confidence: ownershipResult.confidence,
                  ownership_source: ownershipResult.source,
                  commissioning_date: new Date().toISOString(),
                  load_factor: 0.75,
                  status: 'active'
                }
              } 
            : s
          )
        );

        await storeSubstationData(substation, capacityResult, ownershipResult);

      } catch (error) {
        console.error(`Failed to analyze ${substation.name}:`, error);
        
        setSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'failed' } 
            : s
          )
        );
      }

      onProgress(25 + ((i + 1) / total) * 75);
    }

    onComplete();
  };

  const storeSubstationData = async (substation: DiscoveredSubstation, capacityResult: any, ownershipResult?: any) => {
    try {
      const { error } = await supabase
        .from('substations')
        .upsert({
          name: substation.name,
          latitude: substation.latitude,
          longitude: substation.longitude,
          city: extractCityFromAddress(substation.address),
          state: extractStateFromAddress(substation.address),
          capacity_mva: capacityResult.estimatedCapacity.max * 1.25,
          voltage_level: capacityResult.voltageLevel || 'Estimated',
          utility_owner: ownershipResult?.owner || 'Unknown',
          interconnection_type: capacityResult.substationType || 'distribution',
          load_factor: 0.75,
          status: 'active',
          coordinates_source: activeMethod === 'google' ? 'google_maps_api' : 'map_search'
        }, {
          onConflict: 'name,latitude,longitude',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error storing substation:', error);
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const extractCityFromAddress = (address: string): string => {
    const parts = address.split(',');
    return parts[0]?.trim() || 'Unknown';
  };

  const extractStateFromAddress = (address: string): string => {
    const parts = address.split(',');
    const statePart = parts[parts.length - 2]?.trim();
    return statePart?.split(' ')[0] || 'Unknown';
  };

  return {
    analyzeAllSubstations
  };
}
