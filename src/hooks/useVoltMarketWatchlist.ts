
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

export interface WatchlistItem {
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
  const { user } = useVoltMarketAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voltmarket_watchlist')
        .select(`
          *,
          listing:voltmarket_listings(id, title, location, asking_price, status)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
        return;
      }

      setWatchlist(data || []);
    } catch (error) {
      console.error('Error in fetchWatchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (listingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('voltmarket_watchlist')
        .insert({
          user_id: user.id,
          listing_id: listingId
        });

      if (error) {
        console.error('Error adding to watchlist:', error);
        return false;
      }

      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error in addToWatchlist:', error);
      return false;
    }
  };

  const removeFromWatchlist = async (listingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('voltmarket_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) {
        console.error('Error removing from watchlist:', error);
        return false;
      }

      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error in removeFromWatchlist:', error);
      return false;
    }
  };

  const isInWatchlist = (listingId: string) => {
    return watchlist.some(item => item.listing_id === listingId);
  };

  const toggleWatchlist = async (listingId: string) => {
    if (isInWatchlist(listingId)) {
      return await removeFromWatchlist(listingId);
    } else {
      return await addToWatchlist(listingId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    refreshWatchlist: fetchWatchlist
  };
};
