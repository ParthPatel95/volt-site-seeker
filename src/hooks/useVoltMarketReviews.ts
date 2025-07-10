
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

interface Review {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  review_text: string | null;
  transaction_verified: boolean;
  created_at: string;
  reviewer: {
    company_name: string;
    profile_image_url: string | null;
  };
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: { [key: number]: number };
}

export const useVoltMarketReviews = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const createReview = async (reviewData: {
    listing_id: string;
    reviewed_user_id: string;
    rating: number;
    review_text?: string;
    transaction_verified?: boolean;
  }) => {
    if (!profile) throw new Error('Must be logged in to create review');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('voltmarket_reviews')
        .insert({
          ...reviewData,
          reviewer_id: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getReviewsForUser = async (userId: string): Promise<{ data: Review[] | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_reviews')
        .select(`
          *,
          reviewer:voltmarket_profiles!reviewer_id(company_name, profile_image_url)
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const getReviewStats = async (userId: string): Promise<{ data: ReviewStats | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_reviews')
        .select('rating')
        .eq('reviewed_user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { 
          data: { average_rating: 0, total_reviews: 0, rating_distribution: {} }, 
          error: null 
        };
      }

      const total_reviews = data.length;
      const average_rating = data.reduce((sum, review) => sum + review.rating, 0) / total_reviews;
      
      const rating_distribution = data.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      return { 
        data: { average_rating, total_reviews, rating_distribution }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    loading,
    createReview,
    getReviewsForUser,
    getReviewStats
  };
};
