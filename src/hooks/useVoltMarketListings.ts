
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type VoltMarketListingStatus = Database['public']['Enums']['voltmarket_listing_status'];

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
  const [userListings, setUserListings] = useState<VoltMarketListing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = useCallback(async () => {
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
  }, []);

  const fetchUserListings = useCallback(async (sellerId: string) => {
    console.log('Fetching user listings for seller ID:', sellerId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      console.log('User listings query result:', { data, error, sellerId });

      if (error) throw error;
      setUserListings(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching user listings:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('voltmarket_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      
      // Remove from local state
      setUserListings(prev => prev.filter(listing => listing.id !== listingId));
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting listing:', error);
      return { success: false, error };
    }
  }, []);

  const updateListingStatus = useCallback(async (listingId: string, status: VoltMarketListingStatus) => {
    try {
      const { error } = await supabase
        .from('voltmarket_listings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw error;
      
      // Update local state
      const updateListing = (listing: VoltMarketListing) => 
        listing.id === listingId ? { ...listing, status } : listing;
      
      setUserListings(prev => prev.map(updateListing));
      setListings(prev => prev.map(updateListing));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating listing status:', error);
      return { success: false, error };
    }
  }, []);

  const searchListings = useCallback(async (criteria: any) => {
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
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    userListings,
    loading,
    fetchListings,
    fetchUserListings,
    searchListings,
    deleteListing,
    updateListingStatus
  };
};
