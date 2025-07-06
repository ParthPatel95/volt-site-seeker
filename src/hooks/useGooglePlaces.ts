import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface GeocodeResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const searchPlaces = useCallback(async (input: string, types: string = 'address') => {
    if (!input || input.trim().length < 2) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('places-autocomplete', {
        body: { input: input.trim(), types }
      });

      if (error) throw error;

      if (data.success) {
        setPredictions(data.predictions || []);
      } else {
        console.error('Places search failed:', data.error);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setPredictions([]);
      toast({
        title: "Search Error",
        description: "Failed to search for places. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const geocodeAddress = useCallback(async (address: string, placeId?: string): Promise<GeocodeResult | null> => {
    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-location', {
        body: { address, placeId }
      });

      if (error) throw error;

      if (data.success) {
        return {
          coordinates: data.coordinates,
          formattedAddress: data.formattedAddress
        };
      } else {
        console.error('Geocoding failed:', data.error);
        toast({
          title: "Location Error",
          description: data.error || "Failed to find location coordinates.",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast({
        title: "Geocoding Error",
        description: "Failed to get location coordinates. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, [toast]);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  return {
    predictions,
    isSearching,
    isGeocoding,
    searchPlaces,
    geocodeAddress,
    clearPredictions
  };
};