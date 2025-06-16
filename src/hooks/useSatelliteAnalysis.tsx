
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SatelliteAnalysisRequest {
  action: 'discover_substations' | 'analyze_infrastructure' | 'validate_location';
  region?: string;
  coordinates?: { lat: number; lng: number; radius?: number };
  imageUrl?: string;
  analysisType?: 'transmission' | 'substation' | 'power_plant' | 'solar_farm';
}

interface SubstationDiscovery {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  confidence_score: number;
  voltage_indicators: string[];
  capacity_estimate: string;
  infrastructure_features: string[];
  satellite_timestamp: string;
  analysis_method: string;
  verification_status: 'pending' | 'confirmed' | 'rejected';
  image_analysis?: {
    image_url: string;
    ai_notes: string;
    detection_confidence: number;
  };
}

export function useSatelliteAnalysis() {
  const [loading, setLoading] = useState(false);
  const [discoveries, setDiscoveries] = useState<SubstationDiscovery[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const performAnalysis = async (request: SatelliteAnalysisRequest) => {
    setLoading(true);
    try {
      console.log('Performing real satellite analysis:', request);
      
      const { data, error } = await supabase.functions.invoke('satellite-analysis', {
        body: request
      });

      if (error) throw error;

      if (request.action === 'discover_substations') {
        setDiscoveries(data.discoveries || []);
        toast({
          title: "Real Discovery Complete",
          description: `Found ${data.discoveries?.length || 0} potential substations using Google Maps + AI`,
        });
      } else {
        setAnalysis(data.analysis || data.validation);
        toast({
          title: "Real Analysis Complete",
          description: `${request.action} completed using satellite imagery`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Satellite analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to perform satellite analysis",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const discoverSubstations = async (region?: string, coordinates?: { lat: number; lng: number; radius?: number }) => {
    return performAnalysis({
      action: 'discover_substations',
      region,
      coordinates
    });
  };

  const analyzeInfrastructure = async (
    coordinates: { lat: number; lng: number }, 
    analysisType?: 'transmission' | 'substation' | 'power_plant' | 'solar_farm'
  ) => {
    return performAnalysis({
      action: 'analyze_infrastructure',
      coordinates,
      analysisType
    });
  };

  const validateLocation = async (coordinates: { lat: number; lng: number }, imageUrl?: string) => {
    return performAnalysis({
      action: 'validate_location',
      coordinates,
      imageUrl
    });
  };

  return {
    loading,
    discoveries,
    analysis,
    discoverSubstations,
    analyzeInfrastructure,
    validateLocation,
    setDiscoveries,
    setAnalysis
  };
}
