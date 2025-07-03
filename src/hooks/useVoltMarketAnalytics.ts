
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);

  const trackUserActivity = async (activityType: string, activityData?: any) => {
    try {
      await supabase
        .from('voltmarket_user_activity')
        .insert({
          activity_type: activityType,
          activity_data: activityData,
          ip_address: null, // Would need to get from request in real implementation
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Failed to track user activity:', error);
    }
  };

  const getDashboardAnalytics = async (): Promise<{ data: AnalyticsData | null; error: any }> => {
    setLoading(true);
    try {
      // Get listings count
      const { count: totalListings } = await supabase
        .from('voltmarket_listings')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase
        .from('voltmarket_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get users count
      const { count: totalUsers } = await supabase
        .from('voltmarket_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedUsers } = await supabase
        .from('voltmarket_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_id_verified', true);

      // Get transactions count
      const { count: totalTransactions } = await supabase
        .from('voltmarket_transactions')
        .select('*', { count: 'exact', head: true });

      // Get popular locations
      const { data: locations } = await supabase
        .from('voltmarket_listings')
        .select('location')
        .eq('status', 'active');

      const locationCounts = locations?.reduce((acc, listing) => {
        acc[listing.location] = (acc[listing.location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const popularLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }));

      // Get listing categories
      const { data: categories } = await supabase
        .from('voltmarket_listings')
        .select('listing_type')
        .eq('status', 'active');

      const categoryCounts = categories?.reduce((acc, listing) => {
        acc[listing.listing_type] = (acc[listing.listing_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const listingCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }));

      const analyticsData: AnalyticsData = {
        total_listings: totalListings || 0,
        active_listings: activeListings || 0,
        total_users: totalUsers || 0,
        verified_users: verifiedUsers || 0,
        total_transactions: totalTransactions || 0,
        revenue_trends: [], // Would need more complex queries for trends
        popular_locations: popularLocations,
        listing_categories: listingCategories
      };

      return { data: analyticsData, error: null };
    } catch (error) {
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
