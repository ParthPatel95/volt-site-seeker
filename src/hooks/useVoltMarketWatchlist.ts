
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

interface WatchlistItem {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    location: string;
    asking_price: number;
    status: string;
  };
}

export const useVoltMarketWatchlist = () => {
  const { profile } = useVoltMarketAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('voltmarket_watchlist')
        .select(`
          *,
          listing:voltmarket_listings(
            id,
            title,
            location,
            asking_price,
            status
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (listingId: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('voltmarket_watchlist')
        .insert({
          user_id: profile.id,
          listing_id: listingId
        });

      if (error) throw error;
      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  };

  const removeFromWatchlist = async (listingId: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('voltmarket_watchlist')
        .delete()
        .eq('user_id', profile.id)
        .eq('listing_id', listingId);

      if (error) throw error;
      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  const toggleWatchlist = async (listingId: string) => {
    if (isInWatchlist(listingId)) {
      return await removeFromWatchlist(listingId);
    } else {
      return await addToWatchlist(listingId);
    }
  };

  const isInWatchlist = (listingId: string) => {
    return watchlist.some(item => item.listing_id === listingId);
  };

  useEffect(() => {
    if (profile) {
      fetchWatchlist();
    }
  }, [profile]);

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    fetchWatchlist
  };
};
