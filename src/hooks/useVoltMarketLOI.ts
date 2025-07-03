
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

export interface LOIData {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offering_price: number;
  proposed_terms: string;
  due_diligence_period_days: number;
  contingencies?: string;
  financing_details?: string;
  closing_timeline: string;
  buyer_qualifications: string;
  additional_notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  updated_at: string;
}

export const useVoltMarketLOI = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const submitLOI = async (listingId: string, loiData: any) => {
    if (!profile) throw new Error('Not authenticated');

    setLoading(true);
    try {
      // Get listing details to find seller
      const { data: listing, error: listingError } = await supabase
        .from('voltmarket_listings')
        .select('seller_id, asking_price')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Create LOI record in the proper table using any type to bypass TypeScript error
      const { data: loiRecord, error: loiError } = await (supabase as any)
        .from('voltmarket_lois')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: listing.seller_id,
          status: 'pending',
          offering_price: loiData.offering_price,
          proposed_terms: loiData.proposed_terms,
          due_diligence_period_days: loiData.due_diligence_period_days,
          contingencies: loiData.contingencies,
          financing_details: loiData.financing_details,
          closing_timeline: loiData.closing_timeline,
          buyer_qualifications: loiData.buyer_qualifications,
          additional_notes: loiData.additional_notes,
        })
        .select()
        .single();

      if (loiError) throw loiError;

      // Also create a message notification for the seller
      const { error: messageError } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: listing.seller_id,
          message: `New LOI Submitted - Offering Price: $${loiData.offering_price.toLocaleString()}\n\nTerms: ${loiData.proposed_terms}\n\nBuyer Qualifications: ${loiData.buyer_qualifications}`,
          is_read: false
        });

      if (messageError) throw messageError;

      return { success: true, data: loiRecord };
    } catch (error) {
      console.error('Error submitting LOI:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getLOIs = async () => {
    if (!profile) return [];

    try {
      // Use any type to bypass TypeScript error until types are regenerated
      const { data, error } = await (supabase as any)
        .from('voltmarket_lois')
        .select(`
          *,
          listing:voltmarket_listings(title, asking_price),
          buyer:voltmarket_profiles!buyer_id(company_name),
          seller:voltmarket_profiles!seller_id(company_name)
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching LOIs:', error);
      return [];
    }
  };

  const updateLOIStatus = async (loiId: string, status: 'accepted' | 'rejected' | 'countered') => {
    if (!profile) throw new Error('Not authenticated');

    try {
      // Use any type to bypass TypeScript error until types are regenerated
      const { data, error } = await (supabase as any)
        .from('voltmarket_lois')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', loiId)
        .eq('seller_id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating LOI status:', error);
      throw error;
    }
  };

  return {
    submitLOI,
    getLOIs,
    updateLOIStatus,
    loading
  };
};
