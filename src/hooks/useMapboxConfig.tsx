import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MapboxConfig {
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export function useMapboxConfig(): MapboxConfig {
  const [config, setConfig] = useState<MapboxConfig>({
    accessToken: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-config');
        
        if (error) throw error;
        
        setConfig({
          accessToken: data.accessToken,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error fetching Mapbox config:', error);
        setConfig({
          accessToken: null,
          loading: false,
          error: error.message || 'Failed to fetch Mapbox configuration'
        });
      }
    };

    fetchConfig();
  }, []);

  return config;
}
