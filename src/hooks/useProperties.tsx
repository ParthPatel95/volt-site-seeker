
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  status: string;
  square_footage?: number;
  lot_size_acres?: number;
  asking_price?: number;
  price_per_sqft?: number;
  year_built?: number;
  power_capacity_mw?: number;
  substation_distance_miles?: number;
  transmission_access: boolean;
  zoning?: string;
  description?: string;
  listing_url?: string;
  source: string;
  discovered_at: string;
  created_at: string;
  volt_scores?: Array<{
    overall_score: number;
    location_score: number;
    power_score: number;
    infrastructure_score: number;
    financial_score: number;
    risk_score: number;
    calculated_at: string;
  }>;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          volt_scores (
            overall_score,
            location_score,
            power_score,
            infrastructure_score,
            financial_score,
            risk_score,
            calculated_at
          )
        `)
        .order('discovered_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
  };
}
