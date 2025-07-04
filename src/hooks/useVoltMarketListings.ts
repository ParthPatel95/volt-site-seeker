
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoltMarketListing {
  id: string;
  title: string;
  description: string;
  asking_price: number;
  location: string;
  listing_type: string;
  power_capacity_mw: number;
  status: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export const useVoltMarketListings = () => {
  const [listings, setListings] = useState<VoltMarketListing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchListings = async (criteria: any) => {
    setLoading(true);
    try {
      let query = supabase
        .from('voltmarket_listings')
        .select('*')
        .eq('status', 'active');

      // Apply search filters
      if (criteria.keyword) {
        query = query.or(`title.ilike.%${criteria.keyword}%,description.ilike.%${criteria.keyword}%`);
      }

      if (criteria.listingType && criteria.listingType !== 'all') {
        query = query.eq('listing_type', criteria.listingType);
      }

      if (criteria.location) {
        query = query.ilike('location', `%${criteria.location}%`);
      }

      if (criteria.minPrice) {
        query = query.gte('asking_price', criteria.minPrice);
      }

      if (criteria.maxPrice) {
        query = query.lte('asking_price', criteria.maxPrice);
      }

      if (criteria.minCapacity) {
        query = query.gte('power_capacity_mw', criteria.minCapacity);
      }

      if (criteria.maxCapacity) {
        query = query.lte('power_capacity_mw', criteria.maxCapacity);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching listings:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    fetchListings,
    searchListings
  };
};
