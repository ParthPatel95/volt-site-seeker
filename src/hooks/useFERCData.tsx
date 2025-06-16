
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface InterconnectionQueueItem {
  queue_id: string;
  project_name: string;
  capacity_mw: number;
  technology_type: string;
  transmission_owner: string;
  interconnection_date: string;
  status: string;
  county: string;
  state: string;
  estimated_cost: number;
  queue_position: number;
}

export interface InterconnectionQueueData {
  queue_items: InterconnectionQueueItem[];
  summary: {
    total_projects: number;
    total_capacity_mw: number;
    solar_capacity_mw: number;
    wind_capacity_mw: number;
    storage_capacity_mw: number;
    other_capacity_mw: number;
    average_queue_time_months: number;
  };
  last_updated: string;
}

export interface GeneratorData {
  generators: Array<{
    plant_id: string;
    plant_name: string;
    operator: string;
    capacity_mw: number;
    fuel_type: string;
    commercial_date: string;
    latitude: number;
    longitude: number;
    county: string;
    state: string;
  }>;
  timestamp: string;
}

export function useFERCData() {
  const [interconnectionQueue, setInterconnectionQueue] = useState<InterconnectionQueueData | null>(null);
  const [generatorData, setGeneratorData] = useState<GeneratorData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFERCData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching FERC data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('ferc-data-integration', {
        body: {
          action: dataType
        }
      });

      if (error) {
        console.error('FERC API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch FERC data');
      }

      console.log('FERC data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching FERC data:', error);
      
      toast({
        title: "Error",
        description: "Failed to fetch FERC data",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getInterconnectionQueue = async () => {
    const data = await fetchFERCData('fetch_interconnection_queue');
    if (data) {
      setInterconnectionQueue(data);
    }
    return data;
  };

  const getGeneratorData = async () => {
    const data = await fetchFERCData('fetch_generator_data');
    if (data) {
      setGeneratorData(data);
    }
    return data;
  };

  const getTransmissionLines = async () => {
    return await fetchFERCData('fetch_transmission_lines');
  };

  useEffect(() => {
    getInterconnectionQueue();
    getGeneratorData();
  }, []);

  return {
    interconnectionQueue,
    generatorData,
    loading,
    getInterconnectionQueue,
    getGeneratorData,
    getTransmissionLines,
    refetch: () => {
      getInterconnectionQueue();
      getGeneratorData();
    }
  };
}
