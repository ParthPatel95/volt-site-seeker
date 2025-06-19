
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsConfig {
  apiKey: string | null;
  loading: boolean;
  error: string | null;
}

export function useGoogleMapsConfig(): GoogleMapsConfig {
  const [config, setConfig] = useState<GoogleMapsConfig>({
    apiKey: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-config');
        
        if (error) throw error;
        
        setConfig({
          apiKey: data.apiKey,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error fetching Google Maps config:', error);
        setConfig({
          apiKey: null,
          loading: false,
          error: error.message || 'Failed to fetch Google Maps configuration'
        });
      }
    };

    fetchConfig();
  }, []);

  return config;
}
