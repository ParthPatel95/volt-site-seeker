
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PowerData {
  totalProperties: number;
  totalPowerCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

export function usePowerData() {
  const [powerData, setPowerData] = useState<PowerData>({
    totalProperties: 0,
    totalPowerCapacity: 0,
    averageCapacity: 0,
    highCapacityCount: 0
  });
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPowerData = async () => {
    try {
      console.log('Loading power infrastructure data...');
      
      // Load properties with power capacity data
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, city, state, power_capacity_mw, substation_distance_miles, status')
        .not('power_capacity_mw', 'is', null)
        .order('power_capacity_mw', { ascending: false });

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
        toast({
          title: "Error Loading Data",
          description: propertiesError.message,
          variant: "destructive"
        });
        return;
      }

      const properties = propertiesData || [];
      setProperties(properties);

      // Calculate power statistics
      const totalPowerCapacity = properties.reduce((sum, prop) => 
        sum + (Number(prop.power_capacity_mw) || 0), 0
      );
      
      const averageCapacity = properties.length > 0 
        ? totalPowerCapacity / properties.length 
        : 0;
      
      const highCapacityCount = properties.filter(prop => 
        Number(prop.power_capacity_mw) >= 20
      ).length;

      setPowerData({
        totalProperties: properties.length,
        totalPowerCapacity,
        averageCapacity,
        highCapacityCount
      });

      console.log('Power data loaded:', {
        totalProperties: properties.length,
        totalPowerCapacity,
        averageCapacity,
        highCapacityCount
      });

    } catch (error) {
      console.error('Error loading power data:', error);
      toast({
        title: "Error",
        description: "Failed to load power infrastructure data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPowerData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'default' as const;
      case 'under_review':
      case 'analyzing':
        return 'secondary' as const;
      case 'acquired':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return {
    powerData,
    properties,
    loading,
    getStatusColor
  };
}
