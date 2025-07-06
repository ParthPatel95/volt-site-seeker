
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

interface AnalyticsData {
  total_listings: number;
  active_listings: number;
  total_users: number;
  verified_users: number;
  total_transactions: number;
  revenue_trends: any[];
  popular_locations: any[];
  listing_categories: any[];
}

export const useVoltMarketAnalytics = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const trackUserActivity = async (activityType: string, activityData?: any) => {
    if (!profile) return;
    
    try {
      // Track activity in voltmarket_analytics table instead
      const currentDate = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('voltmarket_analytics')
        .upsert({
          metric_type: activityType,
          metric_value: { 
            user_id: profile.id,
            data: activityData,
            timestamp: new Date().toISOString()
          },
          date_recorded: currentDate
        }, {
          onConflict: 'metric_type,date_recorded'
        });
    } catch (error) {
      console.error('Failed to track user activity:', error);
    }
  };

  const getDashboardAnalytics = async (): Promise<{ data: AnalyticsData | null; error: any }> => {
    setLoading(true);
    try {
      // Get listings count
      const { count: totalListings, error: listingsError } = await supabase
        .from('voltmarket_listings')
        .select('*', { count: 'exact', head: true });

      if (listingsError) throw listingsError;

      const { count: activeListings, error: activeListingsError } = await supabase
        .from('voltmarket_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeListingsError) throw activeListingsError;

      // Get users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('voltmarket_profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      const { count: verifiedUsers, error: verifiedUsersError } = await supabase
        .from('voltmarket_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_id_verified', true);

      if (verifiedUsersError) throw verifiedUsersError;

      // Get transactions count (fallback to 0 if table doesn't exist)
      let totalTransactions = 0;
      try {
        const { count } = await supabase
          .from('voltmarket_transactions')
          .select('*', { count: 'exact', head: true });
        totalTransactions = count || 0;
      } catch (error) {
        console.warn('Transactions table not accessible:', error);
      }

      // Get popular locations
      const { data: locations, error: locationsError } = await supabase
        .from('voltmarket_listings')
        .select('location')
        .eq('status', 'active');

      if (locationsError) throw locationsError;

      const locationCounts = locations?.reduce((acc, listing) => {
        if (listing.location) {
          acc[listing.location] = (acc[listing.location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const popularLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }));

      // Get listing categories
      const { data: categories, error: categoriesError } = await supabase
        .from('voltmarket_listings')
        .select('listing_type')
        .eq('status', 'active');

      if (categoriesError) throw categoriesError;

      const categoryCounts = categories?.reduce((acc, listing) => {
        if (listing.listing_type) {
          acc[listing.listing_type] = (acc[listing.listing_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const listingCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }));

      const analyticsData: AnalyticsData = {
        total_listings: totalListings || 0,
        active_listings: activeListings || 0,
        total_users: totalUsers || 0,
        verified_users: verifiedUsers || 0,
        total_transactions: totalTransactions,
        revenue_trends: [],
        popular_locations: popularLocations,
        listing_categories: listingCategories
      };

      return { data: analyticsData, error: null };
    } catch (error) {
      console.error('Analytics error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    trackUserActivity,
    getDashboardAnalytics
  };
};
