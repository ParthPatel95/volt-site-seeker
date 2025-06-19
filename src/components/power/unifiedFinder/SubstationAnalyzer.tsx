
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
  setSubstations: React.Dispatch<React.SetStateAction<DiscoveredSubstation[]>>;
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

  const storeDiscoveredSubstations = async (substationsToStore: DiscoveredSubstation[]) => {
    console.log('Storing discovered substations:', substationsToStore.length);
    
    for (const substation of substationsToStore) {
      try {
        // Simple insert without upsert to avoid constraint issues
        const { error } = await supabase
          .from('substations')
          .insert({
            name: substation.name,
            latitude: substation.latitude,
            longitude: substation.longitude,
            city: extractCityFromAddress(substation.address),
            state: extractStateFromAddress(substation.address),
            capacity_mva: 50, // Default capacity until analyzed
            voltage_level: 'Unknown',
            utility_owner: 'Unknown',
            interconnection_type: 'distribution',
            load_factor: 0.75,
            status: 'discovered',
            coordinates_source: activeMethod === 'google' ? 'google_maps_api' : 'map_search'
          });

        if (error) {
          console.log('Substation may already exist:', substation.name);
          // Don't throw error, just log and continue
        }
      } catch (error) {
        console.log('Error storing substation:', error);
        // Continue with other substations
      }
    }
  };

  const analyzeSubstation = async (substation: DiscoveredSubstation) => {
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

      // Update substation with analysis results
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

      // Update in database with analysis results
      await updateSubstationAnalysis(substation, capacityResult, ownershipResult);

      return true;
    } catch (error) {
      console.error(`Failed to analyze ${substation.name}:`, error);
      
      setSubstations(prev => 
        prev.map(s => s.id === substation.id 
          ? { ...s, analysis_status: 'failed' } 
          : s
        )
      );
      return false;
    }
  };

  const updateSubstationAnalysis = async (substation: DiscoveredSubstation, capacityResult: any, ownershipResult?: any) => {
    try {
      const { error } = await supabase
        .from('substations')
        .update({
          capacity_mva: capacityResult.estimatedCapacity.max * 1.25,
          voltage_level: capacityResult.voltageLevel || 'Estimated',
          utility_owner: ownershipResult?.owner || 'Unknown',
          interconnection_type: capacityResult.substationType || 'distribution',
          status: 'active'
        })
        .eq('name', substation.name)
        .eq('latitude', substation.latitude)
        .eq('longitude', substation.longitude);

      if (error) {
        console.error('Error updating substation analysis:', error);
      }
    } catch (error) {
      console.error('Analysis update error:', error);
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
    storeDiscoveredSubstations,
    analyzeSubstation
  };
}
