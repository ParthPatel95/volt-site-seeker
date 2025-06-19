
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
        // Check if substation already exists
        const { data: existingSubstation, error: checkError } = await supabase
          .from('substations')
          .select('id')
          .eq('name', substation.name)
          .eq('latitude', substation.latitude)
          .eq('longitude', substation.longitude)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing substation:', checkError);
          continue;
        }

        if (existingSubstation) {
          console.log('Substation already exists:', substation.name);
          continue;
        }

        // Insert new substation
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
          console.error('Error storing substation:', error);
        } else {
          console.log('Successfully stored substation:', substation.name);
        }
      } catch (error) {
        console.error('Error storing substation:', error);
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
      const updateSuccess = await updateSubstationAnalysis(substation, capacityResult, ownershipResult);
      
      if (!updateSuccess) {
        throw new Error('Failed to save analysis to database');
      }

      return true;
    } catch (error) {
      console.error(`Failed to analyze ${substation.name}:`, error);
      
      setSubstations(prev => 
        prev.map(s => s.id === substation.id 
          ? { ...s, analysis_status: 'failed' } 
          : s
        )
      );
      throw error;
    }
  };

  const updateSubstationAnalysis = async (substation: DiscoveredSubstation, capacityResult: any, ownershipResult?: any): Promise<boolean> => {
    try {
      // First, try to find the substation by name and coordinates
      const { data: existingSubstation, error: findError } = await supabase
        .from('substations')
        .select('id')
        .eq('name', substation.name)
        .eq('latitude', substation.latitude)
        .eq('longitude', substation.longitude)
        .maybeSingle();

      if (findError) {
        console.error('Error finding substation for update:', findError);
        return false;
      }

      if (!existingSubstation) {
        console.error('Substation not found for update:', substation.name);
        return false;
      }

      // Update the existing substation
      const { error: updateError } = await supabase
        .from('substations')
        .update({
          capacity_mva: Math.round(capacityResult.estimatedCapacity.max * 1.25),
          voltage_level: capacityResult.voltageLevel || 'Estimated',
          utility_owner: ownershipResult?.owner || 'Unknown',
          interconnection_type: capacityResult.substationType || 'distribution',
          status: 'active',
          load_factor: 0.75,
          commissioning_date: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
        })
        .eq('id', existingSubstation.id);

      if (updateError) {
        console.error('Error updating substation analysis:', updateError);
        return false;
      }

      console.log('Successfully updated substation analysis:', substation.name);
      return true;
    } catch (error) {
      console.error('Analysis update error:', error);
      return false;
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
