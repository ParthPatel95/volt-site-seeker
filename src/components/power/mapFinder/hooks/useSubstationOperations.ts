
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { DiscoveredSubstation, GridCell } from '../types';

export function useSubstationOperations() {
  const { estimateCapacity } = useCapacityEstimator();

  const searchGridCell = async (cell: GridCell): Promise<DiscoveredSubstation[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: `${cell.center.lat},${cell.center.lng}`,
          searchRadius: 70000, // 70km radius to cover 100km cell with overlap
          maxResults: 500 // No artificial limit
        }
      });

      if (error) throw error;
      
      return data.substations.map((sub: any) => ({
        ...sub,
        analysis_status: 'pending'
      }));
    } catch (error) {
      console.error(`Failed to search cell ${cell.id}:`, error);
      return [];
    }
  };

  const analyzeSubstationCapacity = async (substation: DiscoveredSubstation) => {
    try {
      console.log(`Analyzing substation: ${substation.name}`);

      const capacityResult = await estimateCapacity({
        latitude: substation.latitude,
        longitude: substation.longitude,
        manualOverride: {
          utilityContext: {
            name: substation.name,
            notes: `Auto-discovered via grid search`
          }
        }
      });

      const capacityEstimate = {
        min: capacityResult.estimatedCapacity.min,
        max: capacityResult.estimatedCapacity.max,
        confidence: capacityResult.detectionResults.confidence
      };

      // Store in database
      await storeSubstationData(substation, capacityResult);

      return capacityEstimate;
    } catch (error) {
      console.error(`Failed to analyze ${substation.name}:`, error);
      throw error;
    }
  };

  const storeSubstationData = async (substation: DiscoveredSubstation, capacityResult: any) => {
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
          voltage_level: 'Estimated',
          utility_owner: 'Unknown',
          interconnection_type: capacityResult.substationType || 'unknown',
          load_factor: 0.75,
          status: 'active',
          coordinates_source: 'google_maps_grid_search'
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
    searchGridCell,
    analyzeSubstationCapacity,
    storeSubstationData,
    extractCityFromAddress,
    extractStateFromAddress
  };
}
